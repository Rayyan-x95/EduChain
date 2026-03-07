import { z } from 'zod';

// ---------------------------------------------------------------------------
// Follow
// ---------------------------------------------------------------------------

export const followStudentSchema = z.object({
  target_student_id: z.string().uuid(),
});

export type FollowStudentInput = z.infer<typeof followStudentSchema>;

// ---------------------------------------------------------------------------
// Collaboration Requests
// ---------------------------------------------------------------------------

export const sendCollaborationRequestSchema = z.object({
  receiver_id: z.string().uuid(),
  message: z.string().max(1000).optional(),
});

export type SendCollaborationRequestInput = z.infer<typeof sendCollaborationRequestSchema>;

export const handleCollaborationRequestSchema = z.object({
  request_id: z.string().uuid(),
});

export type HandleCollaborationRequestInput = z.infer<typeof handleCollaborationRequestSchema>;

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export const createGroupSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const addGroupMemberSchema = z.object({
  student_id: z.string().uuid(),
});

export type AddGroupMemberInput = z.infer<typeof addGroupMemberSchema>;
