-- ==============================================================================
-- ZenHire Database Schema Migration: V1__init_schema.sql
-- Description: Core DDL tables, foreign keys, unique constraints, and check constraints
-- Target Database: PostgreSQL 16
-- ==============================================================================

-- Enable pgcrypto extension for cryptographic functions and UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Table: users
-- Stores core authentication credentials and roles
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ROLE_CANDIDATE', 'ROLE_RECRUITER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. Table: candidates
-- 1-to-1 extension of users for candidates
-- ------------------------------------------------------------------------------
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(30),
    headline VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. Table: recruiters
-- 1-to-1 extension of users for company recruiters
-- ------------------------------------------------------------------------------
CREATE TABLE recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. Table: resumes
-- Uploaded PDF documents and parsed structured intelligence
-- ------------------------------------------------------------------------------
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    raw_text TEXT NOT NULL,
    parsed_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    parsed_experience TEXT,
    parsed_education TEXT,
    is_latest BOOLEAN NOT NULL DEFAULT TRUE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. Table: jobs
-- Job requisitions published by recruiters
-- ------------------------------------------------------------------------------
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    role_category VARCHAR(50) NOT NULL CHECK (role_category IN ('FRONTEND', 'BACKEND', 'AI_ML')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. Table: tests
-- Assessment catalog: general aptitude and role-specific gating tests
-- ------------------------------------------------------------------------------
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_type VARCHAR(30) NOT NULL CHECK (test_type IN ('GENERAL', 'ROLE_SPECIFIC')),
    role_category VARCHAR(50) CHECK (role_category IS NULL OR role_category IN ('FRONTEND', 'BACKEND', 'AI_ML')),
    title VARCHAR(150) NOT NULL,
    pass_score INT NOT NULL DEFAULT 60 CHECK (pass_score BETWEEN 1 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. Table: questions
-- Multiple choice questions belonging to an assessment
-- ------------------------------------------------------------------------------
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
    topic_tag VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 8. Table: test_attempts
-- Candidate assessment sessions and grading outcomes
-- ------------------------------------------------------------------------------
CREATE TABLE test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE RESTRICT,
    score INT NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    total_questions INT NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 9. Table: test_answers
-- Itemized candidate responses for skill analytics feedback
-- ------------------------------------------------------------------------------
CREATE TABLE test_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_index INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    topic_tag VARCHAR(100) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 10. Table: applications
-- Job applications linking candidate, job, gating attempt, and hybrid score
-- ------------------------------------------------------------------------------
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE RESTRICT,
    gate_test_attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE RESTRICT,
    match_score INT NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'HIRED')),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidate_job UNIQUE (candidate_id, job_id)
);

-- ------------------------------------------------------------------------------
-- 11. Table: interviews
-- 1-to-1 interview coordination linked to applications
-- ------------------------------------------------------------------------------
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('ONLINE', 'OFFLINE')),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 12. Table: chat_messages
-- Context-grounded conversation history between candidate and AI Career Advisor
-- ------------------------------------------------------------------------------
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('CANDIDATE', 'AI')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
