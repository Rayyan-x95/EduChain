import { z } from 'zod';

export const issueCredentialSchema = z.preprocess((input) => {
  if (!input || typeof input !== 'object') {
    return input;
  }

  const raw = input as Record<string, unknown>;

  return {
    ...raw,
    studentId: raw.studentId ?? raw.student_id,
    studentEmail: raw.studentEmail ?? raw.student_email,
    credentialType: raw.credentialType ?? raw.credential_type,
    issuedDate:
      raw.issuedDate ??
      raw.issued_date ??
      new Date().toISOString().slice(0, 10),
  };
}, z.object({
  studentId: z.string().uuid('Invalid student ID').optional(),
  studentEmail: z.string().email('Invalid student email').optional(),
  credentialType: z
    .string()
    .min(1, 'Credential type is required')
    .max(100),
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(5000).optional(),
  issuedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
}).refine((value) => Boolean(value.studentId || value.studentEmail), {
  message: 'Student ID or student email is required',
  path: ['studentId'],
}));

export const revokeCredentialSchema = z.object({
  credentialId: z.string().uuid('Invalid credential ID'),
  reason: z.string().max(500).optional(),
});

export type IssueCredentialInput = z.infer<typeof issueCredentialSchema>;
export type RevokeCredentialInput = z.infer<typeof revokeCredentialSchema>;
