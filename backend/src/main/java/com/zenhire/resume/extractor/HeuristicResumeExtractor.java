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

    private boolean containsSkill(String text, SkillTaxonomyService.TaxonomyEntry entry) {
        return taxonomyService.findEvidenceSnippet(text, entry.canonicalName()).isPresent();
    }
}
