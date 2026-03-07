import { Resend } from 'resend';
import { env } from '../config/env';
import pino from 'pino';

const logger = pino({ name: 'email' });

let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (resend) return resend;

  if (!env.RESEND_API_KEY) {
    logger.warn('Resend API key not configured — email disabled');
    return null;
  }

  resend = new Resend(env.RESEND_API_KEY);
  return resend;
}

/** Escape HTML entities to prevent XSS in email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send a transactional email via Resend.
 * Gracefully no-ops if Resend is not configured (dev environment).
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const client = getResendClient();
  if (!client) {
    logger.info({ to: options.to, subject: options.subject }, 'Email skipped (Resend not configured)');
    return;
  }

  try {
    await client.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info({ to: options.to, subject: options.subject }, 'Email sent');
  } catch (error) {
    logger.error({ error, to: options.to }, 'Failed to send email');
  }
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

export async function sendVerificationEmail(to: string, studentName: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'EduChain — Student Verification Submitted',
    html: `
      <h2>Verification Request Submitted</h2>
      <p>Hi ${escapeHtml(studentName)},</p>
      <p>Your student verification request has been submitted and is being reviewed by your institution.</p>
      <p>You'll receive an update once it has been processed.</p>
      <br/>
      <p>— The EduChain Team</p>
    `,
  });
}

export async function sendCredentialIssuedEmail(
  to: string,
  studentName: string,
  credentialTitle: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: `EduChain — New Credential Issued: ${escapeHtml(credentialTitle)}`,
    html: `
      <h2>New Credential Issued</h2>
      <p>Hi ${escapeHtml(studentName)},</p>
      <p>A new credential <strong>"${escapeHtml(credentialTitle)}"</strong> has been issued to your EduChain profile.</p>
      <p>Log in to view and share your credential.</p>
      <br/>
      <p>— The EduChain Team</p>
    `,
  });
}

export async function sendCollaborationRequestEmail(
  to: string,
  receiverName: string,
  senderName: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: `EduChain — New Collaboration Request from ${escapeHtml(senderName)}`,
    html: `
      <h2>Collaboration Request</h2>
      <p>Hi ${escapeHtml(receiverName)},</p>
      <p><strong>${escapeHtml(senderName)}</strong> has sent you a collaboration request on EduChain.</p>
      <p>Log in to accept or decline.</p>
      <br/>
      <p>— The EduChain Team</p>
    `,
  });
}

export async function sendNotificationEmail(
  to: string,
  title: string,
  body: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: `EduChain — ${escapeHtml(title)}`,
    html: `
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(body)}</p>
      <br/>
      <p>— The EduChain Team</p>
    `,
  });
}
