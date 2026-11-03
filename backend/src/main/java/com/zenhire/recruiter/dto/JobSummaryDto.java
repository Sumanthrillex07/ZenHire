package com.zenhire.recruiter.dto;

import com.zenhire.job.entity.JobStatus;
import com.zenhire.job.entity.RoleCategory;

import java.time.Instant;
import java.util.UUID;

public record JobSummaryDto(
        UUID id,
        String title,
        RoleCategory roleCategory,
        JobStatus status,
        Instant createdAt,
        long applicantsCount
) {}

