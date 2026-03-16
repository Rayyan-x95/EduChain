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
}).or(z.object({
  studentId: z.string().uuid(),
  note: z.string().max(1000).optional(),
}).transform((data) => ({
  student_id: data.studentId,
  note: data.note,
})));

export type AddToShortlistInput = z.infer<typeof addToShortlistSchema>;

function normalizeStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => String(entry).split(','))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeBoolean(value: unknown): boolean | undefined | unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return value;
}

export const browseStudentsSchema = z.preprocess((input) => {
  if (!input || typeof input !== 'object') {
    return input;
  }

  const raw = input as Record<string, unknown>;

  return {
    ...raw,
    skills: normalizeStringArray(raw.skills ?? raw.skill),
    graduation_year: raw.graduation_year ?? raw.graduationYear,
    verified_only: normalizeBoolean(raw.verified_only ?? raw.verifiedOnly),
  };
}, z.object({
  q: z.string().max(200).optional(),
  skills: z.array(z.string().min(1).max(100)).optional(),
  institution: z.string().max(200).optional(),
  graduation_year: z.coerce.number().int().min(1900).max(2100).optional(),
  verified_only: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}));

export type BrowseStudentsInput = z.infer<typeof browseStudentsSchema>;
