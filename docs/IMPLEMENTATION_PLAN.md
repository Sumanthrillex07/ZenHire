# ZenHire — Master Implementation Plan

> **Document Type:** Engineering Execution Roadmap & Phase Work Breakdown  
> **Development Model:** Phased Milestone Delivery (Dependency-Ordered)  
> **Version:** 1.0.0 (Production Blueprint)

---

## 1. Roadmap Overview & Phase Hierarchy

```mermaid
gantt
    title ZenHire Production Implementation Roadmap
    dateFormat  X
    axisFormat %s
    
    section Foundation
    Phase 0: Architecture & Specs        :done, p0, 0, 1
    Phase 1: Database Schema & Migrations:p1, after p0, 1
    Phase 2: Project Scaffold & Docker   :p2, after p1, 1
    Phase 3: Backend Core & Exceptions   :p3, after p2, 1

    section Core Services
    Phase 4: Spring Security & JWT Auth  :p4, after p3, 1
    Phase 5: Candidate & Recruiter Mgmt  :p5, after p4, 1
    Phase 6: Job Requisition Management :p6, after p5, 1
    Phase 7: Resume Intelligence & PDF   :p7, after p6, 1

    section Intelligence & Gating
    Phase 8: Hybrid AI Matching Engine   :p8, after p7, 1
    Phase 9: Assessment & Gating Engine  :p9, after p8, 1

    section Full-Stack & UI
    Phase 10: React 18 Frontend UI       :p10, after p9, 2
    Phase 11: AI Career Advisor Chat     :p11, after p10, 1

    section Quality & Delivery
    Phase 12: Automated Testing & Edge Cases:p12, after p11, 1
    Phase 13: Docker E2E & Final Release :p13, after p12, 1
```

---

## 2. Phase-by-Phase Execution Details

### Phase 0: Requirement Analysis, System Planning & Documentation *(CURRENT PHASE)*
- **Objective:** Establish an exhaustive, production-grade architectural and documentation foundation before any application code is generated.
- **Dependencies:** None.
- **Detailed Tasks:**
  1. Complete functional and domain workflow analysis across candidate and recruiter journeys.
  2. Author IEEE 830-compliant Software Requirements Specification (`docs/SOFTWARE_REQUIREMENTS_SPECIFICATION.md`).
  3. Create High-Level Design with Mermaid topologies (`docs/HIGH_LEVEL_DESIGN.md`).
  4. Create Low-Level Design with package structure and design patterns (`docs/LOW_LEVEL_DESIGN.md`).
  5. Formulate PostgreSQL 16 schema, constraints, and indexes (`docs/DATABASE_DESIGN.md`).
  6. Define OpenAPI REST specifications (`docs/API_SPECIFICATION.md`).
  7. Formulate Security & Threat Model (`docs/SECURITY_DESIGN.md`).
  8. Specify AI Architecture & prompt templates (`docs/AI_ARCHITECTURE.md`).
  9. Specify Docker multi-stage build and Compose configuration (`docs/DOCKER_AND_DEPLOYMENT.md`).
  10. Author Quality Assurance and Testing Strategy (`docs/TESTING_STRATEGY.md`).
  11. Establish Architecture Decision Records (`docs/ARCHITECTURE_DECISION_RECORDS.md`).
  12. Create SDE-1 Engineering Masterclass learning notes (`learning/01-12`).
  13. Establish Git repository, `.gitignore`, and push Phase 0 documentation.
- **Completion Criteria:** All 14 docs and 12 learning notes written, reviewed for consistency, committed, and ready for user approval.

---

### Phase 1: Database Schema & Flyway Migrations
- **Objective:** Establish version-controlled PostgreSQL schema evolution via Flyway.
- **Dependencies:** Phase 0 approval.
- **Detailed Tasks:**
  1. Author `V1__init_schema.sql` (Tables: `users`, `candidates`, `recruiters`, `resumes`, `jobs`, `tests`, `questions`, `test_attempts`, `test_answers`, `applications`, `interviews`, `chat_messages`).
  2. Author `V2__create_indexes.sql` (B-Tree indexes for lookups and foreign keys).
  3. Author `V3__seed_initial_data.sql` (Seed 1 General test + 3 Role-specific tests with 45+ questions tagged by topic; sample companies and demo jobs).
  4. Verify PostgreSQL container initialization and test migration execution cleanly.
- **Deliverables:** Validated SQL migration scripts in `backend/src/main/resources/db/migration/`.

---

