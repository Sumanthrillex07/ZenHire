package com.zenhire.application.dto;

import com.zenhire.application.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateApplicationStatusDto(
        @NotNull(message = "Application status is required")
        ApplicationStatus status
) {}
