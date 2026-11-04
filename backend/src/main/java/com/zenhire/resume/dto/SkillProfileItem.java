package com.zenhire.resume.dto;

import java.util.List;

/**
 * Validated, categorized, and scored candidate skill profile item.
 *
 * @param name            Normalized canonical skill name (e.g. "Spring Boot")
 * @param category        Taxonomy category (e.g. "BACKEND", "FRONTEND", "DATABASES")
 * @param confidence      Confidence score from 0.0 to 1.0 (e.g. 0.95)
 * @param recency         Recency indicator: "CURRENT", "RECENT", or "HISTORICAL"
 * @param sourceSections  Sections where this skill was detected (e.g. ["SKILLS", "EXPERIENCE", "PROJECTS"])
 * @param evidenceSnippet Contextual excerpt demonstrating where/how the skill was applied
 */
public record SkillProfileItem(
        String name,
        String category,
        double confidence,
        String recency,
        List<String> sourceSections,
        String evidenceSnippet
) {}
