"""Email service: async email sending via aiosmtplib."""
import logging
from email.message import EmailMessage

import aiosmtplib

from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    async def send(to: str, subject: str, body_html: str) -> bool:
        if not settings.SMTP_HOST:
            logger.warning("SMTP not configured – email not sent to %s", to)
            return False

        msg = EmailMessage()
        msg["From"] = settings.SMTP_FROM or f"noreply@{settings.SMTP_HOST}"
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body_html, subtype="html")

        try:
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER or None,
                password=settings.SMTP_PASSWORD or None,
                start_tls=True,
            )
            logger.info("Email sent to %s (subject=%s)", to, subject)
            return True
        except Exception:
            logger.exception("Failed to send email to %s", to)
            return False

    @classmethod
    async def send_verification_email(cls, to: str, token: str) -> bool:
        link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        html = f"""
        <h2>Verify your email</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="{link}">Verify Email</a>
        <p>This link is valid for 24 hours.</p>
        """
        return await cls.send(to, "Verify your EduLink email", html)

    @classmethod
    async def send_status_update_email(
        cls, to: str, full_name: str, new_status: str
    ) -> bool:
        html = f"""
        <h2>Status Update</h2>
        <p>Hi {full_name},</p>
        <p>Your verification status has been updated to: <strong>{new_status}</strong></p>
        """
        return await cls.send(to, "EduLink – Status Update", html)

    @classmethod
    async def send_appeal_result_email(
        cls, to: str, full_name: str, result: str, notes: str | None = None
    ) -> bool:
        html = f"""
        <h2>Appeal Result</h2>
        <p>Hi {full_name},</p>
        <p>Your appeal has been <strong>{result.lower()}</strong>.</p>
        {"<p>Reviewer notes: " + notes + "</p>" if notes else ""}
        """
        return await cls.send(to, "EduLink – Appeal Result", html)
