package com.zenhire.assessment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SubmitAttemptRequestDto(
        @NotEmpty(message = "Answers list cannot be empty")
        List<@Valid AnswerSubmissionItemDto> answers
) {}
