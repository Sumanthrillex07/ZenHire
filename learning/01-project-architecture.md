# SDE-1 Engineering Masterclass — 01: Project Architecture

> **Focus:** Software Architectural Styles, Modular Monoliths, Inversion of Control, Domain Boundaries  
> **Target Audience:** SDE-1 Backend / Full-Stack Engineers  
> **Project Context:** ZenHire Enterprise Recruitment Platform

---

## 1. Architectural Concept Deep-Dives (The 8 Mandatory Questions)

### Concept 1.1: The Modular Monolith Architectural Pattern

#### 1. What is it?
A Modular Monolith is a software design approach where an entire application runs as a single deployable process (a monolith), but its internal source code is strictly partitioned into high-cohesion, low-coupling domain modules. In ZenHire, modules are organized by business feature (`auth`, `candidate`, `job`, `assessment`, `application`, `matching`, `ai`) rather than purely technical layers.

#### 2. Why are we using it in ZenHire?
ZenHire requires strict ACID transactions across modules (e.g., verifying a candidate's passed test attempt before creating an application record and triggering matching evaluation). A modular monolith allows us to execute these operations within an in-memory transactional boundary with sub-millisecond execution times and zero distributed system complexity.

#### 3. How does it work internally?
In Java and Spring Boot, modularity is enforced via package visibility, Java interfaces, and dependency inversion:
```
com.zenhire.application.service.ApplicationWorkflowServiceImpl
   ├── depends on -> com.zenhire.assessment.service.AssessmentService (Interface)
   ├── depends on -> com.zenhire.matching.service.HybridMatchingEngine (Interface)
   └── depends on -> com.zenhire.application.repository.ApplicationRepository
```
Modules communicate exclusively through service interfaces and DTOs. One module never directly accesses or modifies another module's database entities or repositories.

#### 4. Where is it implemented in ZenHire?
In the root package `com.zenhire`, every feature is an isolated sub-package (`com.zenhire.candidate`, `com.zenhire.job`, `com.zenhire.assessment`, etc.). Cross-module dependencies are injected via Spring `@Autowired` constructor injection targeting public interfaces.

#### 5. What problem does it solve?
It prevents the "Big Ball of Mud" spaghetti monolith where any controller can query any repository, while avoiding the catastrophic operational and operational overhead of distributed microservices (network partitions, partial failures, distributed tracing, complex CI/CD pipelines, eventual consistency).

#### 6. What are the alternatives?
- **Microservices Architecture:** Splitting every feature into a standalone service.
- **Classic Layered Architecture (Spaghetti Monolith):** Flat packages (`controllers`, `services`, `repositories`) where all services can mutate all tables.
- **Serverless Functions (AWS Lambda):** Event-driven micro-functions.

#### 7. What are the trade-offs?
- **Trade-off:** The entire application must be deployed together as a single container image. A failure in one module (e.g., excessive CPU usage in PDF parsing) can impact other modules if memory/CPU is not bounded.
- **Mitigation:** We allocate dedicated worker thread pools for background operations and use virtual threads in Java 21 for I/O tasks.

#### 8. What questions could an interviewer ask about it?
> *"Why did you choose a modular monolith over microservices for ZenHire?"*  
> **Strong Answer:** "Microservices solve organizational scaling problems when multiple autonomous teams need to deploy independently. For ZenHire, our primary challenge was data consistency, atomic transaction boundaries between assessments and applications, and fast local development. A modular monolith gives us strict domain encapsulation and clean interfaces today, while leaving the door open to extract modules into independent services later if scale requires it."

---

### Concept 1.2: Dependency Inversion Principle (DIP) in Practice

#### 1. What is it?
The Dependency Inversion Principle is the 'D' in SOLID. It states that high-level business modules should not depend on low-level concrete implementations; both should depend on abstractions (interfaces).

#### 2. Why are we using it in ZenHire?
We use DIP to decouple business workflows (e.g., resume processing, candidate matching) from volatile external dependencies like Google Gemini LLM API, Apache PDFBox, or specific database queries.

#### 3. How does it work internally?
In Spring Boot, Spring’s Inversion of Control (IoC) container manages beans. A service declares a dependency on an interface, and Spring injects the active `@Service` or `@Component` implementation:
```java
// High-level service depends on abstraction
public interface ResumeExtractionStrategy {
    ParsedResumeDto extract(String rawText);
}

@Service
public class ResumeServiceImpl implements ResumeService {
    private final ResumeExtractionStrategy extractionStrategy;

    public ResumeServiceImpl(@Qualifier("geminiExtractionStrategy") ResumeExtractionStrategy strategy) {
        this.extractionStrategy = strategy;
    }
}
```

#### 4. Where is it implemented in ZenHire?
- `HybridMatchingEngine` (Interface) -> `HybridMatchingEngineImpl` (Implementation)
- `ResumeExtractionStrategy` (Interface) -> `GeminiResumeExtractionStrategy` and `HeuristicFallbackExtractionStrategy`
- Spring Data JPA repositories extending `JpaRepository<T, ID>`.

#### 5. What problem does it solve?
It prevents vendor lock-in and enables unit testing. If the Gemini API changes or needs to be swapped for Claude or an on-premise model, zero business logic in `ResumeServiceImpl` or `MatchingService` needs modification. In unit tests, we inject a Mockito mock of the interface without needing an internet connection.

#### 6. What are the alternatives?
Direct instantiation via `new GeminiApiClient()`. This hardcodes the dependency, making unit testing impossible and coupling business rules to third-party SDKs.

#### 7. What are the trade-offs?
Adds an extra file (the interface) for each service. For trivial CRUD operations, interfaces can feel redundant. However, for any service that interacts with external APIs or complex business logic, the testability benefits vastly outweigh the minor verbosity.

#### 8. What questions could an interviewer ask about it?
> *"What is the difference between Dependency Injection (DI) and Dependency Inversion Principle (DIP)?"*  
> **Strong Answer:** "Dependency Inversion is the architectural design principle stating that high-level modules should depend on abstractions rather than concrete classes. Dependency Injection is the specific software design pattern and mechanism (such as Spring's IoC container) used to deliver those concrete dependencies into the class at runtime."

---

## 2. Interview Preparation & Architectural Flashcards

### Question 1: "How do you enforce boundaries in a Java modular monolith to prevent developers from bypassing interfaces?"
**Answer:**  
In Java, we can enforce boundaries at three levels:
1. **Package-private visibility:** Making service implementation classes and repository interfaces package-private (no `public` modifier) so only the public service interface and DTOs can be referenced outside the package.
2. **ArchUnit automated tests:** Using the ArchUnit library in our JUnit test suite to assert that classes in `com.zenhire.candidate..` cannot access classes in `com.zenhire.recruiter..` except through sanctioned public service interfaces.
3. **Java Modules (JPMS):** Utilizing `module-info.java` to explicitly declare `exports` and `requires`.

### Question 2: "What is the difference between monolithic architecture and modular monolithic architecture?"
**Answer:**  
A traditional monolith often degrades into an unstructured "spaghetti" codebase where database entities, helper methods, and controllers leak across the entire project without clear boundaries. A modular monolith enforces bounded contexts (borrowed from Domain-Driven Design) inside a single deployable artifact, ensuring that business capabilities are strictly isolated by module boundaries.

