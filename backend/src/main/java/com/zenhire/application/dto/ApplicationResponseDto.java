package com.zenhire.application.dto;

import com.zenhire.application.entity.ApplicationStatus;
import com.zenhire.job.entity.RoleCategory;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ApplicationResponseDto(
        UUID id,
        UUID jobId,
        String jobTitle,
        String companyName,
        RoleCategory roleCategory,
        int matchScore,
        List<String> matchedSkills,
        List<String> missingSkills,
        ApplicationStatus status,
        Instant appliedAt,
        InterviewDetailsDto interview
) {}
