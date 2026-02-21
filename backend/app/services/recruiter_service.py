"""Recruiter service: search students, bulk verify."""
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.credential_repository import CredentialRepository
from app.repositories.endorsement_repository import EndorsementRepository
from app.repositories.institution_repository import InstitutionRepository
from app.repositories.reputation_repository import ReputationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.recruiter import StudentSearchResult
from app.services.credential_service import CredentialService


class RecruiterService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.institution_repo = InstitutionRepository(db)
        self.cred_repo = CredentialRepository(db)
        self.endorsement_repo = EndorsementRepository(db)
        self.reputation_repo = ReputationRepository(db)
        self.credential_service = CredentialService(db)

    async def search_students(
        self,
        program: str | None = None,
        min_reputation: float | None = None,
        institution_slug: str | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> dict:
        institution_id = None
        if institution_slug:
            inst = await self.institution_repo.get_by_slug(institution_slug)
            if inst:
                institution_id = inst.id

        offset = (page - 1) * per_page
        students = await self.user_repo.search_verified_students(
            institution_id=institution_id,
            program=program,
            min_reputation=min_reputation,
            offset=offset,
            limit=per_page,
        )

        results = []
        for s in students:
            rep = await self.reputation_repo.get_by_user(s.id, s.institution_id)
            cred_count = await self.cred_repo.count_by_student(s.id)
            endorsement_count = await self.endorsement_repo.count_received(s.id)
            inst = s.institution

            results.append(
                StudentSearchResult(
                    id=s.id,
                    full_name=s.full_name,
                    program=s.program,
                    institution=inst.name if inst else "Unknown",
                    reputation_score=float(rep.total_score) if rep else 0,
                    credential_count=cred_count,
                    endorsement_count=endorsement_count,
                    github_verified=s.github_username is not None,
                )
            )

        return {
            "students": [r.model_dump() for r in results],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": len(results),
                "total_pages": 1,
            },
        }

    async def bulk_verify(self, credential_ids: list[uuid.UUID]) -> list[dict]:
        results = []
        for cid in credential_ids:
            # We'll use empty strings for hash/sig to get basic status check
            cred = await self.cred_repo.get_by_id(cid)
            if cred:
                results.append({
                    "credential_id": str(cid),
                    "title": cred.title,
                    "status": cred.status,
                    "valid": cred.status == "ACTIVE",
                })
            else:
                results.append({
                    "credential_id": str(cid),
                    "valid": False,
                    "reason": "Not found",
                })
        return results
