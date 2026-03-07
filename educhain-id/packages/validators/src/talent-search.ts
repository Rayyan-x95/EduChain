import { z } from 'zod';

export const talentSearchSchema = z.object({
  skills: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()) : undefined)),
  institution: z.string().optional(),
  graduation_year: z.coerce.number().int().optional(),
  min_score: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type TalentSearchInput = z.infer<typeof talentSearchSchema>;
