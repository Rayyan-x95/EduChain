"""Seed initial data for development."""
import asyncio
from uuid import uuid4

from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.institution import Institution
from app.models.user import User
from app.core.security import hash_password


async def init_db():
    """Create default institution and platform admin if they don't exist."""
    async with async_session_factory() as session:
        # Check for existing institution
        result = await session.execute(
            select(Institution).where(Institution.slug == "demo-university")
        )
        if result.scalar_one_or_none():
            print("Database already seeded.")
            return

        # Create demo institution
        institution = Institution(
            id=uuid4(),
            name="Demo University",
            slug="demo-university",
            domain="demo.edu",
            tier="campus",
            max_students=2000,
            is_active=True,
        )
        session.add(institution)

        # Create platform admin
        admin = User(
            id=uuid4(),
            institution_id=institution.id,
            email="admin@demo.edu",
            password_hash=hash_password("Admin@123"),
            full_name="Platform Admin",
            user_type="PLATFORM_ADMIN",
            status="VERIFIED",
            email_verified=True,
        )
        session.add(admin)

        await session.commit()
        print(f"Seeded institution: {institution.slug}")
        print(f"Seeded admin: {admin.email}")


if __name__ == "__main__":
    asyncio.run(init_db())
