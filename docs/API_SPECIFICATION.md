# ZenHire — REST API Specification

> **Document Type:** RESTful API Contract & Specification  
> **API Version:** v1 (`/api/v1`)  
> **Standard:** OpenAPI 3.0 / JSON REST Standard  
> **Version:** 1.0.0 (Production Blueprint)

---

## 1. Global API Conventions

### 1.1 Base URL & Pathing
- Base API Path: `http://localhost:8080/api/v1`
- Content Type: `application/json` (except multipart file uploads: `multipart/form-data`)
- Character Encoding: `UTF-8`

### 1.2 Authentication Header
All protected endpoints require the HTTP Authorization header:
```http
Authorization: Bearer <jwt_access_token>
```

### 1.3 Standard Response Envelope
All API responses follow a uniform, predictable response envelope structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "error": null,
  "timestamp": "2026-11-03T10:15:30.123Z"
}
```

### 1.4 Standard Error Response Envelope
When an operation fails, the `data` field is `null` and the `error` object provides machine-readable error codes and human-readable diagnostics:

```json
{
  "success": false,
  "message": "Resource validation failed",
  "data": null,
  "error": {
    "errorCode": "VALIDATION_FAILED",
    "details": "Invalid input parameters provided",
    "validationErrors": [
      {
        "field": "email",
        "rejectedValue": "invalid-email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2026-11-03T10:15:30.123Z"
}
```

### 1.5 Pagination Format
Endpoints returning lists support Spring Data JPA `page`, `size`, and `sort` query parameters, returning a standardized `PageResponse<T>`:
```json
{
  "content": [ ... ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 45,
  "totalPages": 5,
  "isLast": false
}
```

---

## 2. Authentication APIs

### 2.1 User Registration
- **Method & Path:** `POST /api/v1/auth/register`
- **Access:** Public (No Auth)
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "role": "CANDIDATE",
  "companyName": null
}
```
*(Note: `companyName` is required when `role` is `RECRUITER`)*

- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e4b2d184-f7b2-4d1a-8e2b-1a98c7654321",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "ROLE_CANDIDATE",
      "candidateId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "recruiterId": null
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:15:30.123Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Email already registered or invalid fields (`DUPLICATE_RESOURCE` / `VALIDATION_FAILED`).

---

### 2.2 User Login
- **Method & Path:** `POST /api/v1/auth/login`
- **Access:** Public (No Auth)
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e4b2d184-f7b2-4d1a-8e2b-1a98c7654321",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "ROLE_CANDIDATE",
      "candidateId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "recruiterId": null
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:15:30.123Z"
}
```
- **Error Responses:**
  - `401 Unauthorized`: Invalid email or password (`INVALID_CREDENTIALS`).

---

### 2.3 Current Session Profile
- **Method & Path:** `GET /api/v1/auth/me`
- **Access:** Any Authenticated User
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Session verified",
  "data": {
    "user": {
      "id": "e4b2d184-f7b2-4d1a-8e2b-1a98c7654321",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "ROLE_CANDIDATE",
      "candidateId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "recruiterId": null
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:15:30.123Z"
}
```

---

## 3. Candidate & Resume APIs

### 3.1 Upload & Parse Resume
- **Method & Path:** `POST /api/v1/resumes`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data:** `resume`: File binary (`.pdf`, max 5MB)
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Resume uploaded and parsed successfully",
  "data": {
    "resume": {
      "id": "7f8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "fileUrl": "/uploads/7f8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d.pdf",
      "skills": ["Java", "Spring Boot", "React", "PostgreSQL", "Docker", "REST"],
      "experience": "3 years as a Software Engineer building cloud microservices.",
      "education": "B.S. in Computer Science, State University, 2021",
      "uploadedAt": "2026-11-03T10:20:00.000Z"
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:20:01.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Empty file, non-PDF format, or unreadable document (`INVALID_FILE_FORMAT`).
  - `403 Forbidden`: Non-candidate account (`ACCESS_DENIED`).

---

### 3.2 Get Latest Parsed Resume
- **Method & Path:** `GET /api/v1/resumes/latest`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Resume retrieved",
  "data": {
    "resume": {
      "id": "7f8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "fileUrl": "/uploads/7f8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d.pdf",
      "skills": ["Java", "Spring Boot", "React", "PostgreSQL", "Docker"],
      "experience": "3 years as a Software Engineer building cloud microservices.",
      "education": "B.S. in Computer Science, State University, 2021",
      "uploadedAt": "2026-11-03T10:20:00.000Z"
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:21:00.000Z"
}
```
- **Error Responses:**
  - `404 Not Found`: No resume uploaded yet (`RESOURCE_NOT_FOUND`).

---

### 3.3 Get Candidate Dashboard Summary
- **Method & Path:** `GET /api/v1/candidate/dashboard`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Candidate dashboard loaded",
  "data": {
    "hasResume": true,
    "resumeUploadedAt": "2026-11-03T10:20:00.000Z",
    "applicationsCount": 2,
    "tests": [
      {
        "id": "test-gen-1234",
        "title": "General Aptitude & Communication Test",
        "type": "GENERAL",
        "roleCategory": null,
        "passScore": 60,
        "hasAttempted": true,
        "highestScore": 85,
        "passed": true
      },
      {
        "id": "test-back-5678",
        "title": "Backend Engineering Assessment",
        "type": "ROLE_SPECIFIC",
        "roleCategory": "BACKEND",
        "passScore": 60,
        "hasAttempted": true,
        "highestScore": 75,
        "passed": true
      }
    ]
  },
  "error": null,
  "timestamp": "2026-11-03T10:22:00.000Z"
}
```

---

### 3.4 Get Candidate Skill Analytics
- **Method & Path:** `GET /api/v1/candidate/analysis`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Candidate skill analysis aggregated",
  "data": {
    "strongTopics": ["spring-boot", "sql-joins", "rest-principles"],
    "weakTopics": ["distributed-locking", "concurrency"],
    "recommendedRoles": ["BACKEND", "FRONTEND"]
  },
  "error": null,
  "timestamp": "2026-11-03T10:23:00.000Z"
}
```

---

### 3.5 Get Candidate Applications
- **Method & Path:** `GET /api/v1/candidate/applications`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Applications retrieved",
  "data": {
    "applications": [
      {
        "id": "app-001",
        "jobId": "job-101",
        "jobTitle": "Lead Backend Engineer",
        "companyName": "Acme Corp",
        "roleCategory": "BACKEND",
        "matchScore": 88,
        "status": "INTERVIEW_SCHEDULED",
        "appliedAt": "2026-11-03T10:30:00.000Z",
        "interview": {
          "id": "int-999",
          "scheduledTime": "2026-11-05T14:00:00.000Z",
          "mode": "ONLINE",
          "status": "SCHEDULED",
          "notes": "Google Meet technical round."
        }
      }
    ]
  },
  "error": null,
  "timestamp": "2026-11-03T10:24:00.000Z"
}
```

---

## 4. Job Management APIs

### 4.1 Post a New Job
- **Method & Path:** `POST /api/v1/jobs`
- **Access:** Recruiter Only (`ROLE_RECRUITER`)
- **Request Body:**
```json
{
  "title": "Senior Java Backend Engineer",
  "description": "Architect and build high-throughput microservices using Spring Boot and PostgreSQL.",
  "requiredSkills": ["Java", "Spring Boot", "PostgreSQL", "Docker", "REST"],
  "roleCategory": "BACKEND"
}
```
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "job": {
      "id": "job-101",
      "title": "Senior Java Backend Engineer",
      "description": "Architect and build high-throughput microservices using Spring Boot and PostgreSQL.",
      "requiredSkills": ["Java", "Spring Boot", "PostgreSQL", "Docker", "REST"],
      "roleCategory": "BACKEND",
      "status": "OPEN",
      "companyName": "Acme Corp",
      "createdAt": "2026-11-03T10:00:00.000Z"
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:00:01.000Z"
}
```

---

### 4.2 Browse Jobs
- **Method & Path:** `GET /api/v1/jobs`
- **Access:** Any Authenticated User
- **Query Parameters:** `roleCategory` (optional, e.g. `BACKEND`), `page`, `size`
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Jobs retrieved",
  "data": {
    "jobs": [
      {
        "id": "job-101",
        "title": "Senior Java Backend Engineer",
        "description": "Architect and build high-throughput microservices...",
        "requiredSkills": ["Java", "Spring Boot", "PostgreSQL"],
        "roleCategory": "BACKEND",
        "status": "OPEN",
        "companyName": "Acme Corp",
        "createdAt": "2026-11-03T10:00:00.000Z",
        "matchScore": 88,
        "eligible": true
      }
    ]
  },
  "error": null,
  "timestamp": "2026-11-03T10:25:00.000Z"
}
```

---

### 4.3 Get Job Details by ID
- **Method & Path:** `GET /api/v1/jobs/{id}`
- **Access:** Any Authenticated User
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Job details retrieved",
  "data": {
    "job": {
      "id": "job-101",
      "title": "Senior Java Backend Engineer",
      "description": "Architect and build high-throughput microservices...",
      "requiredSkills": ["Java", "Spring Boot", "PostgreSQL"],
      "roleCategory": "BACKEND",
      "status": "OPEN",
      "companyName": "Acme Corp",
      "createdAt": "2026-11-03T10:00:00.000Z",
      "matchScore": 88,
      "matchedSkills": ["Java", "Spring Boot", "PostgreSQL"],
      "missingSkills": [],
      "eligible": true,
      "resumeUploaded": true
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:26:00.000Z"
}
```

---

### 4.4 Apply to Job (Gated)
- **Method & Path:** `POST /api/v1/jobs/{id}/apply`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Successfully applied to job",
  "data": {
    "application": {
      "id": "app-001",
      "jobId": "job-101",
      "candidateId": "cand-001",
      "matchScore": 88,
      "status": "APPLIED",
      "appliedAt": "2026-11-03T10:30:00.000Z"
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:30:01.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Candidate has not uploaded a resume, or candidate already applied to this job (`DUPLICATE_RESOURCE`).
  - `403 Forbidden`: Candidate has not passed the category assessment gate:
```json
{
  "success": false,
  "message": "You must pass the category assessment test before applying.",
  "data": {
    "requiredTest": {
      "testId": "test-back-5678",
      "roleCategory": "BACKEND"
    }
  },
  "error": {
    "errorCode": "ASSESSMENT_GATE_REQUIRED",
    "details": "Candidate must pass assessment test-back-5678"
  },
  "timestamp": "2026-11-03T10:30:00.000Z"
}
```

---

## 5. Assessment APIs

### 5.1 Get Test Questions (Masked)
- **Method & Path:** `GET /api/v1/tests/{testId}`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Test details loaded",
  "data": {
    "test": {
      "id": "test-back-5678",
      "type": "ROLE_SPECIFIC",
      "roleCategory": "BACKEND",
      "title": "Backend Engineering Assessment",
      "passScore": 60,
      "questions": [
        {
          "id": "q-101",
          "questionText": "What is the primary role of Spring Boot auto-configuration?",
          "options": [
            "It generates boilerplate code at runtime using reflection.",
            "It configures Spring beans automatically based on classpath dependencies.",
            "It provides a database migration engine.",
            "It compiles Java code to bytecode."
          ],
          "topicTag": "spring-boot",
          "difficulty": "MEDIUM"
        }
      ]
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:35:00.000Z"
}
```
*(Notice: `correctIndex` is stripped from candidate response)*

---

### 5.2 Start Assessment Attempt
- **Method & Path:** `POST /api/v1/tests/{testId}/attempts`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Test attempt initiated",
  "data": {
    "attemptId": "att-998877"
  },
  "error": null,
  "timestamp": "2026-11-03T10:35:30.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Candidate has no uploaded resume (`RESUME_REQUIRED`).

---

### 5.3 Submit Assessment Attempt
- **Method & Path:** `POST /api/v1/tests/attempts/{attemptId}/submit`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Request Body:**
```json
{
  "answers": [
    { "questionId": "q-101", "selectedIndex": 1 },
    { "questionId": "q-102", "selectedIndex": 0 }
  ]
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Assessment submitted and graded",
  "data": {
    "score": 80,
    "passed": true,
    "breakdown": {
      "correctCount": 8,
      "totalQuestions": 10
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:45:00.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Attempt already submitted (`ATTEMPT_ALREADY_SUBMITTED`).

---

## 6. Recruiter Pipeline & Application Workflow APIs

### 6.1 Recruiter Dashboard KPI Metrics
- **Method & Path:** `GET /api/v1/recruiter/dashboard`
- **Access:** Recruiter Only (`ROLE_RECRUITER`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Recruiter metrics loaded",
  "data": {
    "openJobs": 3,
    "totalApplicants": 24,
    "shortlisted": 7,
    "topScorers": [
      {
        "applicationId": "app-001",
        "candidateName": "John Doe",
        "jobTitle": "Lead Backend Engineer",
        "matchScore": 92,
        "status": "SHORTLISTED"
      }
    ],
    "jobs": [
      {
        "id": "job-101",
        "title": "Lead Backend Engineer",
        "roleCategory": "BACKEND",
        "status": "OPEN",
        "createdAt": "2026-11-01T08:00:00.000Z",
        "applicantsCount": 12
      }
    ]
  },
  "error": null,
  "timestamp": "2026-11-03T10:50:00.000Z"
}
```

---

### 6.2 Get Job Applicants (Ranked)
- **Method & Path:** `GET /api/v1/jobs/{id}/applicants`
- **Access:** Recruiter Only (`ROLE_RECRUITER`, must own the job)
- **Query Parameters:** `sort` (`matchScore` or `appliedAt`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Applicants retrieved",
  "data": {
    "jobTitle": "Lead Backend Engineer",
    "applicants": [
      {
        "applicationId": "app-001",
        "candidateName": "John Doe",
        "candidateEmail": "john@example.com",
        "matchScore": 92,
        "matchedSkills": ["Java", "Spring Boot", "PostgreSQL"],
        "missingSkills": ["GraphQL"],
        "status": "SHORTLISTED",
        "appliedAt": "2026-11-03T10:30:00.000Z",
        "resumeUrl": "/uploads/john-resume.pdf",
        "interview": null
      }
    ]
  },
  "error": null,
  "timestamp": "2026-11-03T10:51:00.000Z"
}
```
- **Error Responses:**
  - `403 Forbidden`: Recruiter attempts to access applicants for a job they do not own (`ACCESS_DENIED`).

---

### 6.3 Shortlist Applicant
- **Method & Path:** `POST /api/v1/applications/{id}/shortlist`
- **Access:** Recruiter Only (`ROLE_RECRUITER`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Candidate shortlisted successfully",
  "data": {
    "applicationId": "app-001",
    "status": "SHORTLISTED"
  },
  "error": null,
  "timestamp": "2026-11-03T10:52:00.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Invalid transition (e.g., status is not `APPLIED`).

---

### 6.4 Reject Applicant
- **Method & Path:** `POST /api/v1/applications/{id}/reject`
- **Access:** Recruiter Only (`ROLE_RECRUITER`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Candidate rejected",
  "data": {
    "applicationId": "app-001",
    "status": "REJECTED"
  },
  "error": null,
  "timestamp": "2026-11-03T10:53:00.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Candidate is in a terminal state (`HIRED` or `REJECTED`).

---

### 6.5 Schedule Interview
- **Method & Path:** `POST /api/v1/applications/{id}/interview`
- **Access:** Recruiter Only (`ROLE_RECRUITER`)
- **Request Body:**
```json
{
  "scheduledTime": "2026-11-06T15:30:00.000Z",
  "mode": "ONLINE",
  "notes": "System design and deep-dive technical round."
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Interview scheduled",
  "data": {
    "interview": {
      "id": "int-777",
      "scheduledTime": "2026-11-06T15:30:00.000Z",
      "mode": "ONLINE",
      "status": "SCHEDULED",
      "notes": "System design and deep-dive technical round."
    },
    "application": {
      "id": "app-001",
      "status": "INTERVIEW_SCHEDULED"
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:54:00.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Application status is not `SHORTLISTED` or `INTERVIEW_SCHEDULED`.

---

### 6.6 Hire Applicant
- **Method & Path:** `POST /api/v1/applications/{id}/hire`
- **Access:** Recruiter Only (`ROLE_RECRUITER`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Candidate hired",
  "data": {
    "applicationId": "app-001",
    "status": "HIRED"
  },
  "error": null,
  "timestamp": "2026-11-03T10:55:00.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Application status is not `INTERVIEW_SCHEDULED`.

---

## 7. AI Assistant APIs

### 7.1 Send Chat Message to AI Career Advisor
- **Method & Path:** `POST /api/v1/chat`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Request Body:**
```json
{
  "message": "What skills should I learn to improve my match score for backend roles?"
}
```
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "AI reply generated",
  "data": {
    "reply": "Based on your verified profile, you have solid proficiency in Java, Spring Boot, and PostgreSQL. To boost your match score for active backend openings, consider adding Redis caching and Docker container orchestration.",
    "aiMessage": {
      "id": "msg-888",
      "sender": "AI",
      "message": "Based on your verified profile...",
      "createdAt": "2026-11-03T10:56:00.000Z"
    }
  },
  "error": null,
  "timestamp": "2026-11-03T10:56:01.000Z"
}
```

---

### 7.2 Get Chat History
- **Method & Path:** `GET /api/v1/chat/history`
- **Access:** Candidate Only (`ROLE_CANDIDATE`)
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Chat history retrieved",
  "data": {
    "messages": [
      {
        "id": "msg-001",
        "sender": "CANDIDATE",
        "message": "What skills should I learn?",
        "createdAt": "2026-11-03T10:55:50.000Z"
      },
      {
        "id": "msg-002",
        "sender": "AI",
        "message": "Based on your verified profile...",
        "createdAt": "2026-11-03T10:56:00.000Z"
      }
    ]
  },
  "error": null,
  "timestamp": "2026-11-03T10:56:05.000Z"
}
```

