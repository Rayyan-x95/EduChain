import { z } from 'zod';

export const reviewVerificationSchema = z.object({
  decision: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Decision must be "approved" or "rejected"' }),
  }),
});

export type ReviewVerificationInput = z.infer<typeof reviewVerificationSchema>;
