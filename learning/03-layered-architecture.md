# SDE-1 Engineering Masterclass — 03: Layered Architecture & Transaction Boundaries

> **Focus:** Separation of Concerns, DTO Pattern, Entity Encapsulation, `@Transactional` Boundaries  
> **Target Audience:** SDE-1 Backend / Full-Stack Engineers  
> **Project Context:** ZenHire Enterprise Recruitment Platform

---

## 1. Architectural Concept Deep-Dives (The 8 Mandatory Questions)

### Concept 3.1: Layered Architecture & Entity vs DTO Separation

#### 1. What is it?
Layered architecture organizes an enterprise application into distinct horizontal responsibilities:
- **Presentation / Controller Layer:** Handles HTTP serialization, deserialization, status codes, and input validation.
- **Service Layer:** Encapsulates business logic, domain rules, state machines, and transaction boundaries.
- **Repository / Persistence Layer:** Manages database queries, relational persistence, and caching.
- **Entity vs DTO Separation:** Entities represent database records and relational mappings. Data Transfer Objects (DTOs) represent the strict public contract of the API.

#### 2. Why are we using it in ZenHire?
Directly exposing database entities in REST APIs is one of the most common SDE-1 anti-patterns. In ZenHire:
1. `Question` entity has a `correctIndex` field. If we return the entity directly, correct answers leak to candidates.
2. `User` entity has a `passwordHash` field. Exposing the entity risks credential disclosure.
3. Entities often contain lazy-loaded collections (`@OneToMany`). Serializing them directly triggers Hibernate `LazyInitializationException` or catastrophic N+1 query storms.

#### 3. How does it work internally?
MapStruct or manual mappers translate incoming DTOs to Entities, and outgoing Entities to DTOs:
```java
// Controller Layer
@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {
    private final JobService jobService;

    @PostMapping
    public ResponseEntity<ApiResponse<JobResponseDto>> createJob(
            @Valid @RequestBody CreateJobRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        JobResponseDto responseDto = jobService.createJob(principal.getRecruiterId(), requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(responseDto));
    }
}
```
Controllers never interact with JPA repositories or database transactions directly.

#### 4. Where is it implemented in ZenHire?
In every module:
- `com.zenhire.job.controller.JobController` -> `JobService` -> `JobRepository` -> `Job` (Entity)
- DTOs in `com.zenhire.job.dto`: `CreateJobRequestDto`, `JobResponseDto`, `JobDetailResponseDto`.

#### 5. What problem does it solve?
Prevents tight coupling between the public REST API and internal database schema changes, prevents accidental information disclosure (passwords, correct test answers), and isolates business rules from HTTP framework details.

#### 6. What are the alternatives?
- **Active Record Pattern (e.g. Ruby on Rails, Django models):** Database models contain business logic and database access directly. Unsuitable for enterprise Java due to concurrency and testing hurdles.
- **GraphQL with Resolvers:** Exposes graph queries directly on domain models.

#### 7. What are the trade-offs?
- **Trade-off:** Writing DTOs and mappers requires additional boilerplate code.
- **Mitigation:** We use Java 21 `record` classes for immutable DTOs and MapStruct for high-performance compile-time mapping.

#### 8. What questions could an interviewer ask about it?
> *"Why should you never return Hibernate/JPA entities directly from a Spring `@RestController`?"*  
> **Strong Answer:** "First, security: internal fields like password hashes or masked assessment answers can accidentally serialize to JSON. Second, stability: changing a database column or relationship immediately breaks public API clients. Third, performance: Jackson deserialization can trigger lazy-loading of child collections, causing `LazyInitializationException` if the session is closed, or causing massive N+1 query loops."

---

### Concept 3.2: Spring Transaction Boundaries (`@Transactional`)

#### 1. What is it?
Spring’s `@Transactional` annotation declaratively defines database transaction boundaries around service methods. It guarantees ACID properties (Atomicity, Consistency, Isolation, Durability) using AOP proxies.

