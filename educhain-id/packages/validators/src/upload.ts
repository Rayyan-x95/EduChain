import { z } from 'zod';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

export const uploadCertificateSchema = z.object({
  fileName: z
    .string()
    .min(1, 'fileName is required')
    .max(255, 'fileName must be at most 255 characters')
    .regex(/^[\w\-. ]+$/, 'fileName contains invalid characters'),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({ message: `mimeType must be one of: ${ALLOWED_MIME_TYPES.join(', ')}` }),
  }),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024, 'fileSize must be at most 10 MB')
    .optional(),
});

export type UploadCertificateInput = z.infer<typeof uploadCertificateSchema>;
