import { z } from 'zod';

export const createStudentProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  institutionId: z.string().uuid().optional(),
  degree: z.string().max(200).optional(),
  graduationYear: z.number().int().min(1990).max(2050).optional(),
  bio: z.string().max(2000).optional(),
  profileVisibility: z.enum(['public', 'recruiter_only', 'private']).optional(),
});

export const updateStudentProfileSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  institutionId: z.string().uuid().nullable().optional(),
  degree: z.string().max(200).nullable().optional(),
  graduationYear: z.number().int().min(1990).max(2050).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  profileVisibility: z.enum(['public', 'recruiter_only', 'private']).optional(),
});

export const requestVerificationSchema = z.object({
  institutionId: z.string().uuid('Invalid institution ID'),
  studentEmail: z.string().email('Invalid student email'),
  studentIdNumber: z.string().min(1, 'Student ID number is required').max(100),
});

export type CreateStudentProfileInput = z.infer<typeof createStudentProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type RequestVerificationInput = z.infer<typeof requestVerificationSchema>;
