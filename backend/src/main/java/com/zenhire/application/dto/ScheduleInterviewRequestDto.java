package com.zenhire.application.dto;

import com.zenhire.application.entity.InterviewMode;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record ScheduleInterviewRequestDto(
        @NotNull(message = "Interview scheduled time is required")
        @Future(message = "Scheduled time must be in the future")
        Instant scheduledTime,

        @NotNull(message = "Interview mode is required (ONLINE or OFFLINE)")
        InterviewMode mode,

        @Size(max = 1000, message = "Notes must not exceed 1000 characters")
        String notes
) {}
