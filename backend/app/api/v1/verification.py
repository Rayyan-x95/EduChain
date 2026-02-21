"""QR Verification routes."""
from fastapi import APIRouter, Request, Depends, HTTPException
import urllib.parse

from app.api.deps import CurrentUser, CurrentUserOptional, DBSession, verify_mobile_attestation
from app.schemas.verification import QRTokenResponse, QRValidateRequest, QRValidateResponse
from app.services.verification_service import VerificationService
from app.core.rate_limiter import rate_limiter
from app.config import settings

router = APIRouter(prefix="/verification", tags=["QR Verification"])


@router.post("/qr/generate", response_model=QRTokenResponse, dependencies=[Depends(verify_mobile_attestation)])
async def generate_qr_token(user: CurrentUser, db: DBSession):
    svc = VerificationService(db)
    result = await svc.generate_qr_token(user)
    return QRTokenResponse(
        qr_token=result["qr_token"],
        short_code=result.get("short_code"),
        expires_at=result["expires_at"],
        ttl_seconds=result["ttl_seconds"],
    )


@router.post("/qr/validate", response_model=QRValidateResponse)
async def validate_qr_token(body: QRValidateRequest, request: Request, user: CurrentUserOptional, db: DBSession):
    # Handle NAT/Proxies for IP securely
    client_host = request.client.host if request.client else "unknown"
    
    if client_host in settings.TRUSTED_PROXIES:
        forwarded_for = request.headers.get("X-Forwarded-For")
        ip = forwarded_for.split(",")[0].strip() if forwarded_for else client_host
    else:
        ip = client_host
    
    # Rate limit short-code attempts by IP (max 10 per minute)
    if len(body.qr_token) == 6 and body.qr_token.isalnum():
        is_limited = await rate_limiter.is_rate_limited(f"rl:shortcode:{ip}", max_requests=10, window_seconds=60)
        if is_limited:
            raise HTTPException(status_code=429, detail="Too many short-code validation attempts")

    svc = VerificationService(db)
    
    # Check if it's a wallet QR (starts with edulink://verify/wallet/)
    if body.qr_token.startswith("edulink://verify/wallet/"):
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required for wallet QR validation")
        
        parsed = urllib.parse.urlparse(body.qr_token)
        path_segments = [seg for seg in parsed.path.strip("/").split("/") if seg]
        if len(path_segments) != 3 or path_segments[0] != "verify" or path_segments[1] != "wallet":
            raise HTTPException(status_code=400, detail="Invalid wallet QR format")
        
        credential_id = path_segments[2]
        if not credential_id:
            raise HTTPException(status_code=400, detail="Missing credential ID in wallet QR")
            
        verifier_id = str(user.id)
        result = await svc.validate_wallet_qr(credential_id, verifier_id, verifier_ip=ip)
    else:
        result = await svc.validate_qr_token(body.qr_token, verifier_ip=ip)
        
    return QRValidateResponse(**result)
