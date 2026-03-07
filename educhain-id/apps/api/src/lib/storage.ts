import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import crypto from 'crypto';
import pino from 'pino';

const logger = pino({ name: 'storage' });

let supabase: SupabaseClient | null = null;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Initialize the Supabase client (storage only).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    logger.warn('Supabase credentials not configured — file storage disabled');
    return null;
  }

  supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  return supabase;
}

export interface UploadResult {
  fileKey: string;
  publicUrl: string;
}

/**
 * Upload a file buffer to Supabase Storage.
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folder = 'certificates',
): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new Error(`File type not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10 MB limit');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase storage not configured');
  }

  const ext = fileName.split('.').pop() ?? 'bin';
  const fileKey = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const bucket = env.SUPABASE_STORAGE_BUCKET;

  const { error } = await client.storage.from(bucket).upload(fileKey, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    logger.error({ error: error.message, fileKey }, 'Supabase upload failed');
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = client.storage.from(bucket).getPublicUrl(fileKey);

  return {
    fileKey,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Generate a signed URL for private file access.
 */
export async function getSignedUrl(
  fileKey: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase storage not configured');
  }

  const bucket = env.SUPABASE_STORAGE_BUCKET;
  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(fileKey, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${error?.message ?? 'Unknown error'}`);
  }

  return data.signedUrl;
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(fileKey: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const bucket = env.SUPABASE_STORAGE_BUCKET;
  const { error } = await client.storage.from(bucket).remove([fileKey]);

  if (error) {
    logger.warn({ error: error.message, fileKey }, 'Failed to delete file');
  }
}

/**
 * Generate a presigned upload URL (client-side upload).
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  mimeType: string,
  fileSize?: number,
): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new Error(`File type not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  if (fileSize && fileSize > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10 MB limit');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase storage not configured');
  }

  const ext = fileName.split('.').pop() ?? 'bin';
  const fileKey = `certificates/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const bucket = env.SUPABASE_STORAGE_BUCKET;

  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUploadUrl(fileKey);

  if (error || !data) {
    throw new Error(`Failed to create upload URL: ${error?.message ?? 'Unknown error'}`);
  }

  const { data: urlData } = client.storage.from(bucket).getPublicUrl(fileKey);

  return {
    uploadUrl: data.signedUrl,
    fileKey,
    publicUrl: urlData.publicUrl,
  };
}
