import { z } from 'zod';

export const setUsernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username may only contain letters, numbers, hyphens, and underscores',
    ),
});

export type SetUsernameInput = z.infer<typeof setUsernameSchema>;

export const updateIdentityVisibilitySchema = z.object({
  visibility: z.enum(['public', 'connections_only', 'private']),
});

export type UpdateIdentityVisibilityInput = z.infer<typeof updateIdentityVisibilitySchema>;
