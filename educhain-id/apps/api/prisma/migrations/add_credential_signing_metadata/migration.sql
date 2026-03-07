-- Add credential signing metadata columns
ALTER TABLE "credentials" ADD COLUMN "signed_at" TIMESTAMP(3);
ALTER TABLE "credentials" ADD COLUMN "key_id" VARCHAR(16);
