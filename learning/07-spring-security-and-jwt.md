# SDE-1 Engineering Masterclass — 07: Spring Security 6 & JWT Architecture

> **Focus:** Spring Security 6 Filter Chain, Stateless JWT Mechanics, RBAC Enforcement, Method Security  
> **Target Audience:** SDE-1 Backend / Full-Stack Engineers  
> **Project Context:** ZenHire Enterprise Recruitment Platform

---

## 1. Architectural Concept Deep-Dives (The 8 Mandatory Questions)

### Concept 7.1: Spring Security 6 Filter Chain & `SecurityContextHolder`

#### 1. What is it?
The Spring Security Filter Chain is a sequential series of servlet filters that intercept every incoming HTTP request before it reaches Spring MVC controllers. It performs authentication, authorization checks, CSRF validation, and sets the authenticated identity in `SecurityContextHolder`.

#### 2. Why are we using it in ZenHire?
In ZenHire, we need to authenticate users statelessly via JWT tokens, establish their roles (`ROLE_CANDIDATE`, `ROLE_RECRUITER`), and prevent unauthorized access to sensitive endpoints (e.g., candidate dossier inspection, interview scheduling).

#### 3. How does it work internally?
```
Incoming HTTP Request
       ↓
DelegatingFilterProxy (Servlet container level)
       ↓
FilterChainProxy (Spring Security level)
       ↓
1. CorsFilter
2. SecurityContextHolderFilter
3. JwtAuthenticationFilter (Custom filter: extracts & validates Bearer token)
4. AnonymousAuthenticationFilter
5. AuthorizationFilter (Enforces URL path permissions)
       ↓
DispatcherServlet -> Controller Method
```
When `JwtAuthenticationFilter` validates a token:
```java
UsernamePasswordAuthenticationToken authentication = 
    new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
SecurityContextHolder.getContext().setAuthentication(authentication);
```
`SecurityContextHolder` stores this identity in a `ThreadLocal` variable, making it accessible throughout the request lifecycle.

#### 4. Where is it implemented in ZenHire?
In `com.zenhire.config.SecurityConfig` and `com.zenhire.security.JwtAuthenticationFilter`.

#### 5. What problem does it solve?
Centralizes edge security logic. Individual controllers never need to write manual token extraction or authentication verification code; they simply receive an authenticated `@AuthenticationPrincipal UserPrincipal principal`.

#### 6. What are the alternatives?
- Writing custom interceptors (`HandlerInterceptor`). Flawed because interceptors execute after servlet dispatch and cannot easily protect static resources or integrate with standard security annotations.

#### 7. What are the trade-offs?
- Spring Security 6 deprecated `WebSecurityConfigurerAdapter` and relies entirely on component-based `@Bean SecurityFilterChain`. Understanding filter order (`addFilterBefore`) is essential.

#### 8. What questions could an interviewer ask about it?
> *"How does `SecurityContextHolder` store authentication information across a request, and what happens in asynchronous or multi-threaded scenarios?"*  
> **Strong Answer:** "By default, `SecurityContextHolder` uses a `ThreadLocal` strategy (`MODE_THREADLOCAL`), meaning the authenticated user context is bound to the specific thread processing the incoming HTTP request. In asynchronous executions (e.g., `@Async` or parallel worker threads), the child thread does not inherit the parent thread's `ThreadLocal` context unless explicitly configured with `MODE_INHERITABLETHREADLOCAL` or using a `DelegatingSecurityContextAsyncTaskExecutor`."

---

### Concept 7.2: Stateless JWT Mechanics (HMAC-SHA256)

#### 1. What is it?
JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact, self-contained way for securely transmitting information between parties as a JSON object. A JWT consists of three base64url-encoded parts separated by dots: `Header.Payload.Signature`.

#### 2. Why are we using it in ZenHire?
In a multi-container deployment, stateless JWTs eliminate the need for distributed server-side session stores (like Redis). The backend can verify authenticity entirely in-memory using cryptographic signature math.

#### 3. How does it work internally?
1. **Signing Phase (Login):**
   - Header: `{"alg": "HS256", "typ": "JWT"}`
   - Payload: `{"sub": "user-uuid", "role": "ROLE_CANDIDATE", "exp": 1790000000}`
   - Signature:  
     $$\text{Signature} = \text{HMAC-SHA256}(\text{Base64Url}(\text{Header}) + "." + \text{Base64Url}(\text{Payload}), \text{secretKey})$$
2. **Verification Phase (API Request):**
   - Server receives token from `Authorization: Bearer <token>`.
   - Server takes Header and Payload from the incoming token and recalculates the signature using its private `JWT_SECRET`.
   - If computed signature matches the token's signature, and `exp > currentTime`, the token is verified.
   - If an attacker tampers with the payload (e.g., changing `ROLE_CANDIDATE` to `ROLE_RECRUITER`), the signature check fails immediately!

#### 4. Where is it implemented in ZenHire?
In `com.zenhire.security.JwtTokenProvider`:
```java
@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
            .subject(principal.getId().toString())
            .claim("role", principal.getRole().name())
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey(), Jwts.SIG.HS256)
            .compact();
    }
}
```

#### 5. What problem does it solve?
Enables zero-lookup stateless authentication across horizontally scaled application instances.

#### 6. What are the alternatives?
- **Opaque Reference Tokens:** Random UUID stored in Redis/DB with associated user session. Revocation is instant, but requires a database lookup on every request.

#### 7. What are the trade-offs?
- JWTs cannot be revoked immediately before their expiration time without maintaining a token revocation blacklist.
- **Mitigation:** We set access token expiration to 24 hours.

#### 8. What questions could an interviewer ask about it?
> *"Can an attacker read the data inside a JWT payload? Is JWT encrypted?"*  
> **Strong Answer:** "No, a standard JWT is signed, NOT encrypted. The payload is simply base64url-encoded JSON, meaning anyone who intercepts the token can decode and read the claims (`sub`, `role`, `exp`). The signature only guarantees integrity (that the payload was not modified in transit). Therefore, you must NEVER store sensitive data like passwords or credit cards in a JWT payload."

---

## 2. Interview Preparation & Security Flashcards

### Question 1: "How do you secure methods using Spring Security `@PreAuthorize`?"
**Answer:**  
We annotate our configuration class with `@EnableMethodSecurity`. Then, on service or controller methods, we use Spring Expression Language (SpEL):
- `@PreAuthorize("hasRole('RECRUITER')")`: Restricts access to recruiters.
- `@PreAuthorize("hasAnyRole('CANDIDATE', 'RECRUITER')")`: Allows both roles.
- `@PreAuthorize("#candidateId == authentication.principal.candidateId")`: Restricts access so candidates can only inspect their own records.

### Question 2: "What is the difference between BCrypt and MD5/SHA-256 for password hashing?"
**Answer:**  
MD5 and standard SHA-256 are fast general-purpose cryptographic hash functions designed for speed. Because they are fast, attackers can use modern GPUs to compute billions of guesses per second, rendering them vulnerable to brute-force and rainbow table attacks.  
BCrypt is an intentionally slow, adaptive key derivation function based on the Blowfish cipher. It incorporates a salt automatically to defeat rainbow tables and features a configurable work factor (cost) that can be increased over time as computing hardware becomes faster.
