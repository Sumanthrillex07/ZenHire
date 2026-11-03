# SDE-1 Engineering Masterclass — 12: Testing, Mocking & Debugging

> **Focus:** JUnit 5, Mockito Architecture, Spring Boot `@WebMvcTest` Slice Testing, Testcontainers PostgreSQL  
> **Target Audience:** SDE-1 Backend / Full-Stack Engineers  
> **Project Context:** ZenHire Enterprise Recruitment Platform

---

## 1. Architectural Concept Deep-Dives (The 8 Mandatory Questions)

### Concept 12.1: Mockito Architecture & Mock Injection

#### 1. What is it?
Mockito is the industry-standard Java mocking library used in unit testing to simulate the behavior of complex external collaborators (such as repositories, HTTP clients, or file extractors) in complete isolation from the Spring framework.

#### 2. Why are we using it in ZenHire?
When testing our business logic in `ApplicationWorkflowServiceImpl` or `HybridMatchingEngineImpl`, we want our unit tests to execute in under 10 milliseconds without starting a real PostgreSQL database, launching a web server, or calling Google's Gemini API over the internet.

#### 3. How does it work internally?
1. Mockito uses Byte Buddy to generate a dynamic subclass (proxy) of the mocked class or interface at runtime.
2. In this proxy, method calls are intercepted:
   - When you write `when(jobRepository.findById(jobId)).thenReturn(Optional.of(mockJob))`, Mockito registers an expectation in its internal invocation handler.
   - When the service under test executes `jobRepository.findById(jobId)`, the proxy intercepts the call and returns `Optional.of(mockJob)` without executing any real database code.
3. `verify(jobRepository, times(1)).save(any(Job.class))` inspects the proxy's recorded invocation list to assert that the method was called with the expected arguments.

#### 4. Where is it implemented in ZenHire?
In `backend/src/test/java/com/zenhire/`:
```java
@ExtendWith(MockitoExtension.class)
class ApplicationWorkflowServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private TestAttemptRepository testAttemptRepository;

    @Mock
    private HybridMatchingEngine matchingEngine;

    @InjectMocks
    private ApplicationWorkflowServiceImpl applicationWorkflowService;

    @Test
    void applyToJob_ShouldThrowGatingException_WhenCandidateHasNotPassedAssessment() {
        UUID candidateId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();
        Job job = Job.builder().id(jobId).roleCategory(RoleCategory.BACKEND).build();

        when(testAttemptRepository.findFirstByCandidateIdAndTestRoleCategoryAndPassedTrue(candidateId, RoleCategory.BACKEND))
            .thenReturn(Optional.empty()); // Simulate candidate hasn't passed!

        assertThrows(AssessmentGatingException.class, () -> 
            applicationWorkflowService.applyToJob(candidateId, jobId));

        verify(applicationRepository, never()).save(any());
    }
}
```

#### 5. What problem does it solve?
Enables lightning-fast unit tests, isolates bugs to the exact class under test, and allows testing complex failure scenarios (e.g., simulating database network timeouts or external API rate limits).

#### 6. What are the alternatives?
- **In-Memory Fakes:** Writing manual in-memory stub implementations of repositories. High maintenance cost.
- **Integration Tests Only:** Running all tests against a real database. Slow and fragile.

#### 7. What are the trade-offs?
- If mocks are configured unrealistically (e.g., mocking a repository to return data that violates database foreign key constraints), unit tests can pass while production code fails.
- **Mitigation:** We complement unit tests with `@DataJpaTest` and Testcontainers integration tests.

#### 8. What questions could an interviewer ask about it?
> *"What is the difference between `@Mock` and `@Spy` in Mockito?"*  
> **Strong Answer:** "`@Mock` creates a completely dummy object where all methods return default values (null, 0, false, empty collection) unless explicitly stubbed with `when().thenReturn()`. A `@Spy` creates a partial mock around a real instance of an object; calling methods on a spy executes the actual real code unless that specific method has been stubbed."

---

### Concept 12.2: Spring Boot Slice Testing (`@WebMvcTest` & MockMvc)

