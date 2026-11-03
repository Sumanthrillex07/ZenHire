# ZenHire — Software Requirements Specification (SRS)

> **Document Type:** Software Requirements Specification (SRS)  
> **Standard Compliance:** IEEE 830-1998 Format Adapted for Agile Product Engineering  
> **Version:** 1.0.0 (Production Blueprint)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) establishes the complete, authoritative functional and non-functional requirements for **ZenHire** — an AI-powered talent intelligence and recruitment management platform. This specification serves as the single source of truth for backend engineering, frontend architecture, database modeling, security enforcement, and testing strategies.

### 1.2 Scope
ZenHire is an enterprise-oriented recruitment platform supporting two primary user personas: **Candidates** and **Recruiters**. The platform automates resume ingestion via PDF text extraction and LLM structured extraction, verifies candidate capabilities through category-based multiple-choice assessment gating, ranks applicants using a transparent hybrid scoring engine (deterministic skill overlap + semantic LLM evaluation), manages interview scheduling workflows, and provides candidates with context-grounded AI career guidance.

---

## 2. System Actors & Roles

| Actor ID | Actor Name | Role & Responsibility Description |
| :--- | :--- | :--- |
| **ACT-01** | **Unauthenticated Visitor** | Can browse the public marketing landing page, About page, Contact page, and initiate user registration or login. |
| **ACT-02** | **Candidate (`ROLE_CANDIDATE`)** | Registered job seeker. Can manage profile, upload/re-parse PDF resumes, take general and role-specific assessments, browse active job listings, apply to gated jobs, track application pipelines, view skill strengths/weaknesses analytics, and chat with the AI Career Advisor. |
| **ACT-03** | **Recruiter (`ROLE_RECRUITER`)** | Registered company talent representative. Can manage company profile, author and publish job requisitions, inspect ranked applicant pipelines, view parsed candidate resumes and skill gaps, transition application statuses (`SHORTLISTED`, `REJECTED`, `HIRED`), and schedule interviews. |
| **ACT-04** | **AI Subsystem (`SYSTEM_AI`)** | Automated background integration powering Google Gemini 1.5. Ingests raw resume text to produce structured JSON profiles, evaluates qualitative narrative fit against job descriptions, and serves conversational responses strictly grounded in candidate profile context. |

---

## 3. Functional Requirements

### Module 1: Authentication and Authorization (FR-AUTH)

- **FR-AUTH-01: User Registration:**
  - The system shall allow visitors to register as either a `CANDIDATE` or a `RECRUITER`.
  - For `RECRUITER` registrations, `companyName` is mandatory (validated server-side).
  - Passwords must be at least 6 characters in length (recommended 8+ with alphanumeric criteria).
  - The system shall reject duplicate email addresses with HTTP `400 Bad Request`.
  - Passwords must be securely hashed using BCrypt (work factor 12) before database persistence.

- **FR-AUTH-02: User Authentication (Login):**
  - The system shall authenticate users via email and password credentials.
  - Invalid credentials shall return HTTP `401 Unauthorized` with a generic message: `"Invalid email or password"`.
  - Upon successful authentication, the system shall issue a signed, stateless JSON Web Token (JWT) containing the user's ID, role, and expiration timestamp.
  - The response payload shall include the JWT token and the sanitized user profile (including `candidateId` or `recruiterId`).

- **FR-AUTH-03: Session Verification & Role-Based Access Control (RBAC):**
  - The system shall expose a `GET /api/v1/auth/me` endpoint to validate active JWT sessions.
  - All protected endpoints must validate the `Authorization: Bearer <token>` header via a Spring Security filter.
  - Method-level security (`@PreAuthorize`) shall enforce strict role segregation: candidates cannot invoke recruiter APIs, and recruiters cannot invoke candidate APIs.

---

### Module 2: Candidate Management (FR-CAND)

- **FR-CAND-01: Profile Management:**
  - Candidates shall maintain biographical details, phone contact number, and professional headline.
  - The system shall calculate profile completion status based on phone, headline, resume presence, and completed assessments.

- **FR-CAND-02: Resume Association:**
  - Each candidate profile shall be associated with one or more uploaded resumes.
  - Exactly one resume shall be flagged as `isLatest = true` at any given time.
  - When a new resume is uploaded, previous resumes belonging to that candidate must be updated to `isLatest = false`.

---

### Module 3: Job Requisition Management (FR-JOB)

- **FR-JOB-01: Job Creation & Configuration:**
  - Only authorized recruiters (`ROLE_RECRUITER`) can author job postings.
  - Mandatory fields: `title` (min 3 chars), `description` (min 10 chars), `requiredSkills` (array of at least 1 non-empty skill), and `roleCategory` (one of `FRONTEND`, `BACKEND`, `AI_ML`).
  - Upon creation, job postings default to status `OPEN`.

