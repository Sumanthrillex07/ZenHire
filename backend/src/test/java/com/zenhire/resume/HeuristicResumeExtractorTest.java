package com.zenhire.resume;

import com.zenhire.resume.dto.ParsedResumeData;
import com.zenhire.resume.extractor.HeuristicResumeExtractor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HeuristicResumeExtractorTest {

    private final HeuristicResumeExtractor extractor = new HeuristicResumeExtractor();

    @Test
    @DisplayName("Should extract technical skills matching dictionary")
    void shouldExtractTechnicalSkills() {
        String resumeText = """
                Jane Doe - Software Engineer
                Email: jane@example.com
                
                TECHNICAL SKILLS:
                Languages: Java, Python, TypeScript, SQL
                Frameworks: Spring Boot, Spring Security, React, Next.js
                Databases: PostgreSQL, Redis, MongoDB
                Infrastructure: Docker, Kubernetes, AWS, Git
                
                EXPERIENCE:
                Senior Backend Engineer at TechCorp (2021 - Present)
                Developed high-scale REST APIs using Spring Boot and PostgreSQL.
                
                EDUCATION:
                B.S. in Computer Science - State University, 2021
                """;

        ParsedResumeData data = extractor.extract(resumeText);

        assertThat(data.skills()).contains("Java", "Spring Boot", "React", "PostgreSQL", "Docker", "AWS");
        assertThat(data.experience()).contains("TechCorp");
        assertThat(data.education()).contains("State University");
    }

    @Test
    @DisplayName("Should handle missing sections gracefully")
    void shouldHandleMissingSections() {
        String textWithoutSections = "Just some casual text without headers but mentions Java and React.";

        ParsedResumeData data = extractor.extract(textWithoutSections);

        assertThat(data.skills()).contains("Java", "React");
        assertThat(data.experience()).isNotBlank();
        assertThat(data.education()).isNotBlank();
    }
}

