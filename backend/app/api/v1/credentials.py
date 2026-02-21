"""Credential routes: issue, update, revoke, verify, list."""
from uuid import UUID

from fastapi import APIRouter, Depends, Response

from app.api.deps import CurrentUser, DBSession, InstitutionAdmin
from app.schemas.common import SuccessResponse
from app.schemas.credential import (
    CredentialCreate,
    CredentialResponse,
    CredentialUpdate,
    CredentialVerifyRequest,
    CredentialVerifyResponse,
    RevokeRequest,
    VisibilityUpdate,
)
from app.services.credential_service import CredentialService

router = APIRouter(prefix="/credentials", tags=["Credentials"])


@router.get("/{credential_id}/apple-wallet")
async def get_apple_wallet_pass(credential_id: UUID, user: CurrentUser, db: DBSession):
    svc = CredentialService(db)
    pass_data = await svc.generate_apple_pass(credential_id, user.id)
    return Response(content=pass_data, media_type="application/vnd.apple.pkpass")

@router.get("/{credential_id}/google-wallet")
async def get_google_wallet_pass(credential_id: UUID, user: CurrentUser, db: DBSession):
    svc = CredentialService(db)
    jwt_token = await svc.generate_google_pass(credential_id, user.id)
    return {"jwt": jwt_token, "save_url": f"https://pay.google.com/gp/v/save/{jwt_token}"}

@router.post("/", response_model=CredentialResponse, status_code=201)
async def issue_credential(
    body: CredentialCreate,
    admin: InstitutionAdmin,
    db: DBSession,
):
    svc = CredentialService(db)
    cred = await svc.issue(body, admin)
    return cred


@router.get("/me", response_model=list[CredentialResponse])
async def list_my_credentials(user: CurrentUser, db: DBSession):
    svc = CredentialService(db)
    return await svc.list_student_credentials(user.id)


@router.get("/{credential_id}", response_model=CredentialResponse)
async def get_credential(credential_id: UUID, user: CurrentUser, db: DBSession):
    svc = CredentialService(db)
    return await svc.get_credential(credential_id)


@router.patch("/{credential_id}", response_model=CredentialResponse)
async def update_credential(
    credential_id: UUID,
    body: CredentialUpdate,
    admin: InstitutionAdmin,
    db: DBSession,
):
    svc = CredentialService(db)
    return await svc.update_credential(credential_id, body, admin)


@router.post("/{credential_id}/revoke", response_model=SuccessResponse)
async def revoke_credential(
    credential_id: UUID,
    body: RevokeRequest,
    admin: InstitutionAdmin,
    db: DBSession,
):
    svc = CredentialService(db)
    await svc.revoke(credential_id, body.reason, admin)
    return SuccessResponse(message="Credential revoked.")


@router.post("/verify", response_model=CredentialVerifyResponse)
async def verify_credential(body: CredentialVerifyRequest, db: DBSession):
    """Public endpoint: verify a credential's integrity."""
    svc = CredentialService(db)
    return await svc.verify_credential(body.credential_id, body.payload_hash, body.signature)
