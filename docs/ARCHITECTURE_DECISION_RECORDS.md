# ZenHire — Architecture Decision Records (ADRs)

> **Document Type:** Architectural Decision Records (ADRs)  
> **Format Standard:** Michael Nygard ADR Template  
> **Status:** All Accepted & Frozen for Production Build  
> **Version:** 1.0.0 (Production Blueprint)

---

## Index of Architectural Decisions

- [ADR-001: Modular Monolith vs Microservices Architecture](#adr-001-modular-monolith-vs-microservices-architecture)
- [ADR-002: Java 21 & Spring Boot 3.3.x for Enterprise Backend](#adr-002-java-21--spring-boot-33x-for-enterprise-backend)
- [ADR-003: PostgreSQL 16 & Flyway for Relational Persistence](#adr-003-postgresql-16--flyway-for-relational-persistence)
- [ADR-004: Stateless JWT Authentication via Bearer Header](#adr-004-stateless-jwt-authentication-via-bearer-header)
- [ADR-005: Hybrid Candidate-Job Matching Formula (60/40)](#adr-005-hybrid-candidate-job-matching-formula-6040)
- [ADR-006: Apache PDFBox for Deterministic Text Extraction](#adr-006-apache-pdfbox-for-deterministic-text-extraction)
- [ADR-007: Google Gemini 1.5 Flash for AI Operations](#adr-007-google-gemini-15-flash-for-ai-operations)
- [ADR-008: Server-Side Assessment Grading & Strict Answer Masking](#adr-008-server-side-assessment-grading--strict-answer-masking)
- [ADR-009: Category-Wide Assessment Credential Reusability](#adr-009-category-wide-assessment-credential-reusability)
- [ADR-010: Docker Compose for Multi-Container Deployment](#adr-010-docker-compose-for-multi-container-deployment)

---

### ADR-001: Modular Monolith vs Microservices Architecture

- **Status:** Accepted
- **Context:** ZenHire requires rapid transaction boundaries across candidate profiles, resumes, assessments, applications, and job requisitions. We need to decide whether to decompose the application into microservices or build a modular monolith.
- **Decision:** Build ZenHire as an **Enterprise Modular Monolith** in Spring Boot 3.3.x, structured by package-by-feature modules (`com.zenhire.candidate`, `com.zenhire.job`, etc.).
- **Alternatives Considered:**
  - *Microservices Architecture:* Multiple independent services (Auth Service, Job Service, Matching Service, Assessment Service) communicating via REST or message queues. Rejected due to high operational complexity, distributed transaction latency, and network overhead.
  - *Spaghetti Monolith (Single flat package):* Rejected due to tight entity coupling and lack of clear domain boundaries.
- **Consequences & Trade-offs:**
  - *Positive:* Fast local development, single deployment artifact, ACID in-memory transactions, zero network latency between modules.
  - *Negative:* Cannot scale individual modules independently (e.g., scaling matching engine without scaling auth). Mitigated by designing decoupled service interfaces that can be extracted cleanly into independent services if traffic demands.

---

### ADR-002: Java 21 & Spring Boot 3.3.x for Enterprise Backend

- **Status:** Accepted
- **Context:** We need a robust, enterprise-grade backend platform capable of handling asynchronous document processing, strict type-safety, and production-proven security.
- **Decision:** Use **Java 21 LTS** with **Spring Boot 3.3.x**.
- **Alternatives Considered:**
  - *Node.js / Express:* Fast to prototype, but dynamically typed, single-threaded CPU-bound limitations during heavy document processing, and less mature dependency injection ecosystem for enterprise software engineering.
  - *Python / FastAPI:* Strong for AI prototyping, but lacks the mature enterprise transaction management, JPA entity graphs, and Spring Security filter chains expected for enterprise portfolio engineering.
- **Consequences & Trade-offs:**
  - *Positive:* Virtual threads (Project Loom), strict static typing, robust Bean Validation (JSR-380), mature Spring Data JPA / Hibernate ecosystem, and Spring Security 6.
  - *Negative:* Higher memory baseline compared to lightweight Go or Node runtimes. Mitigated by using container JVM flags (`-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0`).

---

### ADR-003: PostgreSQL 16 & Flyway for Relational Persistence

- **Status:** Accepted
- **Context:** ZenHire requires relational integrity, foreign key cascades, complex multi-table joins, and version-controlled schema evolution.
- **Decision:** Use **PostgreSQL 16** with **Flyway** for automated, versioned SQL migrations.
- **Alternatives Considered:**
  - *SQLite:* File-based, zero-concurrency write locks, lacks native JSONB indexing, lacks comprehensive user privilege controls.
  - *MongoDB:* Schema-less, but applicant tracking and assessment gating are inherently relational with strict foreign key constraints.
- **Consequences & Trade-offs:**
  - *Positive:* Full ACID compliance, native JSONB support for question options and skill arrays, excellent B-Tree indexing, repeatable migrations via Flyway.
  - *Negative:* Requires running a dedicated database container or server process. Mitigated by Docker Compose containerization.

---

### ADR-004: Stateless JWT Authentication via Bearer Header

- **Status:** Accepted
- **Context:** We need a scalable, stateless authentication mechanism suitable for a single-page React frontend and RESTful backend.
- **Decision:** Use **JSON Web Tokens (JWT)** signed via HMAC-SHA256, transmitted via the `Authorization: Bearer <token>` HTTP header, and stored client-side in browser memory/localStorage.
- **Alternatives Considered:**
  - *Stateful HTTP Sessions (JSESSIONID cookies):* Requires server-side session stores (Redis) to scale horizontally and introduces CSRF complexities.
  - *HttpOnly Cookies:* Stronger XSS protection, but complicates cross-origin local development and requires strict SameSite/CORS cookie configuration.
- **Consequences & Trade-offs:**
  - *Positive:* 100% stateless backend, no database lookup required for standard authenticated endpoint requests, simple client integration.
  - *Negative:* Token cannot be immediately revoked before expiration without a distributed token blacklist. Mitigated by keeping token lifespan to 24 hours.

---

### ADR-005: Hybrid Candidate-Job Matching Formula (60/40)

- **Status:** Accepted
- **Context:** Pure LLM scoring is non-deterministic and susceptible to hallucinations, while pure keyword matching misses semantic context.
- **Decision:** Implement a **hybrid matching algorithm**:  
  $$\text{finalScore} = \text{round}(0.6 \times \text{skillOverlapScore} + 0.4 \times \text{llmFitScore})$$  
  where `skillOverlapScore` is computed deterministically in Java, and `llmFitScore` evaluates qualitative narrative depth via Google Gemini.
- **Alternatives Considered:**
  - *100% Deterministic Keyword Count:* Simple, but penalizes candidates who describe relevant experience without exact keyword matches.
  - *100% Generative LLM Score:* Hallucinates numbers, lacks reproducibility, and vulnerable to prompt injection attacks.
- **Consequences & Trade-offs:**
  - *Positive:* Grounded in hard facts (verified skills), fully explainable to recruiters, highly reproducible.
  - *Negative:* Requires an external API call to Gemini for each candidate-job evaluation. Mitigated by caching evaluations on the `Application` record.

---

### ADR-006: Apache PDFBox for Deterministic Text Extraction

- **Status:** Accepted
- **Context:** Candidates upload resumes in PDF format. We need a reliable, deterministic Java library to extract raw text streams without external cloud dependencies.
- **Decision:** Use **Apache PDFBox 3.x**.
- **Alternatives Considered:**
  - *iText:* Powerful, but commercial licensing restrictions (AGPL / commercial license required).
  - *Tesseract OCR:* Excellent for scanned images, but very resource-heavy and slow for standard digital text PDFs.
- **Consequences & Trade-offs:**
  - *Positive:* Open-source (Apache 2.0 license), zero native dependencies, fast extraction of text streams from digital PDFs.
  - *Negative:* Cannot extract text from purely scanned images without OCR. Scanned PDFs are flagged to the candidate to provide a text-based document.

---

### ADR-007: Google Gemini 1.5 Flash for AI Operations

- **Status:** Accepted
- **Context:** The platform requires structured resume parsing, narrative evaluation, and conversational career guidance.
- **Decision:** Integrate **Google Gemini 1.5 Flash** using Spring `WebClient`.
- **Alternatives Considered:**
  - *OpenAI GPT-4o / GPT-4o-mini:* Comparable performance, but higher token pricing and requires credit card billing setup.
  - *Local Ollama / LLaMA-3:* Private, but requires high GPU memory (8GB+ VRAM) on the host machine, making it unsuitable for universal developer onboarding.
- **Consequences & Trade-offs:**
  - *Positive:* Fast inference (600–900ms), 1M token context window, free tier available via Google AI Studio, highly capable JSON schema extraction.
  - *Negative:* Requires external internet connection and active API key. Mitigated by heuristic fallback strategies.

---

### ADR-008: Server-Side Assessment Grading & Strict Answer Masking

- **Status:** Accepted
- **Context:** To ensure assessment integrity, candidate clients must never be able to inspect source code or network responses to identify correct answers.
- **Decision:** Grade all assessments **strictly server-side** in Java, and use dedicated candidate DTOs (`QuestionCandidateDto`) that **physically omit `correctIndex`**.
- **Alternatives Considered:**
  - *Client-Side JavaScript Grading:* Exposing `correctIndex` in the frontend payload and grading in React. Rejected as a critical security vulnerability.
- **Consequences & Trade-offs:**
  - *Positive:* Anti-cheating security guaranteed at the network layer.
  - *Negative:* Requires a round-trip network call to the server to grade the attempt. Acceptable since test submission is an explicit, deliberate user action.

---

### ADR-009: Category-Wide Assessment Credential Reusability

- **Status:** Accepted
- **Context:** We need to decide whether a candidate must take an assessment for *every single job* they apply to, or if passing a category assessment unlocks all jobs in that category.
- **Decision:** Passing a role-specific assessment (e.g. `Backend Engineering Assessment` for `BACKEND`) **unlocks all current and future jobs** within that category.
- **Alternatives Considered:**
  - *Per-Job Assessment:* Forces candidates to retake identical tests 10 times if applying to 10 backend jobs. Rejected due to extreme candidate fatigue.
- **Consequences & Trade-offs:**
  - *Positive:* Respects candidate time, models real-world credentialing, encourages applying to multiple relevant roles.
  - *Negative:* Candidate who barely passes cannot be re-screened by a different recruiter without a custom assessment. Mitigated by candidate being able to retake tests to improve their score.

---

### ADR-010: Docker Compose for Multi-Container Deployment

- **Status:** Accepted
- **Context:** The system consists of a PostgreSQL database, a Spring Boot backend, and a React frontend. Setup must be frictionless on any developer OS.
- **Decision:** Standardize on **Docker Compose** with multi-stage Dockerfiles and container health checks.
- **Alternatives Considered:**
  - *Manual Local Installation:* Requiring developers to install Java 21, Maven, Node.js, and PostgreSQL locally. Prone to environment divergence ("works on my machine").
  - *Kubernetes (Minikube / k8s):* Over-engineered for a single-node portfolio deployment.
- **Consequences & Trade-offs:**
  - *Positive:* Deterministic, one-command execution (`docker compose up --build`), persistent named volumes, isolated bridge networking.
  - *Negative:* Requires Docker Desktop installed on the host machine.