- **FR-JOB-02: Job Discovery & Filtering:**
  - All authenticated users can retrieve active job postings (`status = OPEN`).
  - Job queries can be filtered by `roleCategory`.
  - When retrieved by a candidate, the response must compute:
    - Real-time `matchScore` (if candidate has uploaded a resume).
    - `eligible` boolean flag indicating whether the candidate has passed the required assessment for that job's `roleCategory`.

- **FR-JOB-03: Job Details Inspection:**
  - Users can view detailed job requisition data including hiring company name, required skills, and full description.
  - For candidates, the response includes an exact breakdown of `matchedSkills` and `missingSkills`.

---

### Module 4: Resume Intelligence & Processing (FR-RESUME)

- **FR-RESUME-01: Document Upload & Validation:**
  - The system shall accept multipart file uploads restricted to PDF format (`.pdf`, `application/pdf`).
  - The maximum allowable file size shall be 5 MB.
  - Files shall be verified using magic bytes to prevent file extension spoofing.

- **FR-RESUME-02: Text Stream Extraction:**
  - The system shall utilize Apache PDFBox 3.x to extract UTF-8 raw text from uploaded PDF files.
  - If extracted text is empty or corrupted, the system shall return HTTP `400 Bad Request` with an appropriate error message.

- **FR-RESUME-03: Structured AI Extraction:**
  - Extracted raw text shall be dispatched to the Gemini 1.5 LLM with a strict JSON schema prompt.
  - The model must extract:
    - `skills`: string array of normalized technical skills.
    - `experience`: text summary of duration and key roles.
    - `education`: text summary of degrees, institutions, and graduation years.
  - Responses must be validated against a strict Jackson DTO schema.
  - If the LLM call fails or times out, the system shall employ a deterministic regex/keyword fallback extractor to ensure service availability.

- **FR-RESUME-04: Latest Resume Retrieval:**
  - The system shall expose `GET /api/v1/resumes/latest` allowing candidates to inspect their active parsed profile data.

---

### Module 5: AI-Powered Job Matching (FR-MATCH)

- **FR-MATCH-01: Deterministic Skill Overlap Calculation:**
  - The system shall normalize both candidate skills and job required skills to lowercase, trimmed strings.
  - Direct exact matching and substring matching (e.g., `"React"` matching `"React.js"`) shall be performed deterministically.
  - `skillOverlapScore = round((matchedSkills.length / requiredSkills.length) * 100)`.
  - If `requiredSkills` is empty, `skillOverlapScore = 100`.

- **FR-MATCH-02: Qualitative LLM Fit Evaluation:**
  - The system shall send candidate parsed resume details, job description, and required skills to the LLM.
  - The LLM evaluates narrative depth, project relevance, and seniority, returning an integer `llmFitScore` (0–100) and a concise `reasoning` string (1–2 sentences).
  - The reasoning text is stored for recruiter inspection and excluded from candidate views.

- **FR-MATCH-03: Hybrid Formula Combination:**
  - The final score is computed as:  
    $$\text{finalScore} = \text{round}(0.6 \times \text{skillOverlapScore} + 0.4 \times \text{llmFitScore})$$
  - The score is strictly bounded between 0 and 100.
  - Fabricated or purely randomized scores are strictly prohibited.

---

### Module 6: Assessment & Gating Engine (FR-TEST)

- **FR-TEST-01: Assessment Catalog & Structure:**
  - Assessments are categorized into `GENERAL` (general aptitude/communication) and `ROLE_SPECIFIC` (`FRONTEND`, `BACKEND`, `AI_ML`).
  - Each assessment has a defined `passScore` (default: 60%).
  - Questions contain `questionText`, an array of options (e.g. 4 choices), `topicTag` (e.g. `react-hooks`, `spring-transactions`, `sql-joins`), and `difficulty` (`EASY`, `MEDIUM`, `HARD`).

- **FR-TEST-02: Resume Prerequisite Check:**
  - A candidate MUST have at least one uploaded resume before being permitted to start any assessment attempt.
  - Attempting to start a test without a resume shall return HTTP `400 Bad Request`.

- **FR-TEST-03: Answer Masking Security:**
  - When returning test questions to a candidate client (`GET /api/v1/tests/{testId}`), the `correctIndex` field MUST be stripped/masked. Correct answers must never reach the frontend.

- **FR-TEST-04: Attempt Lifecycle & Evaluation:**
  - A candidate initiates a test attempt via `POST /api/v1/tests/{testId}/attempts`, generating a unique `attemptId`.
  - Upon submission (`POST /api/v1/tests/attempts/{attemptId}/submit`), the server grades each answer against the database `correctIndex`.
  - The system records individual `TestAnswer` records (`questionId`, `selectedIndex`, `isCorrect`, `topicTag`).
  - Score percentage: `score = round((correctCount / totalQuestions) * 100)`.
  - `passed = score >= passScore`.
  - The attempt is timestamped with `completedAt`.

