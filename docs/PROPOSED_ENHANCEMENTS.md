# ZenHire — Proposed Future Enhancements

> **Document Type:** Strategic Product Enhancements & Scale Roadmap  
> **Note:** These items represent valuable post-v1 capabilities. They are explicitly isolated from the approved core scope to maintain engineering discipline.  
> **Version:** 1.0.0

---

## 1. Post-v1 Architectural Enhancements

### 1.1 Asynchronous Background Processing via Message Broker (RabbitMQ / Kafka)
- **Current Architecture:** Resume PDF text extraction and Gemini LLM parsing execute synchronously within the HTTP request cycle (bounded by a 4-second SLA).
- **Proposed Enhancement:** Decouple resume ingestion into an asynchronous event-driven pipeline:
  1. Candidate uploads resume -> Backend saves file and publishes `ResumeUploadedEvent` to RabbitMQ.
  2. Background worker consumes event, processes Apache PDFBox stream, invokes Gemini LLM, updates database record, and pushes a WebSocket notification to the client.
- **Benefits:** Prevents HTTP connection exhaustion during sudden traffic spikes; enables independent auto-scaling of AI ingestion workers.

---

### 1.2 Semantic Vector Search with `pgvector`
- **Current Architecture:** Hybrid matching computes skill overlap deterministically and evaluates narrative depth for candidate-job pairs individually on demand.
- **Proposed Enhancement:** Store dense vector embeddings (using Google `text-embedding-004`) for candidate resumes and job descriptions directly in PostgreSQL using the `pgvector` extension.
- **Benefits:** Enables instant approximate nearest neighbor (ANN) cosine similarity queries across 100,000+ candidate profiles in milliseconds, allowing recruiters to search "Find candidates who have built high-scale payment processing systems" even if the resume doesn't use those exact words.

---

### 1.3 Enterprise OAuth2 & Social Sign-In (Google & GitHub)
- **Current Architecture:** Email/Password authentication with BCrypt hashing and JWT tokens.
- **Proposed Enhancement:** Integrate Spring Security OAuth2 Client supporting "Sign in with Google" and "Sign in with GitHub".
- **Benefits:** Reduces candidate registration friction, eliminates password fatigue, and allows direct syncing with candidates' verified GitHub repositories.

---

### 1.4 Automated Email & Calendar Integrations
- **Current Architecture:** Interview schedules are persisted in PostgreSQL and displayed on dashboards without outbound dispatch.
- **Proposed Enhancement:** Integrate AWS SES / SendGrid to dispatch transactional emails upon status transitions (`SHORTLISTED`, `INTERVIEW_SCHEDULED`, `HIRED`), and generate `.ics` calendar invitation attachments for Google Calendar and Outlook.
- **Benefits:** Improves candidate attendance rates and professional recruitment polish.

---

### 1.5 Recruiter Custom Assessment & Coding Sandbox Engine
- **Current Architecture:** Questions are sourced from the global categorized question repository seeded via Flyway.
- **Proposed Enhancement:** Allow recruiters to author proprietary custom assessments for specific job postings, including an in-browser code editor (Monaco Editor) executing code securely inside isolated Docker sandboxes.
- **Benefits:** Attracts enterprise recruiters who require custom take-home algorithmic evaluations.

---

### 1.6 Embedded WebRTC Video Screening
- **Current Architecture:** Recruiter records `mode` (`ONLINE` / `OFFLINE`) and adds an external meeting link in the interview notes.
- **Proposed Enhancement:** Integrate an embedded WebRTC room (via Daily.co or LiveKit) directly into the recruiter dossier interface, enabling 1-click video interviews without third-party tool switching.
- **Benefits:** Provides a true all-in-one recruiting workstation.
