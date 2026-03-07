import { generatePresignedUploadUrl as supabasePresignedUrl } from '../../lib/storage';

export interface PresignedUrlResult {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

/**
 * Generates a pre-signed upload URL via Supabase Storage.
 * Delegates entirely to lib/storage.ts.
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  mimeType: string,
  fileSize?: number,
): Promise<PresignedUrlResult> {
  return supabasePresignedUrl(fileName, mimeType, fileSize);
}