### Phase 2: Project Initialization & Docker Compose Setup
- **Objective:** Initialize Spring Boot 3.3.x, React 18 (Vite + TypeScript), and Docker Compose orchestration.
- **Dependencies:** Phase 1.
- **Detailed Tasks:**
  1. Scaffold Spring Boot 3.3.x Maven project with Java 21, Spring Web, Spring Data JPA, Spring Security, Validation, Lombok, PostgreSQL driver, and Flyway.
  2. Scaffold React 18 application with Vite, TypeScript, Tailwind CSS, Lucide React, and Axios.
  3. Author multi-stage `Dockerfile` for backend and frontend.
  4. Configure `docker-compose.yml` with health checks, bridge networking, and persistent volumes.
  5. Validate that `docker compose up --build` boots all three containers cleanly.
- **Deliverables:** Runnable skeleton environment verifiable via health check endpoints.

---

### Phase 3: Backend Foundation & Layered Architecture
- **Objective:** Implement core infrastructure classes, common response envelopes, and global exception handling.
- **Dependencies:** Phase 2.
- **Detailed Tasks:**
  1. Implement `ApiResponse<T>` and `PageResponse<T>` envelopes.
  2. Implement domain exception hierarchy (`BaseApiException`, `ResourceNotFoundException`, `DuplicateResourceException`, etc.).
  3. Implement `@RestControllerAdvice` (`GlobalExceptionHandler`) translating exceptions to structured JSON errors.
  4. Configure WebMvc CORS properties, Jackson ObjectMapper (JavaTimeModule), and logging filters.
- **Deliverables:** Standardized API infrastructure ready for business logic controllers.

---

### Phase 4: Authentication & Authorization (Spring Security 6 + JWT)
- **Objective:** Implement stateless JWT authentication, password hashing, and role-based access control.
- **Dependencies:** Phase 3.
- **Detailed Tasks:**
  1. Implement `User`, `Candidate`, `Recruiter`, and `Role` JPA entities and repositories.
  2. Implement `JwtTokenProvider` (generate, parse, validate HMAC-SHA256 tokens).
  3. Implement `JwtAuthenticationFilter` and `UserPrincipal` (UserDetails).
  4. Implement `SecurityConfig` with `SecurityFilterChain` enforcing stateless sessions and role-based URL protection.
  5. Implement `AuthService` and `AuthController` (`/register`, `/login`, `/me`).
  6. Add unit and slice integration tests for registration and login edge cases.
- **Deliverables:** Secure authentication and authorization module with 100% passing tests.

---

### Phase 5: Candidate & Recruiter Profile Management
- **Objective:** Implement profile management APIs and role-specific workflows.
- **Dependencies:** Phase 4.
- **Detailed Tasks:**
  1. Implement `CandidateService` and `CandidateController` (profile retrieval, headline/phone updates).
  2. Implement `RecruiterService` and `RecruiterController` (company updates, dashboard KPI aggregations).
  3. Implement DTOs and MapStruct mappers separating internal entities from API responses.
- **Deliverables:** Profile APIs for both user personas.

---

### Phase 6: Job Requisition Management
- **Objective:** Enable recruiters to author jobs and candidates to discover and filter open positions.
- **Dependencies:** Phase 5.
- **Detailed Tasks:**
  1. Implement `Job` entity, `RoleCategory`, and `JobStatus` enums.
  2. Implement `JobService` (create job, get jobs with filters, get job by ID, update job status).
  3. Implement `JobController` with JSR-380 validation (`@Valid`).
  4. Add recruiter job ownership validation and candidate view projections.
- **Deliverables:** Complete job management APIs with category filtering and validation.

---

### Phase 7: Resume Intelligence & Document Processing
- **Objective:** Integrate Apache PDFBox and Google Gemini for PDF upload, text extraction, and structured parsing.
- **Dependencies:** Phase 6.
- **Detailed Tasks:**
  1. Implement secure file upload handler (size check, PDF MIME check, magic byte verification, UUID storage).
  2. Implement `PdfTextExtractor` using Apache PDFBox 3.x.
  3. Implement `GeminiApiClient` via Spring `WebClient` for structured JSON resume extraction.
  4. Implement `HeuristicFallbackExtractionStrategy` for offline/resilience parsing.
  5. Implement `ResumeService` and `ResumeController` (`POST /api/v1/resumes`, `GET /api/v1/resumes/latest`).
- **Deliverables:** End-to-end resume ingestion and parsing pipeline.

---

### Phase 8: Hybrid AI Candidate-Job Matching Engine
- **Objective:** Implement the 60/40 hybrid matching algorithm combining deterministic skill overlap with LLM narrative evaluation.
- **Dependencies:** Phase 7.
- **Detailed Tasks:**
  1. Implement `DeterministicSkillMatcher` (normalized lowercase matching, exact and substring matching).
  2. Implement `GeminiApiClient.getFitScore` with prompt engineering and strict JSON deserialization.
  3. Implement `HybridMatchingEngine` calculating:
     $$\text{finalScore} = \text{round}(0.6 \times \text{skillOverlapScore} + 0.4 \times \text{llmFitScore})$$
  4. Wire match scoring into job listings and candidate job details.
