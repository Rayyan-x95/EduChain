-- Phase 4: Search & Discovery Indexes
-- Enable pg_trgm extension for trigram-based fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram index on students.full_name for fuzzy name search
CREATE INDEX IF NOT EXISTS idx_students_full_name_trgm ON students USING GIN (full_name gin_trgm_ops);

-- GIN trigram index on skills.name for autocomplete
CREATE INDEX IF NOT EXISTS idx_skills_name_trgm ON skills USING GIN (name gin_trgm_ops);
