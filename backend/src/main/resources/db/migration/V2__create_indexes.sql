-- ==============================================================================
-- ZenHire Database Schema Migration: V2__create_indexes.sql
-- Description: B-Tree performance indexes for foreign keys, lookups, and sorting
-- Target Database: PostgreSQL 16
-- ==============================================================================

-- 1. Identity & Profile Lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_recruiters_user_id ON recruiters(user_id);

-- 2. Resume Queries
CREATE INDEX idx_resumes_candidate_latest ON resumes(candidate_id, is_latest);

-- 3. Job Filtering & Discovery
CREATE INDEX idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX idx_jobs_status_category ON jobs(status, role_category);

-- 4. Assessment Lookups & Answer Analytics
CREATE INDEX idx_questions_test_id ON questions(test_id);
CREATE INDEX idx_questions_topic_tag ON questions(topic_tag);
CREATE INDEX idx_test_attempts_candidate_test ON test_attempts(candidate_id, test_id);
CREATE INDEX idx_test_attempts_candidate_passed ON test_attempts(candidate_id, passed);
CREATE INDEX idx_test_answers_attempt_id ON test_answers(attempt_id);
CREATE INDEX idx_test_answers_topic_tag ON test_answers(topic_tag);

-- 5. Application Pipeline & Recruiter Sorting
CREATE INDEX idx_applications_job_match_score ON applications(job_id, match_score DESC);
CREATE INDEX idx_applications_job_applied_at ON applications(job_id, applied_at DESC);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);

-- 6. Interview & Chat Lookups
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_chat_messages_candidate_created ON chat_messages(candidate_id, created_at ASC);
