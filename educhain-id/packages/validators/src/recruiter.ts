import { z } from 'zod';

export const createRecruiterProfileSchema = z.object({
  companyName: z.string().min(1).max(200),
  position: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
});

export type CreateRecruiterProfileInput = z.infer<typeof createRecruiterProfileSchema>;

export const updateRecruiterProfileSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  position: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
});

export type UpdateRecruiterProfileInput = z.infer<typeof updateRecruiterProfileSchema>;

export const addToShortlistSchema = z.object({
  student_id: z.string().uuid(),
  note: z.string().max(1000).optional(),
});

export type AddToShortlistInput = z.infer<typeof addToShortlistSchema>;

export const browseStudentsSchema = z.object({
  q: z.string().max(200).optional(),
  skill: z.string().max(100).optional(),
  institution: z.string().max(200).optional(),
  graduation_year: z.coerce.number().int().min(1900).max(2100).optional(),
  verified_only: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type BrowseStudentsInput = z.infer<typeof browseStudentsSchema>;
