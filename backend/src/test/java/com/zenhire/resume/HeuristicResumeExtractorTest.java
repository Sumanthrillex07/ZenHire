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

    @Test
    @DisplayName("Should extract and normalize LangChain, LangGraph, and AI frameworks")
    void shouldExtractAndNormalizeLangChainAndLangGraph() {
        String resumeText = """
                Alex AI Engineer
                
                TECHNICAL SKILLS:
                AI & Frameworks: langchain, lang-graph, llamaindex, PyTorch, Ollama
                Cloud: Docker, AWS
                
                EXPERIENCE:
                AI Engineer at AgentCorp (2024 - Present)
                Built multi-agent workflows using LangGraph and LangChain pipelines.
                
                PROJECTS:
                RAG Agent: Integrated LangChain with vector databases for question answering.
                """;

        ParsedResumeData data = extractor.extract(resumeText);

        assertThat(data.skills()).contains("LangChain", "LangGraph", "LlamaIndex", "PyTorch", "Ollama");
        
        assertThat(data.skillProfile()).anyMatch(item ->
                item.name().equals("LangChain") &&
                "AI_ML".equals(item.category()) &&
                item.sourceSections().contains("SKILLS") &&
                item.sourceSections().contains("EXPERIENCE")
        );

        assertThat(data.skillProfile()).anyMatch(item ->
                item.name().equals("LangGraph") &&
                "AI_ML".equals(item.category()) &&
                item.sourceSections().contains("SKILLS") &&
                item.sourceSections().contains("EXPERIENCE")
        );
    }

    @Test
    @DisplayName("Should keep and never drop unmapped or novel skills")
    void shouldKeepNovelUnmappedSkills() {
        String resumeText = """
                Dev Candidate
                
                SKILLS:
                Languages: Java, Python
                Modern Tools: Pinia, CustomAgentTool, SuperNovelFramework
                
                EXPERIENCE:
                Frontend Engineer (2025 - Present)
                Maintained store state using Pinia for complex dashboard views.
                """;

        ParsedResumeData data = extractor.extract(resumeText);

        // Core known skills
        assertThat(data.skills()).contains("Java", "Python");

        // Novel unmapped skills must NOT be dropped
        assertThat(data.skills()).contains("Pinia", "CustomAgentTool", "SuperNovelFramework");

        // Pinia should have evidence from experience
        assertThat(data.skillProfile()).anyMatch(item ->
                item.name().equals("Pinia") &&
                item.sourceSections().contains("SKILLS") &&
                item.sourceSections().contains("EXPERIENCE") &&
                item.evidenceSnippet().contains("Pinia")
        );
    }
}
