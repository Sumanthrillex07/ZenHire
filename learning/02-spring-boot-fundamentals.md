# SDE-1 Engineering Masterclass — 02: Spring Boot Fundamentals

> **Focus:** Spring Boot 3 Internals, Auto-Configuration, Bean Lifecycle, Dependency Injection Best Practices  
> **Target Audience:** SDE-1 Backend / Full-Stack Engineers  
> **Project Context:** ZenHire Enterprise Recruitment Platform

---

## 1. Architectural Concept Deep-Dives (The 8 Mandatory Questions)

### Concept 2.1: Spring Boot Auto-Configuration Internals

#### 1. What is it?
Spring Boot Auto-Configuration is a convention-over-configuration mechanism that automatically registers and configures Spring Beans in the ApplicationContext based on the JAR libraries present on the runtime classpath, existing user-defined beans, and configuration properties.

#### 2. Why are we using it in ZenHire?
Instead of writing thousands of lines of boilerplate XML or Java configuration to instantiate `DataSource`, `EntityManagerFactory`, `HikariPool`, `SecurityFilterChain`, and `Jackson ObjectMapper`, Spring Boot auto-configures production-ready defaults while allowing us to override specific properties in `application.yml`.

#### 3. How does it work internally?
1. The `@SpringBootApplication` annotation contains `@EnableAutoConfiguration`.
2. On startup, Spring Boot reads the `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` file inside dependencies like `spring-boot-autoconfigure.jar`.
3. Auto-configuration classes evaluate conditional annotations:
   - `@ConditionalOnClass(DataSource.class)`: Only runs if PostgreSQL JDBC driver is on the classpath.
   - `@ConditionalOnMissingBean(ObjectMapper.class)`: Only creates a default ObjectMapper if the developer hasn't defined their own `@Bean`.
   - `@ConditionalOnProperty(prefix = "spring.flyway", name = "enabled", matchIfMissing = true)`: Enables Flyway if property is true.
4. If conditions pass, the configuration class registers the corresponding beans into the `BeanFactory`.

#### 4. Where is it implemented in ZenHire?
In `ZenHireApplication.java`:
```java
@SpringBootApplication
public class ZenHireApplication {
    public static void main(String[] args) {
        SpringApplication.run(ZenHireApplication.class, args);
    }
}
```
When ZenHire boots, Spring Boot auto-detects `postgresql.jar` and `HikariCP`, instantiating the connection pool using database credentials supplied in `application.yml`.

#### 5. What problem does it solve?
Eliminates tedious, error-prone manual configuration of standard web, persistence, and security infrastructure, cutting project setup from days to minutes.

#### 6. What are the alternatives?
- **Vanilla Spring Framework:** Manually writing `@Configuration` classes and `@Bean` definitions for every single infrastructure component.
- **Micronaut / Quarkus:** Ahead-of-time (AOT) compile-time dependency injection frameworks.

#### 7. What are the trade-offs?
- **Trade-off:** "Magic" behavior. If you do not understand conditional annotations, debugging why a certain bean was or wasn't loaded can be difficult.
- **Mitigation:** Use the `--debug` flag or Spring Boot Actuator `/actuator/conditions` endpoint to inspect the auto-configuration evaluation report.

#### 8. What questions could an interviewer ask about it?
> *"How would you disable a specific auto-configuration class in Spring Boot?"*  
> **Strong Answer:** "You can exclude it either via annotation: `@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})`, or via configuration in `application.yml`: `spring.autoconfigure.exclude: org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration`."

---

### Concept 2.2: Spring Bean Lifecycle & Constructor Injection

#### 1. What is it?
A Spring Bean is an object whose instantiation, dependency resolution, initialization, and lifecycle management are controlled by the Spring Inversion of Control (IoC) container.

#### 2. Why are we using it in ZenHire?
We use Spring Beans to manage singletons of our controllers, services, repositories, and security filters, ensuring consistent state and thread-safe service execution across concurrent HTTP requests.

