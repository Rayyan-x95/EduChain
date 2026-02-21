"""QR Verification routes."""
from fastapi import APIRouter, Request, Depends

from app.api.deps import CurrentUser, DBSession, verify_mobile_attestation
from app.schemas.verification import QRTokenResponse, QRValidateRequest, QRValidateResponse
from app.services.verification_service import VerificationService

router = APIRouter(prefix="/verification", tags=["QR Verification"])


@router.post("/qr/generate", response_model=QRTokenResponse, dependencies=[Depends(verify_mobile_attestation)])
async def generate_qr_token(user: CurrentUser, db: DBSession):
    svc = VerificationService(db)
    result = await svc.generate_qr_token(user)
    return QRTokenResponse(
        qr_token=result["qr_token"],
        expires_at=result["expires_at"],
        ttl_seconds=result["ttl_seconds"],
    )


@router.post("/qr/validate", response_model=QRValidateResponse)
async def validate_qr_token(body: QRValidateRequest, request: Request, db: DBSession):
    svc = VerificationService(db)
    ip = request.client.host if request.client else None
    result = await svc.validate_qr_token(body.qr_token, verifier_ip=ip)
    return QRValidateResponse(**result)
