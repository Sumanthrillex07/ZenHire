package com.zenhire.resume;

import com.zenhire.resume.dto.ParsedResumeData;
import com.zenhire.resume.extractor.HeuristicResumeExtractor;
import com.zenhire.resume.extractor.ResumeSectionParser;
import com.zenhire.resume.extractor.SkillTaxonomyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HeuristicResumeExtractorTest {

    private final ResumeSectionParser sectionParser = new ResumeSectionParser();
    private final SkillTaxonomyService taxonomyService = new SkillTaxonomyService();
    private final HeuristicResumeExtractor extractor = new HeuristicResumeExtractor(sectionParser, taxonomyService);

    @Test
    @DisplayName("Should extract technical skills and build enriched skill profile matching dictionary")
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
                
                PROJECTS:
                E-Commerce Microservices
                Architected high-throughput services with Docker, Redis, and Spring Boot.
                
                EDUCATION:
                B.S. in Computer Science - State University, 2021
                
                CERTIFICATIONS:
                AWS Certified Solutions Architect
                """;

        ParsedResumeData data = extractor.extract(resumeText);

        assertThat(data.skills()).contains("Java", "Spring Boot", "React", "PostgreSQL", "Docker", "AWS");
        assertThat(data.experience()).contains("TechCorp");
        assertThat(data.education()).contains("State University");
        assertThat(data.projects()).contains("E-Commerce Microservices");
        assertThat(data.certifications()).contains("AWS Certified");

        // Verify enriched skill profile items
        assertThat(data.skillProfile()).isNotEmpty();
        assertThat(data.skillProfile()).anyMatch(item ->
                item.name().equals("Spring Boot") &&
                item.sourceSections().contains("SKILLS") &&
                item.sourceSections().contains("EXPERIENCE") &&
                item.confidence() >= 0.85
        );
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
