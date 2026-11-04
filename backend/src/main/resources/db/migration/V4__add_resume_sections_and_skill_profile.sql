-- ------------------------------------------------------------------------------
-- ZenHire Flyway Migration: V4__add_resume_sections_and_skill_profile.sql
-- Adds support for section segmentation and enriched normalized skill profile.
-- ------------------------------------------------------------------------------

ALTER TABLE resumes
    ADD COLUMN IF NOT EXISTS parsed_projects TEXT,
    ADD COLUMN IF NOT EXISTS parsed_certifications TEXT,
    ADD COLUMN IF NOT EXISTS parsed_sections JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS skill_profile JSONB DEFAULT '[]'::jsonb;

-- Index for searching skill profile jsonb attributes if needed
CREATE INDEX IF NOT EXISTS idx_resumes_skill_profile ON resumes USING gin (skill_profile);

