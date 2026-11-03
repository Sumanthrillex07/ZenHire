package com.zenhire.matching.dto;

import java.util.List;

/**
 * Result of the 60/40 Hybrid AI candidate-job matching algorithm.
 */
public record MatchResultDto(
        int matchScore,
        int skillOverlapScore,
        int llmFitScore,
        List<String> matchedSkills,
        List<String> missingSkills,
        String reasoning
) {}

