package com.zenhire.resume.extractor;

import com.zenhire.resume.dto.ParsedResumeData;
import com.zenhire.resume.dto.SkillProfileItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Deterministic fallback extractor using section parsing, phrase matching, and taxonomy validation.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HeuristicResumeExtractor implements ResumeExtractionStrategy {

    private final ResumeSectionParser sectionParser;
    private final SkillTaxonomyService taxonomyService;

    @Override
    public ParsedResumeData extract(String rawText) {
        log.info("Executing NLP & Heuristic skill extraction on {} characters of resume text", rawText.length());

        Map<String, String> sections = sectionParser.parseSections(rawText);

        String skillsSection = sections.getOrDefault(ResumeSectionParser.SectionType.SKILLS.name(), "");
        String experienceSection = sections.getOrDefault(ResumeSectionParser.SectionType.EXPERIENCE.name(), "");
        String projectsSection = sections.getOrDefault(ResumeSectionParser.SectionType.PROJECTS.name(), "");
        String educationSection = sections.getOrDefault(ResumeSectionParser.SectionType.EDUCATION.name(), "");
        String certificationsSection = sections.getOrDefault(ResumeSectionParser.SectionType.CERTIFICATIONS.name(), "");

        // If no sections were identified by headers, search entire rawText
        if (sections.isEmpty() || (skillsSection.isBlank() && experienceSection.isBlank())) {
            experienceSection = rawText;
        }

        List<SkillProfileItem> skillProfiles = new ArrayList<>();
        Set<String> uniqueCanonicalSkills = new LinkedHashSet<>();

        for (SkillTaxonomyService.TaxonomyEntry entry : taxonomyService.getAllTaxonomyEntries()) {
            String canonical = entry.canonicalName();
            List<String> sourceSections = new ArrayList<>();
            String evidenceSnippet = "";

            // Check SKILLS section
            if (!skillsSection.isBlank() && containsSkill(skillsSection, entry)) {
                sourceSections.add("SKILLS");
            }

            // Check EXPERIENCE section
            if (!experienceSection.isBlank()) {
                Optional<String> expEvidence = taxonomyService.findEvidenceSnippet(experienceSection, canonical);
                if (expEvidence.isPresent()) {
                    sourceSections.add("EXPERIENCE");
                    evidenceSnippet = expEvidence.get();
                }
            }

            // Check PROJECTS section
            if (!projectsSection.isBlank()) {
                Optional<String> projEvidence = taxonomyService.findEvidenceSnippet(projectsSection, canonical);
                if (projEvidence.isPresent()) {
                    sourceSections.add("PROJECTS");
                    if (evidenceSnippet.isBlank()) {
                        evidenceSnippet = projEvidence.get();
                    }
                }
            }

            // Check CERTIFICATIONS section
            if (!certificationsSection.isBlank() && containsSkill(certificationsSection, entry)) {
                sourceSections.add("CERTIFICATIONS");
            }

            // Check EDUCATION section
            if (!educationSection.isBlank() && containsSkill(educationSection, entry)) {
                sourceSections.add("EDUCATION");
            }

            // If detected in at least one section or general body
            if (!sourceSections.isEmpty()) {
                String recency = taxonomyService.evaluateRecency(evidenceSnippet.isBlank() ? experienceSection : evidenceSnippet);
                double confidence = taxonomyService.calculateConfidence(sourceSections, !evidenceSnippet.isBlank(), recency);

                skillProfiles.add(new SkillProfileItem(
                        canonical,
                        entry.category(),
                        confidence,
                        recency,
                        sourceSections,
                        evidenceSnippet.isBlank() ? "Listed in " + String.join(", ", sourceSections) : evidenceSnippet
                ));
                uniqueCanonicalSkills.add(canonical);
            }
        }

        // Sort by confidence DESC
        skillProfiles.sort(Comparator.comparingDouble(SkillProfileItem::confidence).reversed());

        // Extract candidate / novel skills directly from the SKILLS section so unmapped skills are NEVER removed or dropped
        extractNovelSkillsFromSkillsSection(
                skillsSection,
                experienceSection,
                projectsSection,
                uniqueCanonicalSkills,
                skillProfiles
        );

        // Re-sort after adding novel skills
        skillProfiles.sort(Comparator.comparingDouble(SkillProfileItem::confidence).reversed());

        log.info("Heuristic extractor detected {} unique normalized skills across sections", uniqueCanonicalSkills.size());

        return new ParsedResumeData(
                new ArrayList<>(uniqueCanonicalSkills),
                experienceSection.isBlank() ? "Professional experience parsed from resume text." : experienceSection,
                educationSection.isBlank() ? "Educational background parsed from resume text." : educationSection,
                projectsSection,
                certificationsSection,
                sections,
                skillProfiles
        );
    }

    private static final Set<String> STOPWORDS = Set.of(
            "and", "or", "etc", "experience", "proficient", "familiar", "knowledge",
            "working", "strong", "skills", "technologies", "tools", "years", "basic",
            "intermediate", "advanced", "good", "level", "understanding", "principles",
            "concepts", "methodologies", "development", "architecture", "engineering",
            "environment", "solutions", "practices", "languages", "frameworks", "databases",
            "technical", "stack", "overview", "core", "libraries", "platforms"
    );

    /**
     * Extracts novel or unmapped skills directly from the SKILLS section to ensure nothing is dropped.
     */
    public void extractNovelSkillsFromSkillsSection(
            String skillsSection,
            String experienceSection,
            String projectsSection,
            Set<String> uniqueCanonicalSkills,
            List<SkillProfileItem> skillProfiles
    ) {
        if (skillsSection == null || skillsSection.isBlank()) return;

        String[] lines = skillsSection.split("\\r?\\n");
        for (String line : lines) {
            String trimmedLine = line.trim();
            if (trimmedLine.isBlank()) continue;

            String inferredCategory = "OTHER";
            String contentToParse = trimmedLine;

            int colonIdx = trimmedLine.indexOf(':');
            if (colonIdx > 0 && colonIdx < 35) {
                String prefix = trimmedLine.substring(0, colonIdx).toLowerCase();
                inferredCategory = inferCategoryFromHeader(prefix);
                contentToParse = trimmedLine.substring(colonIdx + 1).trim();
            }

            // Split by commas, semicolons, pipes, or bullets
            String[] tokens = contentToParse.split("[,;|•\u2022\u25E6\t]+");
            for (String rawToken : tokens) {
                String candidate = cleanCandidateSkill(rawToken);
                if (isValidCandidateSkill(candidate)) {
                    String canonical = taxonomyService.normalize(candidate);

                    boolean alreadyExists = uniqueCanonicalSkills.stream()
                            .anyMatch(s -> s.equalsIgnoreCase(canonical));

                    if (!alreadyExists) {
                        List<String> sourceSections = new ArrayList<>();
                        sourceSections.add("SKILLS");
                        String evidenceSnippet = "";

                        if (!experienceSection.isBlank()) {
                            Optional<String> expEvidence = taxonomyService.findEvidenceSnippet(experienceSection, canonical);
                            if (expEvidence.isPresent()) {
                                sourceSections.add("EXPERIENCE");
                                evidenceSnippet = expEvidence.get();
                            }
                        }

                        if (!projectsSection.isBlank()) {
                            Optional<String> projEvidence = taxonomyService.findEvidenceSnippet(projectsSection, canonical);
                            if (projEvidence.isPresent()) {
                                sourceSections.add("PROJECTS");
                                if (evidenceSnippet.isBlank()) {
                                    evidenceSnippet = projEvidence.get();
                                }
                            }
                        }

                        String recency = taxonomyService.evaluateRecency(evidenceSnippet.isBlank() ? experienceSection : evidenceSnippet);
                        double confidence = taxonomyService.calculateConfidence(sourceSections, !evidenceSnippet.isBlank(), recency);
                        String resolvedCategory = "OTHER".equals(inferredCategory)
                                ? taxonomyService.getCategory(canonical)
                                : inferredCategory;

                        skillProfiles.add(new SkillProfileItem(
                                canonical,
                                resolvedCategory,
                                confidence,
                                recency,
                                sourceSections,
                                evidenceSnippet.isBlank() ? "Extracted from candidate Skills section" : evidenceSnippet
                        ));
                        uniqueCanonicalSkills.add(canonical);
                    }
                }
            }
        }
    }

    private String inferCategoryFromHeader(String header) {
        if (header.contains("lang")) return "LANGUAGES";
        if (header.contains("ai") || header.contains("ml") || header.contains("model") || header.contains("llm")) return "AI_ML";
        if (header.contains("frame") || header.contains("back") || header.contains("server")) return "BACKEND";
        if (header.contains("front") || header.contains("ui") || header.contains("web")) return "FRONTEND";
        if (header.contains("data") || header.contains("db") || header.contains("sql") || header.contains("store")) return "DATABASES";
        if (header.contains("cloud") || header.contains("devops") || header.contains("infra")) return "CLOUD_DEVOPS";
        if (header.contains("test") || header.contains("qa")) return "TESTING_TOOLS";
        if (header.contains("arch") || header.contains("pattern") || header.contains("system")) return "ARCHITECTURE";
        return "OTHER";
    }

    private String cleanCandidateSkill(String raw) {
        if (raw == null) return "";
        // Remove parenthesized and bracketed remarks like (expert) or [v2]
        String cleaned = raw.replaceAll("\\([^)]*\\)", "").replaceAll("\\[[^\\]]*\\]", "");
        // Remove leading bullets and hyphens
        cleaned = cleaned.replaceAll("^[•\\-\\*\u2022\u25E6\u25AA\u25B8]+\\s*", "");
        // Remove leading and trailing punctuation
        cleaned = cleaned.replaceAll("^[^a-zA-Z0-9+#.]+|[^a-zA-Z0-9+#.]+$", "");
        return cleaned.trim();
    }

    private boolean isValidCandidateSkill(String candidate) {
        if (candidate.length() < 2 || candidate.length() > 40) {
            return false;
        }
        // Must contain at least one alphabet letter
        if (!candidate.matches(".*[a-zA-Z].*")) {
            return false;
        }
        // Must not be a common stopword or descriptive qualifier
        return !STOPWORDS.contains(candidate.toLowerCase());
    }

    private boolean containsSkill(String text, SkillTaxonomyService.TaxonomyEntry entry) {
        return taxonomyService.findEvidenceSnippet(text, entry.canonicalName()).isPresent();
    }
}
