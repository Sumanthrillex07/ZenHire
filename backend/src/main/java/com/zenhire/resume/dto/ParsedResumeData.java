package com.zenhire.resume.dto;

import java.util.List;

/**
 * Normalized data structure for extracted resume sections.
 */
public record ParsedResumeData(
        List<String> skills,
        String experience,
        String education
) {}

