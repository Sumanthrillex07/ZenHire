# SDE-1 Engineering Masterclass — 04: REST API Design & Exception Architecture

> **Focus:** RESTful Idempotency, HTTP Semantics, JSR-380 Bean Validation, Global Exception Handling  
> **Target Audience:** SDE-1 Backend / Full-Stack Engineers  
> **Project Context:** ZenHire Enterprise Recruitment Platform

---

## 1. Architectural Concept Deep-Dives (The 8 Mandatory Questions)

### Concept 4.1: HTTP Semantics & Idempotency in REST APIs

#### 1. What is it?
HTTP semantics define the expected behavior, safety, and idempotency of standard HTTP verbs:
- **Safe Methods (Read-only, no side effects):** `GET`, `HEAD`, `OPTIONS`.
- **Idempotent Methods (Executing $N \ge 1$ times produces the identical server state):** `GET`, `PUT`, `DELETE`.
- **Non-Idempotent Methods (Executing multiple times can produce different states or duplicate records):** `POST`.

#### 2. Why are we using it in ZenHire?
In recruitment platforms, non-idempotent operations must be guarded against duplicate execution (e.g., submitting job applications, test attempts, or scheduling interviews). Aligning HTTP verbs to proper REST standards makes APIs intuitive, cacheable, and predictable.

#### 3. How does it work internally?
In ZenHire:
- `POST /api/v1/jobs`: Non-idempotent creation of a new job posting (returns `201 Created`).
- `POST /api/v1/jobs/{id}/apply`: Non-idempotent application creation. We enforce logical idempotency on the server by rejecting duplicate applications with `400 Bad Request` or `409 Conflict`.
- `GET /api/v1/jobs/{id}`: Safe and idempotent (returns `200 OK`).
- `PUT /api/v1/candidate/profile`: Idempotent full replacement of profile fields (returns `200 OK`).

#### 4. Where is it implemented in ZenHire?
Across all controller endpoints in `com.zenhire.*.controller`:
```java
// JobController.java
@PostMapping
public ResponseEntity<ApiResponse<JobResponseDto>> createJob(
        @Valid @RequestBody CreateJobRequestDto requestDto) {
    JobResponseDto created = jobService.createJob(requestDto);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Job created successfully", created));
}
```

#### 5. What problem does it solve?
Prevents accidental duplicate applications, duplicate interview scheduling, and inconsistent client-side UI states caused by network retries.

#### 6. What are the alternatives?
- **RPC / gRPC:** Invoking remote procedures over HTTP/2 using protocol buffers. Faster, but less accessible for browser-based web applications.
- **GraphQL:** Single endpoint (`POST /graphql`) querying arbitrary graphs. Flexible, but eliminates HTTP-level caching and complicates authorization.

#### 7. What are the trade-offs?
- Strict REST requires adhering to standard status codes and stateless URL design rather than arbitrary endpoints like `/api/doApplyJob`. This requires more upfront API design discipline.

#### 8. What questions could an interviewer ask about it?
> *"What is the difference between `PUT` and `PATCH` in REST API design?"*  
> **Strong Answer:** "`PUT` is an idempotent method intended for complete replacement of the target resource with the uploaded payload. Any fields omitted in the `PUT` payload are typically overwritten or reset to null. `PATCH` is intended for partial modification, applying a delta where only the specified fields are updated and omitted fields remain unchanged."

---

### Concept 4.2: JSR-380 Bean Validation & `@RestControllerAdvice`

#### 1. What is it?
JSR-380 (Jakarta / Bean Validation 2.0) is the standard Java specification for declarative object constraint validation using annotations (`@NotNull`, `@NotBlank`, `@Size`, `@Email`). `@RestControllerAdvice` is a Spring component that intercepts exceptions thrown across all `@RestController` beans to return standardized JSON error responses.

#### 2. Why are we using it in ZenHire?
Without automated validation and global exception handling:
- Controllers become cluttered with manual `if (email == null) return error;` validation blocks.
- Unhandled runtime exceptions dump ugly internal stack traces (leaking database tables and class names) to the client with generic HTTP 500 status codes.

#### 3. How does it work internally?
1. The client sends a JSON payload to a controller method annotated with `@Valid @RequestBody`.
2. Spring’s `RequestResponseBodyMethodProcessor` deserializes the JSON using Jackson.
3. Hibernate Validator validates all annotated fields on the DTO.
4. If any constraint fails, Spring throws a `MethodArgumentNotValidException` before the controller method executes.
5. `GlobalExceptionHandler` (`@RestControllerAdvice`) intercepts the exception, formats field error messages into a clean `ApiResponse<T>`, and returns HTTP `400 Bad Request`.

#### 4. Where is it implemented in ZenHire?
In `RegisterRequestDto.java` and `GlobalExceptionHandler.java`:
```java
// DTO with validation annotations
public record RegisterRequestDto(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password,

    @NotNull(message = "Role is required")
    Role role,

    String companyName
) {}

// Global exception advice
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        List<ValidationErrorItem> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(err -> new ValidationErrorItem(err.getField(), err.getDefaultMessage()))
            .toList();

        ApiError apiError = new ApiError("VALIDATION_FAILED", "Invalid request parameters", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Validation failed", apiError));
    }
}
```

#### 5. What problem does it solve?
Eliminates repetitive validation logic in controllers, guarantees consistent API error payloads for frontend parsing, and prevents internal server leaks.

#### 6. What are the alternatives?
- Manual procedural validation inside controllers or services. Error-prone and violates DRY principles.

#### 7. What are the trade-offs?
Complex cross-field validations (e.g., "if role is RECRUITER, companyName must not be blank") require custom class-level validator annotations or service-layer validation.

#### 8. What questions could an interviewer ask about it?
> *"How do you handle custom business exceptions in a Spring Boot REST API?"*  
> **Strong Answer:** "We create domain-specific runtime exceptions extending a base `BaseApiException` (such as `AssessmentGatingException` or `ResourceNotFoundException`). In a centralized `@RestControllerAdvice` class, we define `@ExceptionHandler` methods for each exception type, extracting the error code and message into a standardized `ApiResponse` envelope with the appropriate HTTP status code (e.g. 404 for not found, 403 for gating blocked)."

---

## 2. Interview Preparation & REST API Flashcards

### Question 1: "What HTTP status code should be returned when a resource is created, and what header should accompany it?"
**Answer:**  
HTTP `201 Created` should be returned. According to the HTTP/1.1 specification (RFC 7231), the response should ideally include a `Location` header pointing to the URI of the newly created resource (e.g., `Location: /api/v1/jobs/e4b2d184-f7b2-4d1a-8e2b-1a98c7654321`).

### Question 2: "What is the difference between HTTP 401 Unauthorized and HTTP 403 Forbidden?"
**Answer:**  
- **401 Unauthorized:** Authentication is missing or invalid. The client has not proven who they are (e.g., missing JWT token, expired token, or invalid credentials).
- **403 Forbidden:** The client is authenticated and their identity is known, but they do NOT have permission to perform the requested operation (e.g., a candidate trying to call `/api/v1/recruiter/dashboard`, or recruiter B trying to access applicants for recruiter A's job).
