package com.zenhire.application.dto;

import com.zenhire.application.entity.InterviewMode;
import com.zenhire.application.entity.InterviewStatus;

import java.time.Instant;
import java.util.UUID;

public record InterviewDetailsDto(
        UUID id,
        Instant scheduledTime,
        InterviewMode mode,
        InterviewStatus status,
        String notes
) {}