- **FR-TEST-05: Double Submission Prevention:**
  - An attempt that already has a `completedAt` timestamp cannot be submitted again.
  - Redundant submissions return HTTP `400 Bad Request`.

- **FR-TEST-06: Application Gating Enforcement:**
  - When a candidate attempts to apply to a job (`POST /api/v1/jobs/{jobId}/apply`), the system checks if the candidate has passed a `ROLE_SPECIFIC` assessment matching the job's `roleCategory`.
  - If no passed attempt exists: HTTP `403 Forbidden` is returned, containing the `requiredTest: { testId, roleCategory }` so the UI can redirect the candidate to the test runner.
  - If a passed attempt exists: The application proceeds and records the `gateTestAttemptId`.
  - **Assessment Reusability:** Once a candidate passes an assessment for a category (e.g., `backend`), that pass unlocks ALL current and future jobs in that category.

---

### Module 7: Recruiter Dashboard & Applicant Pipeline (FR-REC)

- **FR-REC-01: Recruiter Analytics KPI Dashboard:**
  - Recruiters can view aggregate statistics: `openJobs` count, `totalApplicants` count, `shortlisted` count, and a list of `topScorers` across all their postings.
  - Recruiter's job list displays each job's title, category, creation date, and `applicantsCount`.

- **FR-REC-02: Ranked Applicant List Inspection:**
  - Recruiters can view all applications for a job they own via `GET /api/v1/jobs/{jobId}/applicants`.
  - Sorting support: `?sort=matchScore` (default, descending) or `?sort=appliedAt` (descending).
  - Cross-recruiter data leak gating: A recruiter attempting to view applicants for a job owned by another recruiter shall receive HTTP `403 Forbidden`.

- **FR-REC-03: Application Workflow Transitions:**
  - Strict state machine transitions:
    - `APPLIED` ➔ `SHORTLISTED`
    - `SHORTLISTED` ➔ `INTERVIEW_SCHEDULED`
    - `INTERVIEW_SCHEDULED` ➔ `HIRED`
    - Any non-terminal state ➔ `REJECTED`
  - Terminal states: `HIRED` and `REJECTED` are final. No further status changes or interview actions are permitted.
  - Invalid transitions (e.g., attempting to hire an applicant directly from `APPLIED` or scheduling an interview for a `REJECTED` applicant) must return HTTP `400 Bad Request`.

- **FR-REC-04: Interview Scheduling:**
  - Recruiters can schedule interviews for candidates in `SHORTLISTED` or `INTERVIEW_SCHEDULED` status.
  - Fields: `scheduledTime` (ISO-8601 timestamp), `mode` (`ONLINE` or `OFFLINE`), and optional `notes`.
  - Submitting an interview automatically transitions application status to `INTERVIEW_SCHEDULED`.
  - When an applicant is hired, any existing interview status transitions to `COMPLETED`.

---

### Module 8: Candidate Dashboard & Analytics (FR-DASH)

- **FR-DASH-01: Candidate Dashboard Overview:**
  - Exposes `hasResume`, `resumeUploadedAt`, `applicationsCount`, and a summary list of all available tests with the candidate's highest score, attempt status, and passed flag.

- **FR-DASH-02: Topic Strengths & Weaknesses Feedback:**
  - Computes aggregated candidate performance across all completed test answers grouped by `topicTag`.
  - For each topic: $\text{percentage} = \text{round}((\text{correctAnswers} / \text{totalAnswers}) \times 100)$.
  - Topics with score $\ge 60\%$ are categorized as `strongTopics`.
  - Topics with score $< 60\%$ are categorized as `weakTopics`.

- **FR-DASH-03: Recommended Role Categories:**
  - Evaluates candidate's parsed resume skills against category keyword dictionaries to recommend relevant tracks (`frontend`, `backend`, `ai-ml`).

- **FR-DASH-04: Application Pipeline Tracking:**
  - Lists all submitted applications with company name, job title, match score, current status, applied date, and scheduled interview coordinates.

---

### Module 9: AI Recruitment Assistant (FR-CHAT)

- **FR-CHAT-01: Context-Grounded Conversational Advisory:**
  - Candidates can converse with the AI Career Advisor via `POST /api/v1/chat`.
  - The server dynamically constructs a private context injection including:
    - Candidate name.
    - Extracted resume skills, experience, and education.
    - Active applications, companies, and current statuses.
    - List of passed assessments.
  - Conversation history (last 20 messages) is passed for context continuity.

