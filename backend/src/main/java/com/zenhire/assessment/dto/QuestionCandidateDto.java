package com.zenhire.assessment.dto;

import com.zenhire.assessment.entity.QuestionDifficulty;

import java.util.List;
import java.util.UUID;

/**
 * DTO for delivering assessment questions to candidates.
 * Note: 'correctIndex' is intentionally omitted to enforce answer masking at the DTO boundary.
 */
public record QuestionCandidateDto(
        UUID id,
        String questionText,
        List<String> options,
        String topicTag,
        QuestionDifficulty difficulty
) {}
