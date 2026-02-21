import asyncio
import sys
import os
from datetime import datetime, timezone

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.session import async_session_factory
from app.models.user import User
from app.models.institution import Institution
from app.models.role import Role
from app.core.security import hash_password

async def seed_db():
    async with async_session_factory() as session:
        # Check if admin already exists
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == "admin@edulink.dev"))
        admin = result.scalar_one_or_none()
        
        if admin:
            print("Admin user already exists. Skipping seed.")
            return

        print("Seeding database...")

        # 1. Create an Institution
        institution = Institution(
            name="EduLink Global University",
            slug="edulink-global",
            domain="edulink.dev",
            is_active=True,
            tier="enterprise",
            max_students=10000
        )
        session.add(institution)
        await session.flush()  # Get institution.id

        # 2. Create Super Admin User
        admin_user = User(
            email="admin@edulink.dev",
            password_hash=hash_password("admin123"),
            full_name="System Admin",
            institution_id=institution.id,
            user_type="ADMIN",
            status="ACTIVE",
            email_verified=True,
            verified_at=datetime.now(timezone.utc)
        )
        session.add(admin_user)
        await session.flush()

        # 3. Assign Admin Role
        admin_role = Role(
            institution_id=institution.id,
            user_id=admin_user.id,
            role="ADMIN",
            assigned_at=datetime.now(timezone.utc),
            is_active=True
        )
        session.add(admin_role)

        await session.commit()
        print("Database seeded successfully!")
        print("Admin Email: admin@edulink.dev")
        print("Admin Password: admin123")

if __name__ == "__main__":
    asyncio.run(seed_db())
