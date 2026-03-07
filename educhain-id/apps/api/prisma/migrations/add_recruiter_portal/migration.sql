-- Phase 6: Recruiter Portal & Talent Discovery

-- Recruiters
CREATE TABLE "recruiters" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "company_name" TEXT NOT NULL,
  "position" TEXT,
  "bio" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recruiters_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "recruiters_user_id_key" ON "recruiters"("user_id");
CREATE INDEX "recruiters_company_name_idx" ON "recruiters"("company_name");

ALTER TABLE "recruiters"
  ADD CONSTRAINT "recruiters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Shortlists
CREATE TABLE "shortlists" (
  "recruiter_id" UUID NOT NULL,
  "student_id" UUID NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shortlists_pkey" PRIMARY KEY ("recruiter_id", "student_id")
);

CREATE INDEX "shortlists_student_id_idx" ON "shortlists"("student_id");

ALTER TABLE "shortlists"
  ADD CONSTRAINT "shortlists_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "recruiters"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "shortlists_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
