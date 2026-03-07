import { z } from 'zod';

export const addSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(100),
});

export type AddSkillInput = z.infer<typeof addSkillSchema>;
