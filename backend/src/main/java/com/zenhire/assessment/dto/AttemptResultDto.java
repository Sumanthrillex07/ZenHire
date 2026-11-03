package com.zenhire.assessment.dto;

public record AttemptResultDto(
        int score,
        boolean passed,
        int correctCount,
        int totalQuestions
) {}
