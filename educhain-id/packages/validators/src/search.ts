import { z } from 'zod';

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

export const searchStudentsSchema = z.preprocess((input) => {
  if (!input || typeof input !== 'object') {
    return input;
  }

  const raw = input as Record<string, unknown>;

  return {
    ...raw,
    skills: normalizeStringArray(raw.skills ?? raw.skill),
    graduation_year: raw.graduation_year ?? raw.graduationYear,
    verified_credentials: normalizeBoolean(
      raw.verified_credentials ?? raw.verified_only ?? raw.verifiedOnly,
    ),
  };
}, z.object({
  q: z.string().max(200).optional(),
  skills: z.array(z.string().min(1).max(100)).optional(),
  institution: z.string().max(200).optional(),
  graduation_year: z.coerce.number().int().min(2000).max(2100).optional(),
  verified_credentials: z.boolean().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.enum(['recent', 'graduation_year', 'profile_popularity']).optional().default('recent'),
}));

export type SearchStudentsInput = z.infer<typeof searchStudentsSchema>;

export const skillAutocompleteSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type SkillAutocompleteInput = z.infer<typeof skillAutocompleteSchema>;
