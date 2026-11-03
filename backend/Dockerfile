# ==============================================================================
# Stage 1: Build Application with Maven and Java 21
# ==============================================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache Maven dependencies by copying pom.xml first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and compile jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Stage 2: Minimalist Lightweight Production Runtime
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install curl for Docker health check
RUN apk add --no-cache curl

# Create non-root system user for container security
RUN addgroup -S zenhire && adduser -S zenhire -G zenhire

# Create upload directory with proper permissions
RUN mkdir -p /app/uploads && chown -R zenhire:zenhire /app

# Copy executable jar from builder stage
COPY --from=builder /build/target/*.jar /app/zenhire-backend.jar
RUN chown zenhire:zenhire /app/zenhire-backend.jar

USER zenhire

EXPOSE 8080

# Configure JVM memory limits for container environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/zenhire-backend.jar"]

