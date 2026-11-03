# SDE-1 Engineering Masterclass — 09: Docker & Container Orchestration

> **Focus:** Container Virtualization, Multi-Stage Dockerfile Optimization, Internal Bridge Networking, Volume Persistence  
> **Target Audience:** SDE-1 Backend / Full-Stack Engineers  
> **Project Context:** ZenHire Enterprise Recruitment Platform

---

## 1. Architectural Concept Deep-Dives (The 8 Mandatory Questions)

### Concept 9.1: Multi-Stage Dockerfile Optimization & Security

#### 1. What is it?
A multi-stage Docker build is a Dockerfile pattern where multiple `FROM` instructions are used to create distinct stages. Artifacts compiled in earlier heavy build stages (like Maven or Node compilers) are copied into a final, minimal runtime base image, completely discarding development tools, compilers, and source files.

#### 2. Why are we using it in ZenHire?
- A standard Maven + Java 21 build image is over 800 MB and includes full compilers, build tools, and local source repositories.
- If deployed directly to production, the container is bloated, slow to download, and contains unnecessary build tools that increase the security attack surface.
- In ZenHire, our multi-stage build produces a final runtime container of **under 200 MB** containing only the Eclipse Temurin 21 JRE, our executable JAR, and a non-root user.

#### 3. How does it work internally?
```dockerfile
# Stage 1: Build & Compile
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimalist Lightweight Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Create non-root user
RUN addgroup -S zenhire && adduser -S zenhire -G zenhire
USER zenhire
# Copy ONLY the compiled jar from Stage 1
COPY --from=builder /build/target/*.jar /app/zenhire-backend.jar
ENTRYPOINT ["java", "-jar", "/app/zenhire-backend.jar"]
```

#### 4. Where is it implemented in ZenHire?
In `backend/Dockerfile` and `frontend/Dockerfile` (where Node 20 compiles React, and Nginx Alpine serves the compiled static files).

#### 5. What problem does it solve?
Drastically reduces image size, accelerates container deployment times, and enhances security by running with non-root user privileges without build tools installed.

#### 6. What are the alternatives?
- **Single-Stage Dockerfile:** Compiling code on the host machine and copying `target/*.jar` into the image. Flawed because build environments diverge across developer laptops ("works on my machine, fails in CI").

#### 7. What are the trade-offs?
- Initial build takes slightly longer because dependencies are downloaded inside the builder stage.
- **Mitigation:** Copying `pom.xml` and running `mvn dependency:go-offline` before copying `src/` leverages Docker layer caching so subsequent builds take seconds.

#### 8. What questions could an interviewer ask about it?
> *"Why should you run Docker containers as a non-root user?"*  
> **Strong Answer:** "By default, processes inside a Docker container execute as root (UID 0). Because containers share the host Linux kernel, if an attacker exploits a container breakout vulnerability (such as a remote code execution in an unpatched runtime or file parsing library), they would gain root privileges on the host operating system. Creating a dedicated non-root user (`zenhire`) with minimal file permissions confines the blast radius to the container sandbox."

---

### Concept 9.2: Docker Networking & Inter-Container Communication

#### 1. What is it?
Docker Compose creates an isolated virtual bridge network (`zenhire-network`). Containers attached to this network can communicate with one another using their service names as DNS hostnames.

#### 2. Why are we using it in ZenHire?
We need the React frontend container, the Spring Boot backend container, and the PostgreSQL database container to communicate seamlessly without hardcoding dynamic host IP addresses.

#### 3. How does it work internally?
1. Docker Compose provisions an internal software bridge network (`zenhire-network`) and activates an embedded DNS server at `127.0.0.11`.
2. When the Spring Boot application connects to `jdbc:postgresql://postgres:5432/zenhire_db`:
   - The JVM queries Docker's embedded DNS server for hostname `postgres`.
   - Docker DNS resolves `postgres` to the internal container IP (e.g., `172.28.0.2`).
   - The JDBC connection is established securely inside the internal bridge network.
3. The database port does NOT need to be exposed to the public internet for the backend to connect to it.

#### 4. Where is it implemented in ZenHire?
In `docker-compose.yml`:
- `backend` connects to `postgres:5432`.
- `frontend` Nginx proxies `/api` requests to `http://backend:8080`.

#### 5. What problem does it solve?
Eliminates brittle IP configuration, enables container portability across local and cloud environments, and provides network-level security by keeping databases private inside the virtual network.

#### 6. What are the alternatives?
- **Host Networking (`network_mode: host`):** Containers share the host's network namespace directly. Bypasses port mapping, but removes container network isolation.

#### 7. What are the trade-offs?
- Minor virtual bridge routing latency (~microseconds), which is completely negligible for web and database workloads.

#### 8. What questions could an interviewer ask about it?
> *"In Docker Compose, what is the difference between `depends_on` and `condition: service_healthy`?"*  
> **Strong Answer:** "A standard `depends_on: [postgres]` only waits for the postgres container to start its process, NOT for the PostgreSQL database server inside it to finish booting and accept connections. This frequently causes the backend to crash with `Connection Refused`. Using `condition: service_healthy` coupled with a `healthcheck` (`pg_isready -U user -d db`) instructs Docker to wait until PostgreSQL explicitly responds that it is ready to accept queries before launching the backend container."

---

## 2. Interview Preparation & Docker Flashcards

### Question 1: "What is the difference between Docker Bind Mounts and Docker Named Volumes?"
**Answer:**  
- **Bind Mounts (`./src:/app/src`):** Directly maps a specific directory on the host filesystem into the container. Excellent for live-reload development, but tied to the host's directory structure and permissions.
- **Named Volumes (`zenhire_pg_data:/var/lib/postgresql/data`):** Managed entirely by Docker in an isolated host storage directory. Preferred for database persistence because Docker manages filesystem permissions, cross-platform compatibility, and backup lifecycle independently of host file paths.

### Question 2: "What are Linux Namespaces and cgroups in Docker container virtualization?"
**Answer:**  
Containers are NOT lightweight virtual machines; they are isolated host processes governed by two core Linux kernel primitives:
1. **Namespaces:** Provide isolation (what the process can *see*). Examples include PID (process IDs), NET (network interfaces/routing), MNT (filesystem mount points), and IPC (inter-process communication).
2. **Control Groups (cgroups):** Provide resource metering and limits (how much the process can *use*), capping CPU, memory, and disk I/O to prevent a noisy container from consuming all host resources.

