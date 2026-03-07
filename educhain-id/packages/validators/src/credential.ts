import { z } from 'zod';

export const issueCredentialSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  credentialType: z
    .string()
    .min(1, 'Credential type is required')
    .max(100),
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(5000).optional(),
  issuedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const revokeCredentialSchema = z.object({
  credentialId: z.string().uuid('Invalid credential ID'),
  reason: z.string().max(500).optional(),
});

export type IssueCredentialInput = z.infer<typeof issueCredentialSchema>;
export type RevokeCredentialInput = z.infer<typeof revokeCredentialSchema>;