#### 2. Why are we using it in ZenHire?
When a candidate applies to a job, multiple database mutations must occur atomically:
1. Verify the candidate passed the gating assessment.
2. Calculate and persist the `Application` record.
3. Compute matching scores.
If any step fails (e.g., unique constraint violation or AI failure), the entire operation must roll back cleanly without leaving orphan partial records in PostgreSQL.

#### 3. How does it work internally?
1. Spring creates a dynamic AOP proxy around the `@Service` class.
2. When a `@Transactional` method is invoked:
   - The proxy obtains a JDBC connection from `HikariDataSource` and sets `connection.setAutoCommit(false)`.
   - The connection is bound to the current thread using `TransactionSynchronizationManager`.
   - The target service method executes.
   - If the method completes normally, the proxy calls `connection.commit()`.
   - If an unhandled `RuntimeException` or `Error` is thrown, the proxy calls `connection.rollback()`.
   - The connection is closed (returned to the pool).

#### 4. Where is it implemented in ZenHire?
In `ApplicationWorkflowServiceImpl.java`:
```java
@Service
@Transactional(readOnly = true) // Default all reads to read-only for optimization
public class ApplicationWorkflowServiceImpl implements ApplicationWorkflowService {

    @Override
    @Transactional(rollbackFor = Exception.class) // Explicit write transaction
    public ApplicationResponseDto applyToJob(UUID candidateId, UUID jobId) {
        // Atomic operations: validation, gating check, matching score calculation, persistence
    }
}
```

#### 5. What problem does it solve?
Eliminates manual `connection.commit()` and `connection.rollback()` try-catch boilerplate, guarantees atomic database state, and optimizes read queries when `readOnly = true` is specified (Hibernate skips dirty-checking on read-only sessions).

#### 6. What are the alternatives?
- **Programmatic Transaction Management:** Using `TransactionTemplate` or `PlatformTransactionManager`. Useful for granular sub-method transactions, but verbose.

#### 7. What are the trade-offs?
- **AOP Self-Invocation Pitfall:** If method `A()` calls `@Transactional` method `B()` within the same class, the transaction proxy is **bypassed**, and no transaction is started!
- **Mitigation:** Always invoke transactional methods across service bean boundaries, or inject the self-proxy if internal calls are required.

#### 8. What questions could an interviewer ask about it?
> *"What happens if a `@Transactional` method calls another method within the same class? How does Spring AOP handle it?"*  
> **Strong Answer:** "Because Spring uses proxy-based AOP, transactional behavior is intercepted only when calls originate from outside the bean through the proxy. When method A calls method B within the same class via `this.methodB()`, it bypasses the Spring proxy, meaning method B will NOT run in a new transaction even if annotated with `@Transactional(propagation = Propagation.REQUIRES_NEW)`. To fix this, you must either move method B to a separate service bean or use programmatic transactions with `TransactionTemplate`."

---

## 2. Interview Preparation & Layered Architecture Flashcards

### Question 1: "What is the difference between `@Transactional(readOnly = true)` and `@Transactional`?"
**Answer:**  
When `readOnly = true` is set:
1. Hibernate sets the FlushMode to `MANUAL`, disabling dirty checking at session flush time, which saves significant CPU and memory when querying thousands of entities.
2. The underlying JDBC connection can set the connection to read-only (`connection.setReadOnly(true)`), allowing PostgreSQL to route read queries to read-replicas in clustered environments.

### Question 2: "Which exceptions trigger a rollback by default in Spring `@Transactional`?"
**Answer:**  
By default, Spring rolls back transactions only on unchecked exceptions (`RuntimeException` and `Error`). Checked exceptions (extending `Exception`) do NOT trigger a rollback unless explicitly configured with `@Transactional(rollbackFor = Exception.class)`. In ZenHire, we explicitly declare `rollbackFor = Exception.class` on all write transactions.