- **Deliverables:** Explainable candidate-job matching engine with matched and missing skill lists.

---

### Phase 9: Assessment Management & Application Gating Engine
- **Objective:** Implement the assessment question engine, attempt scoring, answer masking, and application gating.
- **Dependencies:** Phase 8.
- **Detailed Tasks:**
  1. Implement `Test`, `Question`, `TestAttempt`, and `TestAnswer` JPA entities and repositories.
  2. Implement `AssessmentService.getTestDetails` mapping to `QuestionCandidateDto` (omitting `correctIndex`).
  3. Implement attempt session initialization (`POST /tests/{testId}/attempts`) verifying candidate has a resume.
  4. Implement attempt submission and scoring (`POST /tests/attempts/{attemptId}/submit`) with double-submission prevention.
  5. Implement `ApplicationWorkflowService.applyToJob` enforcing category assessment gating (HTTP 403 if test not passed).
  6. Implement application workflow transitions (`SHORTLISTED`, `REJECTED`, `INTERVIEW_SCHEDULED`, `HIRED`).
  7. Implement interview scheduling and candidate topic strength/weakness aggregation.
- **Deliverables:** Complete assessment engine and application gating pipeline.

---

### Phase 10: Frontend Development (React 18 + TypeScript + Tailwind)
- **Objective:** Construct a SaaS-caliber user interface with responsive layouts, shadcn/ui components, and interactive workflows.
- **Dependencies:** Phase 9.
- **Detailed Tasks:**
  1. Setup design system, theme tokens, and reusable components (Button, Input, Card, Badge, Modal, Navbar).
  2. Implement `AuthContext`, Axios interceptors, and `ProtectedRoute`.
  3. Build public pages: Marketing Landing Page, About, Contact, Login, Register.
  4. Build Candidate pages:
     - Dashboard with KPI cards, assessment gating status, and skill feedback.
     - Resume Upload with drag-and-drop, PDF preview, and parsed skill tags.
     - Job Browse with category tabs, match score badges, and gated apply modals.
     - Assessment Test Runner with progress bar, masked options, and instant results display.
     - Application Pipeline Tracker with visual step progress and interview details.
  5. Build Recruiter pages:
     - Dashboard with KPI metrics, active jobs table, and top AI matches.
     - Post Job Form with interactive skill chips and category selection.
     - Ranked Applicant List with sort toggles, candidate dossiers, and inline shortlist/reject/schedule/hire actions.
- **Deliverables:** Polished, responsive React application fully integrated with backend REST APIs.

---

### Phase 11: AI Recruitment Assistant (Career Advisor)
- **Objective:** Implement context-grounded conversational assistant grounded in candidate profile data.
- **Dependencies:** Phase 10.
- **Detailed Tasks:**
  1. Implement candidate context assembly in `AiAdvisorService` (skills, applications, passed tests).
  2. Implement conversation history windowing (last 20 messages).
  3. Configure Gemini system prompt with anti-hallucination guardrails and JSON output enforcement.
  4. Implement `AiChatController` (`POST /api/v1/chat`, `GET /api/v1/chat/history`).
  5. Build candidate Chat Widget UI with quick query chips and streaming/loading indicators.
- **Deliverables:** Private, context-aware AI Career Advisor.

---

### Phase 12: Comprehensive Automated Testing & Quality Assurance
- **Objective:** Execute full testing pyramid and verify all 13 critical production edge cases.
- **Dependencies:** Phase 11.
- **Detailed Tasks:**
  1. Implement JUnit 5 and Mockito unit tests for all services and matching algorithms.
  2. Implement MockMvc slice tests for controllers, security filters, and validation.
  3. Implement end-to-end edge case integration suite covering the 13 mandatory edge cases.
  4. Implement Vitest component tests for React UI and form validations.
  5. Generate JaCoCo code coverage report and verify high test coverage.
- **Deliverables:** 100% green test suite across backend and frontend.

---

### Phase 13: Final Dockerization, Production Polish & Documentation Review
- **Objective:** Validate end-to-end Docker deployment, verify database persistence, and conduct final architecture review.
- **Dependencies:** Phase 12.
- **Detailed Tasks:**
  1. Validate `docker compose up --build` from clean state.
  2. Verify database persistence across container restarts.
  3. Verify non-root container security and memory limit optimizations.
  4. Perform final documentation audit and update `docs/IMPLEMENTATION_STATUS.md`.
  5. Commit and push all project code to GitHub repository.
- **Deliverables:** Production-ready ZenHire platform with comprehensive documentation and automated CI verification.

