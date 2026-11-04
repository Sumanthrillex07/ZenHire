package com.zenhire.resume.extractor;

import com.zenhire.resume.dto.SkillProfileItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Skill Taxonomy, Alias Normalization, and Confidence Scoring Service.
 */
@Slf4j
@Service
public class SkillTaxonomyService {

    public record TaxonomyEntry(String canonicalName, String category, List<String> aliases) {}

    private final Map<String, TaxonomyEntry> canonicalTaxonomy = new LinkedHashMap<>();
    private final Map<String, String> aliasToCanonicalMap = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);

    public SkillTaxonomyService() {
        initTaxonomy();
    }

    private void register(String canonical, String category, String... aliases) {
        List<String> aliasList = new ArrayList<>(Arrays.asList(aliases));
        aliasList.add(canonical); // Canonical is also its own alias
        TaxonomyEntry entry = new TaxonomyEntry(canonical, category, aliasList);
        canonicalTaxonomy.put(canonical.toLowerCase(), entry);

        for (String alias : aliasList) {
            aliasToCanonicalMap.put(alias.toLowerCase(), canonical);
        }
    }

    private void initTaxonomy() {
        // --- Languages ---
        register("Java", "LANGUAGES", "java 21", "java 17", "java 11", "java 8", "core java");
        register("Python", "LANGUAGES", "python3", "py");
        register("JavaScript", "LANGUAGES", "js", "ecmascript", "es6");
        register("TypeScript", "LANGUAGES", "ts");
        register("Go", "LANGUAGES", "golang");
        register("Rust", "LANGUAGES", "rust-lang");
        register("C++", "LANGUAGES", "cpp", "cplusplus");
        register("C#", "LANGUAGES", "csharp", "dotnet c#");
        register("SQL", "LANGUAGES", "pl/sql", "t-sql", "ansi sql");
        register("Kotlin", "LANGUAGES");
        register("Swift", "LANGUAGES");
        register("PHP", "LANGUAGES");
        register("Ruby", "LANGUAGES");

        // --- Backend Frameworks & Libraries ---
        register("Spring Boot", "BACKEND", "spring-boot", "spring boot 3", "spring boot 2", "springboot");
        register("Spring Framework", "BACKEND", "spring core", "spring mvc", "spring context");
        register("Spring Data JPA", "BACKEND", "spring data", "spring jpa");
        register("Spring Security", "BACKEND", "spring-security");
        register("Hibernate", "BACKEND", "hibernate orm");
        register("JPA", "BACKEND", "java persistence api");
        register("Node.js", "BACKEND", "nodejs", "node js", "node");
        register("Express.js", "BACKEND", "express", "expressjs");
        register("FastAPI", "BACKEND", "fast-api");
        register("Django", "BACKEND", "django rest framework", "drf");
        register("Flask", "BACKEND");
        register(".NET", "BACKEND", ".net core", "asp.net", "dotnet");

        // --- Frontend ---
        register("React", "FRONTEND", "reactjs", "react.js", "react 18");
        register("Redux", "FRONTEND", "redux toolkit", "rtk");
        register("Next.js", "FRONTEND", "nextjs", "next.js");
        register("Tailwind CSS", "FRONTEND", "tailwindcss", "tailwind");
        register("Vue.js", "FRONTEND", "vue", "vuejs");
        register("Angular", "FRONTEND", "angularjs", "angular 2+");
        register("HTML5", "FRONTEND", "html");
        register("CSS3", "FRONTEND", "css", "sass", "scss");

        // --- Databases & Caching ---
        register("PostgreSQL", "DATABASES", "postgres", "psql", "pg");
        register("MySQL", "DATABASES", "my-sql");
        register("MongoDB", "DATABASES", "mongo");
        register("Redis", "DATABASES", "redis cache");
        register("Elasticsearch", "DATABASES", "elastic search", "elk");
        register("Cassandra", "DATABASES", "apache cassandra");
        register("DynamoDB", "DATABASES", "aws dynamodb");

        // --- Cloud & DevOps ---
        register("Docker", "CLOUD_DEVOPS", "docker-compose", "containerization");
        register("Kubernetes", "CLOUD_DEVOPS", "k8s");
        register("AWS", "CLOUD_DEVOPS", "amazon web services", "aws ec2", "aws s3", "aws lambda");
        register("Google Cloud Platform", "CLOUD_DEVOPS", "gcp", "google cloud");
        register("Azure", "CLOUD_DEVOPS", "microsoft azure");
        register("CI/CD", "CLOUD_DEVOPS", "ci-cd", "continuous integration", "continuous deployment");
        register("GitHub Actions", "CLOUD_DEVOPS", "gh actions", "github action workflows");
        register("Terraform", "CLOUD_DEVOPS", "tf", "infrastructure as code", "iac");
        register("Linux", "CLOUD_DEVOPS", "unix", "ubuntu", "bash", "shell scripting");

        // --- Architecture & Messaging ---
        register("Microservices", "ARCHITECTURE", "microservice architecture", "distributed systems");
        register("REST APIs", "ARCHITECTURE", "rest api", "restful", "restful apis", "rest endpoints");
        register("GraphQL", "ARCHITECTURE");
        register("Kafka", "ARCHITECTURE", "apache kafka", "kafka streams");
        register("RabbitMQ", "ARCHITECTURE", "message queues");
        register("gRPC", "ARCHITECTURE");
        register("JWT", "ARCHITECTURE", "json web token", "jwt tokens");
        register("WebSockets", "ARCHITECTURE", "websocket", "ws");
        register("WebRTC", "ARCHITECTURE");
        register("Temporal", "ARCHITECTURE", "temporal.io");
        register("OpenTelemetry", "ARCHITECTURE", "otel");
        register("Prometheus", "ARCHITECTURE");
        register("Grafana", "ARCHITECTURE");
        register("Apache Spark", "ARCHITECTURE", "spark", "pyspark");
        register("Apache Flink", "ARCHITECTURE", "flink");
        register("Apache Airflow", "ARCHITECTURE", "airflow");

        // --- Testing & Tools ---
        register("JUnit", "TESTING_TOOLS", "junit 5", "junit4");
        register("Mockito", "TESTING_TOOLS", "mocking");
        register("Testcontainers", "TESTING_TOOLS");
        register("Git", "TESTING_TOOLS", "git version control", "github", "gitlab");
        register("Maven", "TESTING_TOOLS", "apache maven");
        register("Gradle", "TESTING_TOOLS");
        register("Vite", "TESTING_TOOLS");

        // --- AI & Machine Learning & Agentic Frameworks ---
        register("Machine Learning", "AI_ML", "ml", "statistical learning");
        register("Deep Learning", "AI_ML", "dl", "neural networks");
        register("PyTorch", "AI_ML", "torch");
        register("TensorFlow", "AI_ML", "tf-keras", "keras");
        register("LLMs", "AI_ML", "large language models", "generative ai", "genai");
        register("LangChain", "AI_ML", "langchain", "lang-chain", "lang chain");
        register("LangGraph", "AI_ML", "langgraph", "lang-graph");
        register("LlamaIndex", "AI_ML", "llamaindex", "llama-index", "gpt-index");
        register("CrewAI", "AI_ML", "crewai", "crew-ai");
        register("AutoGen", "AI_ML", "autogen", "microsoft autogen");
        register("Hugging Face", "AI_ML", "huggingface", "hf", "transformers", "diffusers");
        register("RAG", "AI_ML", "retrieval augmented generation", "rag pipeline", "rag architectures", "rag systems");
        register("AI Agents", "AI_ML", "agentic ai", "autonomous agents", "ai agent", "multi-agent systems");
        register("Ollama", "AI_ML");
        register("vLLM", "AI_ML");
        register("Vector Databases", "AI_ML", "vector db", "vector database", "vector search");
        register("Pinecone", "AI_ML");
        register("ChromaDB", "AI_ML", "chroma", "chromadb");
        register("Milvus", "AI_ML");
        register("Weaviate", "AI_ML");
        register("Qdrant", "AI_ML");
        register("OpenAI API", "AI_ML", "openai", "chatgpt api", "gpt-4", "gpt-4o");
        register("Anthropic Claude", "AI_ML", "claude", "claude api", "anthropic");
        register("Gemini API", "AI_ML", "google gemini", "gemini api", "gemini flash", "gemini pro");
        register("Prompt Engineering", "AI_ML", "prompt-engineering");
    }

    /**
     * Normalizes an arbitrary skill name to its canonical taxonomy name.
     */
    public String normalize(String input) {
        if (input == null || input.isBlank()) return "";
        String trimmed = input.trim();
        String lookup = trimmed.toLowerCase();
        return aliasToCanonicalMap.getOrDefault(lookup, trimmed);
    }

    /**
     * Resolves category for a canonical skill.
     */
    public String getCategory(String canonicalSkill) {
        TaxonomyEntry entry = canonicalTaxonomy.get(canonicalSkill.toLowerCase());
        return entry != null ? entry.category() : "OTHER";
    }

    public Collection<TaxonomyEntry> getAllTaxonomyEntries() {
        return canonicalTaxonomy.values();
    }

    /**
     * Finds evidence snippet for a skill within a text block using regex.
     */
    public Optional<String> findEvidenceSnippet(String text, String canonicalSkill) {
        if (text == null || text.isBlank()) return Optional.empty();

        TaxonomyEntry entry = canonicalTaxonomy.get(canonicalSkill.toLowerCase());
        List<String> variants = entry != null ? entry.aliases() : List.of(canonicalSkill);

        for (String variant : variants) {
            String regex = "(?i)(?:^|[^a-zA-Z0-9_#+])(" + Pattern.quote(variant) + ")(?:$|[^a-zA-Z0-9_#+])";
            Pattern pattern = Pattern.compile(regex);
            Matcher matcher = pattern.matcher(text);

            if (matcher.find()) {
                int matchStart = matcher.start(1);
                // Extract sentence or 120-character snippet around match
                int snippetStart = Math.max(0, matchStart - 50);
                int snippetEnd = Math.min(text.length(), matchStart + variant.length() + 70);

                String snippet = text.substring(snippetStart, snippetEnd).replaceAll("\\s+", " ").trim();
                return Optional.of("..." + snippet + "...");
            }
        }
        return Optional.empty();
    }

    /**
     * Evaluates recency from text context (2024-2026/Present -> CURRENT, 2022-2023 -> RECENT, else HISTORICAL).
     */
    public String evaluateRecency(String evidenceOrSectionText) {
        if (evidenceOrSectionText == null || evidenceOrSectionText.isBlank()) {
            return "RECENT";
        }
        String lower = evidenceOrSectionText.toLowerCase();
        if (lower.contains("present") || lower.contains("current") || lower.contains("2026") || lower.contains("2025") || lower.contains("2024")) {
            return "CURRENT";
        }
        if (lower.contains("2023") || lower.contains("2022")) {
            return "RECENT";
        }
        return "HISTORICAL";
    }

    /**
     * Calculates confidence score based on multi-section presence and evidence depth.
     */
    public double calculateConfidence(List<String> sourceSections, boolean hasEvidenceSnippet, String recency) {
        double score = 0.50;

        if (sourceSections.contains("SKILLS")) {
            score += 0.20;
        }
        if (sourceSections.contains("EXPERIENCE")) {
            score += 0.20;
        }
        if (sourceSections.contains("PROJECTS")) {
            score += 0.15;
        }
        if (sourceSections.contains("CERTIFICATIONS")) {
            score += 0.10;
        }
        if (hasEvidenceSnippet) {
            score += 0.05;
        }
        if ("CURRENT".equals(recency)) {
            score += 0.05;
        }

        return Math.min(1.0, Math.round(score * 100.0) / 100.0);
    }
}

