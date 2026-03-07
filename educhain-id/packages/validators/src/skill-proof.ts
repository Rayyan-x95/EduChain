import { z } from 'zod';

export const submitSkillProofSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required').max(100),
  proofType: z.enum([
    'github_repository',
    'hackathon_certificate',
    'course_completion',
    'peer_endorsement',
    'project_contribution',
  ]),
  referenceUrl: z.string().url('Must be a valid URL').optional(),
  description: z.string().max(500).optional(),
});

export type SubmitSkillProofInput = z.infer<typeof submitSkillProofSchema>;

export const endorseSkillSchema = z.object({
  endorseeId: z.string().uuid('Invalid student ID'),
  skillId: z.number().int().positive(),
  message: z.string().max(300).optional(),
});

export type EndorseSkillInput = z.infer<typeof endorseSkillSchema>;
