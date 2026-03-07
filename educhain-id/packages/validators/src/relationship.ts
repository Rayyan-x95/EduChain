import { z } from 'zod';

export const createRelationshipSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID'),
  relationshipType: z.enum([
    'collaborated_with',
    'endorsed_by',
    'mentor_of',
    'worked_with',
  ]),
});

export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>;
