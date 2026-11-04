package com.zenhire.resume.dto;

import java.util.List;
import java.util.Map;

/**
 * Normalized data structure for extracted resume sections and skill profile.
 */
public record ParsedResumeData(
        List<String> skills,
        String experience,
        String education,
        String projects,
        String certifications,
        Map<String, String> sections,
        List<SkillProfileItem> skillProfile
) {
    // Backward-compatible constructor
    public ParsedResumeData(List<String> skills, String experience, String education) {
        this(skills, experience, education, "", "", Map.of(), List.of());
    }
}
