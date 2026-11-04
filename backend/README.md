# ZenHire — Backend Service

The backend of **ZenHire** is an enterprise-grade modular monolith built with **Java 21** and **Spring Boot 3.3.0**. It manages authentication, job requisitions, resume parsing, technical assessments, hybrid candidate-job matching, and AI career guidance.

---

## 1. Technology Stack

- **Language:** Java 21 (LTS)
- **Framework:** Spring Boot 3.3.0
- **Security:** Spring Security 6 with stateless JWT authentication & BCrypt hashing
- **Persistence:** Spring Data JPA & Hibernate 6
- **Database:** PostgreSQL 16 with Flyway 10 migrations
- **Document Processing:** Apache PDFBox 3.0.2
- **AI Integration:** Google Gemini 1.5 Flash (via Spring WebClient)
- **Validation:** Bean Validation (Hibernate Validator)
- **Build Tool:** Maven 3.9+
- **Testing:** JUnit 5, Mockito, MockMvc

---

## 2. Package Architecture

```
com.zenhire/
├── ZenHireApplication.java       # Application entry point
├── common/                       # Global DTOs, ApiResponse wrapper, Exception handling
│   ├── dto/                      # ApiResponse, ErrorResponse, PageResponse
│   └── exception/                # GlobalExceptionHandler, ResourceNotFoundException, etc.
├── config/                       # WebMvcConfig, CorsConfig
├── security/                     # SecurityConfig, JwtTokenProvider, JwtAuthenticationFilter
├── auth/                         # Login, Register, AuthController, AuthService
├── candidate/                    # Candidate dashboard, profile diagnostics
├── recruiter/                    # Recruiter dashboard, KPI metrics, applicant pipelines
├── job/                          # Job requisitions, search, JobController, JobRepository
├── resume/                       # PDF parsing (PDFBox), ResumeService, ResumeEntity
├── assessment/                   # Tests, questions, answer masking, attempt scoring
├── application/                  # Job applications, workflow status, interview scheduling
├── matching/                     # 60/40 Hybrid matching engine (Deterministic + Gemini LLM)
└── chat/                         # AI Career Advisor, prompt engineering, Gemini client
```

---

## 3. Configuration & Environment Variables

Key configuration properties in `src/main/resources/application.yml` and their corresponding environment variables:

| Environment Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/zenhire_db` | PostgreSQL JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME`| `zenhire_user` | Database user |
| `SPRING_DATASOURCE_PASSWORD`| `zenhire_secure_pass_2026` | Database password |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 256-bit HMAC secret key |
| `JWT_EXPIRATION` | `86400000` | Token validity in milliseconds (24 hours) |
| `GEMINI_API_KEY` | *(empty)* | Google Gemini API key for AI features |
| `FILE_UPLOAD_DIR` | `./uploads` | Local disk directory for uploaded resume PDFs |

---

## 4. Local Development

### 1. Start Database
```bash
docker run --name zenhire-postgres -e POSTGRES_DB=zenhire_db -e POSTGRES_USER=zenhire_user -e POSTGRES_PASSWORD=zenhire_secure_pass_2026 -p 5432:5432 -d postgres:16-alpine
```

### 2. Run Migrations & Start Server
```bash
mvn clean spring-boot:run -Dspring-boot.run.profiles=dev
```
The server will start on `http://localhost:8080/api`.

### 3. Run Tests
```bash
mvn test
```

---

## 5. Core API Endpoints

All responses follow the unified envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a candidate or recruiter account
- `POST /api/auth/login` — Authenticate and receive a JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile

### Jobs (`/api/jobs`)
- `GET /api/jobs` — Browse and filter published job requisitions
- `GET /api/jobs/{id}` — Get detailed job specification
- `POST /api/jobs` — Create new requisition (Recruiter only)

### Resumes (`/api/resumes`)
- `POST /api/resumes/upload` — Upload PDF resume (Apache PDFBox extraction + Gemini sync)
- `GET /api/resumes/latest` — Retrieve parsed profile and extracted skill tags

### Assessments (`/api/assessments`)
- `GET /api/assessments` — List technical assessments and candidate pass status
- `GET /api/assessments/{id}` — Retrieve assessment details with masked answer keys
- `POST /api/assessments/{id}/start` — Start a test attempt
- `POST /api/assessments/attempts/{attemptId}/submit` — Submit answers for grading

### Applications & Pipeline (`/api/applications`)
- `POST /api/applications/apply/{jobId}` — Apply for a role (enforces assessment gating)
- `GET /api/applications/my` — Candidate active applications pipeline
- `GET /api/applications/job/{jobId}` — Recruiter ranked applicant pipeline
- `PATCH /api/applications/{id}/status` — Update application status
- `POST /api/applications/{id}/schedule-interview` — Schedule virtual or on-site interview

### Hybrid Matching & AI (`/api/matching`, `/api/chat`)
- `GET /api/matching/job/{jobId}` — Calculate 60/40 compatibility score for current user
- `POST /api/chat` — Contextual AI career advisor chat

---

## 6. Security & Anti-Cheat Measures

1. **DTO-Level Answer Key Masking:** Question entities keep `correctIndex` strictly hidden inside the persistence layer. Candidate-facing DTOs omit correct answers to eliminate client-side inspection vulnerabilities.
2. **Strict Server-Side Gating:** Application attempts check test records in the database. Even if client-side validation is bypassed, the server returns an `ASSESSMENT_GATE_REQUIRED` error (HTTP 403).
3. **Resilient AI Fallbacks:** If Gemini API limits or network issues occur, the system automatically falls back to an integrated 120+ keyword heuristic matcher.