- **FR-CHAT-02: Scope Restriction & Hallucination Prevention:**
  - The system prompt strictly limits responses to the candidate's verified profile data and application updates.
  - Out-of-scope inquiries (e.g., salary negotiations, external companies) must be politely declined without fabrication.
  - All responses must be delivered in strict JSON shape: `{"reply": "string"}`.

- **FR-CHAT-03: Chat History Persistence:**
  - All candidate questions (`sender = CANDIDATE`) and AI replies (`sender = AI`) are persisted to the database and retrievable via `GET /api/v1/chat/history`.

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Security Requirements (NFR-SEC)
- **NFR-SEC-01:** Passwords must be hashed using BCrypt with minimum 10 rounds (default: 12).
- **NFR-SEC-02:** JWT secret must be at least 256 bits (32 bytes) for HMAC-SHA256 integrity.
- **NFR-SEC-03:** Question correct answers must never be transmitted in candidate-facing DTOs.
- **NFR-SEC-04:** Recruiter access must be strictly scoped to their own jobs and applicant records.
- **NFR-SEC-05:** Uploaded files must be validated for size (≤5MB) and MIME type (`application/pdf`).

### 4.2 Performance Requirements (NFR-PERF)
- **NFR-PERF-01:** Standard REST API endpoints shall respond in under 200 ms (p95) under normal load.
- **NFR-PERF-02:** Resume upload and parsing (including LLM extraction) shall complete within 4 seconds (p95).
- **NFR-PERF-03:** Database queries must utilize proper indexes on foreign keys and status columns to prevent full-table scans.

### 4.3 Reliability & Availability Requirements (NFR-REL)
- **NFR-REL-01:** The system shall maintain 99.9% uptime.
- **NFR-REL-02:** When the external Gemini API is unreachable, the system shall fail gracefully with heuristic fallback mechanisms rather than throwing unhandled 500 errors.

### 4.4 Maintainability & Clean Architecture (NFR-MAINT)
- **NFR-MAINT-01:** Zero business logic in controllers. Controllers must delegate directly to services.
- **NFR-MAINT-02:** Database entities must never be exposed directly in API responses. DTOs and mappers must mediate all input/output.
- **NFR-MAINT-03:** All database schema changes must be version-controlled via Flyway migration scripts.

---

## 5. Use Cases & Acceptance Criteria (Gherkin Style)

### Use Case UC-01: Role-Specific Assessment Gating
```gherkin
Feature: Assessment Gating for Job Applications

  Scenario: Candidate attempts to apply to a backend job without passing the backend assessment
    Given a candidate "Alex" with an uploaded resume
    And a job posting "Lead Backend Developer" with roleCategory "backend"
    And Alex has not passed the "Backend Engineering Assessment"
    When Alex sends a POST request to "/api/v1/jobs/{jobId}/apply"
    Then the response status should be 403 Forbidden
    And the response body should contain requiredTest with testId and roleCategory "backend"

  Scenario: Candidate applies to a backend job after passing the backend assessment
    Given a candidate "Alex" with an uploaded resume
    And Alex has completed the "Backend Engineering Assessment" with a score of 80% (passScore is 60%)
    When Alex sends a POST request to "/api/v1/jobs/{jobId}/apply"
    Then the response status should be 201 Created
    And an Application record should be created with status "APPLIED"
    And the gateTestAttemptId should reference Alex's passed test attempt
```

### Use Case UC-02: Application Workflow State Machine
```gherkin
Feature: Recruiter Application Lifecycle State Machine

  Scenario: Recruiter shortlists an applicant
    Given an application with status "APPLIED" belonging to recruiter's job
    When the recruiter sends a POST request to "/api/v1/applications/{appId}/shortlist"
    Then the response status should be 200 OK
    And the application status should transition to "SHORTLISTED"

  Scenario: Recruiter attempts to hire an applicant directly from APPLIED status
    Given an application with status "APPLIED"
    When the recruiter sends a POST request to "/api/v1/applications/{appId}/hire"
    Then the response status should be 400 Bad Request
    And the error message should indicate candidate must be in "INTERVIEW_SCHEDULED" status

  Scenario: Recruiter schedules interview for shortlisted applicant
    Given an application with status "SHORTLISTED"
    When the recruiter sends a POST request to "/api/v1/applications/{appId}/interview" with time and mode
    Then the response status should be 200 OK
    And an Interview record should be created
    And the application status should transition to "INTERVIEW_SCHEDULED"
```

### Use Case UC-03: Duplicate Job Application Prevention
```gherkin
Feature: Unique Application Constraint

  Scenario: Candidate attempts to apply to the same job twice
    Given a candidate has already applied to job "job-123"
    When the candidate sends a POST request to "/api/v1/jobs/job-123/apply"
    Then the response status should be 400 Bad Request
    And the error message should be "You have already applied to this job"
```