#### 1. What is it?
Slice Testing is a Spring Boot testing strategy where only the beans relevant to a specific architectural layer are loaded into the ApplicationContext, rather than booting the entire application. `@WebMvcTest` loads only the web layer (Controllers, Exception Handlers, JSON Converters, Security Filters) and automatically mocks the service layer.

#### 2. Why are we using it in ZenHire?
We need to verify that our REST API endpoints:
- Properly validate incoming JSON payloads (`@Valid`) and return HTTP 400.
- Correctly enforce Spring Security permissions (returning 401 for missing tokens and 403 for role violations).
- Serialize JSON responses into the expected `ApiResponse<T>` envelope.
Running `@SpringBootTest` for every single controller endpoint is slow; `@WebMvcTest` executes in a fraction of a second.

#### 3. How does it work internally?
`MockMvc` simulates HTTP requests and responses directly against the Spring `DispatcherServlet` in memory without opening a real TCP network socket or booting an embedded Tomcat server.

#### 4. Where is it implemented in ZenHire?
In `backend/src/test/java/com/zenhire/job/controller/JobControllerTest.java`:
```java
@WebMvcTest(JobController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters to isolate validation logic
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobService jobService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createJob_ShouldReturn400_WhenTitleIsTooShort() throws Exception {
        CreateJobRequestDto invalidRequest = new CreateJobRequestDto(
            "AB", // Less than 3 chars!
            "Valid description over 10 chars",
            List.of("Java"),
            RoleCategory.BACKEND
        );

        mockMvc.perform(post("/api/v1/jobs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.errorCode").value("VALIDATION_FAILED"))
            .andExpect(jsonPath("$.error.validationErrors[0].field").value("title"));
    }
}
```

#### 5. What problem does it solve?
Provides fast, comprehensive verification of HTTP serialization, routing, header parsing, validation, and error translation without database or external service dependencies.

#### 6. What are the alternatives?
- `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)` with `TestRestTemplate`: Boots the entire application and starts an embedded web server. Slower, but tests the full network stack.

#### 7. What are the trade-offs?
- Because only the web slice is loaded, all service dependencies must be explicitly mocked using `@MockBean`.

#### 8. What questions could an interviewer ask about it?
> *"What is the difference between `@SpringBootTest` and `@WebMvcTest`?"*  
> **Strong Answer:** "`@SpringBootTest` loads the entire Spring `ApplicationContext`, including all `@Service`, `@Repository`, database configurations, and background jobs. It is used for comprehensive end-to-end integration tests. `@WebMvcTest` is a slice test that boots only the Spring MVC infrastructure (controllers, filters, converters, `@ControllerAdvice`), disabling full component scanning. It is used to test HTTP routing, validation, and serialization in rapid isolation."

---

## 2. Interview Preparation & Testing Flashcards

### Question 1: "What are Testcontainers and why are they superior to H2 in-memory databases for JPA testing?"
**Answer:**  
Historically, developers used in-memory H2 databases for testing to avoid running local database servers. However, H2 has different SQL dialects, lacks native PostgreSQL functions (e.g., `gen_random_uuid()`, `JSONB` operators, specific constraint behaviors), and frequently masks syntax errors that fail when deployed to production PostgreSQL.  
**Testcontainers** uses Docker to spin up a real, lightweight, disposable PostgreSQL container during test execution. This guarantees 100% dialect and constraint fidelity: if a query or constraint passes in the test, it is guaranteed to work in production.

### Question 2: "What is Mutation Testing in software quality assurance?"
**Answer:**  
Standard code coverage only measures which lines of code were executed during a test run; it does not measure whether the assertions were effective.  
**Mutation Testing** (e.g., using PIT / PITest in Java) introduces deliberate small bugs (mutations) into your compiled bytecode—such as inverting conditional checks (`>` to `<=`), changing boundary numbers, or removing method calls. It then runs your test suite: if your tests fail (kill the mutant), the test suite is strong. If your tests still pass despite the mutant, your tests lack sufficient assertions.
