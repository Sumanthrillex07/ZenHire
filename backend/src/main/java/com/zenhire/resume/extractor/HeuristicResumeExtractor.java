package com.zenhire.resume.extractor;

import com.zenhire.resume.dto.ParsedResumeData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic fallback extractor using keyword dictionary mapping and section boundary regex.
 */
@Slf4j
@Component
public class HeuristicResumeExtractor implements ResumeExtractionStrategy {

    private static final List<String> TECH_DICTIONARY = List.of(
            // Languages
            "Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Go", "Golang", "Rust", "Kotlin", "Swift", "PHP", "Ruby", "SQL",
            // Backend Frameworks & Libraries
            "Spring Boot", "Spring Data", "Spring Security", "Hibernate", "JPA", "Node.js", "Express", "Django", "FastAPI", "Flask", ".NET",
            // Frontend
            "React", "Redux", "Next.js", "Angular", "Vue", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap",
            // Databases & Caching
            "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra", "Oracle", "DynamoDB",
            // DevOps & Cloud
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "GitHub Actions", "Jenkins", "Terraform", "Linux",
            // Architecture & Protocols
            "REST", "GraphQL", "gRPC", "Microservices", "Kafka", "RabbitMQ", "OAuth2", "JWT",
            // Testing & Tools
            "JUnit", "Mockito", "Testcontainers", "Git", "Maven", "Gradle", "Vite"
    );

    @Override
    public ParsedResumeData extract(String rawText) {
        log.info("Executing heuristic resume extraction on {} characters of text", rawText.length());

        List<String> detectedSkills = extractSkills(rawText);
        String experience = extractSection(rawText, "(?i)(?:experience|work history|employment|professional background)", "(?i)(?:education|skills|projects|certifications|$)");
        String education = extractSection(rawText, "(?i)(?:education|academic background|qualifications)", "(?i)(?:skills|projects|experience|certifications|$)");

        if (experience.isBlank()) {
            experience = "Professional experience parsed from resume text.";
        }
        if (education.isBlank()) {
            education = "Educational background parsed from resume text.";
        }

        return new ParsedResumeData(detectedSkills, experience, education);
    }

    private List<String> extractSkills(String rawText) {
        Set<String> matchedSkills = new LinkedHashSet<>();

        for (String skill : TECH_DICTIONARY) {
            String patternString = "\\b" + Pattern.quote(skill) + "\\b";
            Pattern pattern = Pattern.compile(patternString, Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(rawText);
            if (matcher.find()) {
                matchedSkills.add(skill);
            }
        }

        return new ArrayList<>(matchedSkills);
    }

    private String extractSection(String text, String startHeaderPattern, String endHeaderPattern) {
        Pattern pattern = Pattern.compile(startHeaderPattern + "[:\\s]*([\\s\\S]*?)(?=" + endHeaderPattern + ")", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            String matched = matcher.group(1).trim();
            // Truncate to reasonable summary size (max 500 chars)
            if (matched.length() > 500) {
                return matched.substring(0, 500) + "...";
            }
            return matched;
        }

        return "";
    }
}
