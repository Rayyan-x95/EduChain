-- Schema alignment migration (EduChain ID)
-- Fixes drift between prisma schema, runtime code, and initial migration.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Users: email verification fields (used by AuthService)
-- ---------------------------------------------------------------------------
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMP(3);

-- ---------------------------------------------------------------------------
-- 2) Email verification + password reset tables (used by AuthService + maintenance)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "email_verifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "token" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "email_verifications_user_id_key" ON "email_verifications"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "email_verifications_token_key" ON "email_verifications"("token");
CREATE INDEX IF NOT EXISTS "email_verifications_expires_at_idx" ON "email_verifications"("expires_at");
ALTER TABLE "email_verifications"
  ADD CONSTRAINT IF NOT EXISTS "email_verifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "password_resets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "token" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "password_resets_user_id_key" ON "password_resets"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "password_resets_token_key" ON "password_resets"("token");
CREATE INDEX IF NOT EXISTS "password_resets_expires_at_idx" ON "password_resets"("expires_at");
ALTER TABLE "password_resets"
  ADD CONSTRAINT IF NOT EXISTS "password_resets_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 3) Credentials: missing nonce column + key_id type mismatch
--    - initial migration had key_id TEXT; prisma/code expects UUID
-- ---------------------------------------------------------------------------
ALTER TABLE "credentials"
  ADD COLUMN IF NOT EXISTS "nonce" TEXT;

-- Backfill nonce for existing rows (safe for dev/staging).
UPDATE "credentials"
SET "nonce" = COALESCE("nonce", encode(gen_random_bytes(16), 'hex'))
WHERE "nonce" IS NULL;

-- Enforce nonce invariants.
ALTER TABLE "credentials"
  ALTER COLUMN "nonce" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "credentials_nonce_key" ON "credentials"("nonce");

-- Convert key_id from TEXT -> UUID when possible, otherwise NULL it out.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'credentials' AND column_name = 'key_id' AND data_type = 'text'
  ) THEN
    ALTER TABLE "credentials" ADD COLUMN IF NOT EXISTS "key_id_uuid" UUID;

    UPDATE "credentials"
    SET "key_id_uuid" = CASE
      WHEN "key_id" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN "key_id"::uuid
      ELSE NULL
    END;

    ALTER TABLE "credentials" DROP COLUMN "key_id";
    ALTER TABLE "credentials" RENAME COLUMN "key_id_uuid" TO "key_id";
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4) Institution keys: replace legacy key_versions with institution_keys table
-- ---------------------------------------------------------------------------
-- Preserve the legacy table (if present) for debugging / data salvage.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'key_versions') THEN
    ALTER TABLE "key_versions" RENAME TO "key_versions_legacy";
  END IF;
END $$;

-- Create the table expected by prisma + runtime.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'KeyStatus') THEN
    CREATE TYPE "KeyStatus" AS ENUM ('active', 'revoked', 'expired');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "institution_keys" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "institution_id" UUID NOT NULL,
  "public_key" TEXT NOT NULL,
  "status" "KeyStatus" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMP(3),
  CONSTRAINT "institution_keys_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "institution_keys_institution_id_status_idx"
  ON "institution_keys"("institution_id", "status");

ALTER TABLE "institution_keys"
  ADD CONSTRAINT IF NOT EXISTS "institution_keys_institution_id_fkey"
  FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add FK from credentials.key_id -> institution_keys.id (nullable)
ALTER TABLE "credentials"
  ADD CONSTRAINT IF NOT EXISTS "credentials_key_id_fkey"
  FOREIGN KEY ("key_id") REFERENCES "institution_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 5) Encrypted institution private keys table (used by InstitutionKeyStore)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "institution_private_keys" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "institution_id" UUID NOT NULL,
  "encrypted_private_key" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "rotated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "institution_private_keys_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "institution_private_keys_institution_id_key"
  ON "institution_private_keys"("institution_id");

ALTER TABLE "institution_private_keys"
  ADD CONSTRAINT IF NOT EXISTS "institution_private_keys_institution_id_fkey"
  FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

