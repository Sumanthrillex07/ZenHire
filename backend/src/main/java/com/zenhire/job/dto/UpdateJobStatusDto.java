package com.zenhire.job.dto;

import com.zenhire.job.entity.JobStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateJobStatusDto(
        @NotNull(message = "Job status is required (OPEN or CLOSED)")
        JobStatus status
) {}

