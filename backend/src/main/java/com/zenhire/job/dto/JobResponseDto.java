package com.zenhire.job.dto;

import com.zenhire.job.entity.JobStatus;
import com.zenhire.job.entity.RoleCategory;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record JobResponseDto(
        UUID id,
        UUID recruiterId,
        String companyName,
        String title,
        String description,
        List<String> requiredSkills,
        RoleCategory roleCategory,
        JobStatus status,
        long applicantsCount,
        Instant createdAt,
        Instant updatedAt
) {}