#### 3. How does it work internally?
The complete lifecycle of a Spring Bean follows these distinct phases:
```
1. Instantiation (Constructor call)
      ↓
2. Populate Properties (Dependency Injection)
      ↓
3. Aware Interfaces (BeanNameAware, BeanFactoryAware, ApplicationContextAware)
      ↓
4. BeanPostProcessor (Before Initialization: @PostConstruct methods)
      ↓
5. InitializingBean / Custom init-method (afterPropertiesSet)
      ↓
6. BeanPostProcessor (After Initialization: AOP Proxies created here!)
      ↓
7. Bean Ready for Use (Servicing requests)
      ↓
8. Container Shutdown (@PreDestroy / DisposableBean.destroy)
```

#### 4. Where is it implemented in ZenHire?
We strictly enforce **Constructor Injection** across all ZenHire components (never `@Autowired` on private fields):
```java
@Service
public class JobServiceImpl implements JobService {
    private final JobRepository jobRepository;
    private final RecruiterRepository recruiterRepository;

    // Explicit constructor injection (recommended by Spring team)
    public JobServiceImpl(JobRepository jobRepository, RecruiterRepository recruiterRepository) {
        this.jobRepository = jobRepository;
        this.recruiterRepository = recruiterRepository;
    }
}
```

#### 5. What problem does it solve?
Field injection (`@Autowired private JobRepository jobRepo;`) hides class dependencies, makes unit testing difficult (requires reflection or PowerMock), and allows circular dependencies. Constructor injection guarantees:
1. All mandatory dependencies are initialized at object creation time.
2. Dependencies can be declared `final`, ensuring immutability.
3. Unit tests can simply invoke `new JobServiceImpl(mockJobRepo, mockRecruiterRepo)` without Spring Test runner overhead.

#### 6. What are the alternatives?
- **Field Injection:** `@Autowired` directly on private variables (discouraged anti-pattern).
- **Setter Injection:** Good for optional dependencies, but risky for mandatory ones.

#### 7. What are the trade-offs?
Constructor injection can lead to long constructor parameter lists if a class has too many dependencies. This is actually an architectural benefit, as it acts as a code smell warning that a class violates the Single Responsibility Principle (SRP).

#### 8. What questions could an interviewer ask about it?
> *"Why should you avoid field injection with `@Autowired` in modern Spring Boot applications?"*  
> **Strong Answer:** "Field injection tightly couples your code to the Spring IoC container because the fields cannot be set from outside the container without reflection. It prevents making fields `final` for immutability, masks violation of the Single Responsibility Principle, and complicates unit testing because you cannot easily pass mocked dependencies into the class constructor."

---

## 2. Interview Preparation & Spring Boot Flashcards

### Question 1: "What is the difference between `@Component`, `@Service`, and `@Repository` in Spring?"
**Answer:**  
`@Component` is the generic stereotype annotation for any Spring-managed component. `@Service` and `@Repository` are specialized meta-annotations:
- `@Service` indicates that the class encapsulates business logic. Currently, it carries no additional specialized behavior over `@Component`, but serves as a clear architectural marker for tooling and AOP pointcuts.
- `@Repository` indicates a Data Access Object (DAO) and enables automatic **PersistenceExceptionTranslationPostProcessor**, which catches native vendor-specific SQL/database exceptions (e.g., Hibernate, JDBC) and translates them into Spring’s unified `DataAccessException` hierarchy.

### Question 2: "Where are AOP proxies (like `@Transactional` and `@PreAuthorize`) created during the Bean Lifecycle?"
**Answer:**  
AOP proxies are created in the **BeanPostProcessor.postProcessAfterInitialization()** phase. If a bean has methods annotated with `@Transactional` or `@PreAuthorize`, the `AnnotationAwareAspectJAutoProxyCreator` wraps the original target object inside a dynamic CGLIB or JDK dynamic proxy that intercepts method calls to handle transaction begin/commit or security authorization checks before delegating to the actual method.
