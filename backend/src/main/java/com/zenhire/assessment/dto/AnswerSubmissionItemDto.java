package com.zenhire.assessment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AnswerSubmissionItemDto(
        @NotNull(message = "Question ID is required")
        UUID questionId,

        @NotNull(message = "Selected option index is required")
        @Min(value = 0, message = "Selected index must be between 0 and 3")
        @Max(value = 3, message = "Selected index must be between 0 and 3")
        Integer selectedIndex
) {}

