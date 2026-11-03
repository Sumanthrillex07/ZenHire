package com.zenhire.recruiter.dto;

import com.zenhire.application.entity.ApplicationStatus;

import java.util.UUID;

public record TopScorerDto(
        UUID applicationId,
        String candidateName,
        String jobTitle,
        int matchScore,
        ApplicationStatus status
) {}

