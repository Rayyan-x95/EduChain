import { z } from 'zod';

export const searchStudentsSchema = z.object({
  q: z.string().max(200).optional(),
  skill: z.string().max(100).optional(),
  institution: z.string().max(200).optional(),
  graduation_year: z.coerce.number().int().min(2000).max(2100).optional(),
  verified_credentials: z.enum(['true', 'false']).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.enum(['recent', 'graduation_year', 'profile_popularity']).optional().default('recent'),
});

export type SearchStudentsInput = z.infer<typeof searchStudentsSchema>;

export const skillAutocompleteSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type SkillAutocompleteInput = z.infer<typeof skillAutocompleteSchema>;
