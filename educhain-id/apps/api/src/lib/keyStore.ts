import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import { env } from '../config/env';

const logger = pino({ name: 'key-store' });

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Derives a 256-bit encryption key from the JWT_SECRET with a per-institution salt.
 * In production, use AWS KMS or Vault instead.
 */
function deriveEncryptionKey(salt: Buffer): Buffer {
  return crypto.scryptSync(env.JWT_SECRET, salt, 32);
}

function encrypt(plaintext: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveEncryptionKey(salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  // Format: salt:iv:authTag:ciphertext (all base64)
  return `${salt.toString('base64')}:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

function decrypt(encryptedStr: string): string {
  const parts = encryptedStr.split(':');

  // Support legacy 3-part format (static salt) and new 4-part format (per-key salt)
  if (parts.length === 3) {
    // Legacy format: iv:authTag:ciphertext with static salt
    const legacySalt = Buffer.from('educhain-key-salt');
    const key = crypto.scryptSync(env.JWT_SECRET, legacySalt, 32);
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const ciphertext = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  if (parts.length !== 4) throw new Error('Invalid encrypted key format');

  const salt = Buffer.from(parts[0], 'base64');
  const iv = Buffer.from(parts[1], 'base64');
  const authTag = Buffer.from(parts[2], 'base64');
  const ciphertext = parts[3];

  const key = deriveEncryptionKey(salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Encrypted key store backed by the institution_private_keys table.
 * Replaces the in-memory Map<string, string> with persistent AES-256-GCM encrypted storage.
 */
export class InstitutionKeyStore {
  constructor(private readonly prisma: PrismaClient) {}

  async storePrivateKey(institutionId: string, privateKeyPem: string): Promise<void> {
    const encryptedPrivateKey = encrypt(privateKeyPem);

    // Upsert: create or update (for key rotation)
    await this.prisma.institutionPrivateKey.upsert({
      where: { institutionId },
      create: {
        institutionId,
        encryptedPrivateKey,
        rotatedAt: new Date(),
      },
      update: {
        encryptedPrivateKey,
        rotatedAt: new Date(),
      },
    });
    logger.info({ institutionId }, 'Private key stored (encrypted)');
  }

  async getPrivateKey(institutionId: string): Promise<string | null> {
    const row = await this.prisma.institutionPrivateKey.findUnique({
      where: { institutionId },
      select: { encryptedPrivateKey: true },
    });

    if (!row) return null;

    try {
      return decrypt(row.encryptedPrivateKey);
    } catch (err) {
      logger.error({ institutionId, err }, 'Failed to decrypt private key');
      return null;
    }
  }

  async rotateKey(
    institutionId: string,
    newPrivateKeyPem: string,
    newPublicKeyPem: string,
  ): Promise<{ publicKey: string }> {
    const encryptedPrivateKey = encrypt(newPrivateKeyPem);

    await this.prisma.$transaction([
      // Store new key version
      this.prisma.institutionPrivateKey.upsert({
        where: { institutionId },
        create: {
          institutionId,
          encryptedPrivateKey,
          rotatedAt: new Date(),
        },
        update: {
          encryptedPrivateKey,
          rotatedAt: new Date(),
        },
      }),
      // Update institution's public key
      this.prisma.$executeRaw`
        UPDATE institutions SET public_key = ${newPublicKeyPem} WHERE id = ${institutionId}::uuid
      `,
    ]);

    logger.info({ institutionId }, 'Key rotated successfully');
    return { publicKey: newPublicKeyPem };
  }
}
