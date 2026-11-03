package com.zenhire.application.dto;

import com.zenhire.application.entity.ApplicationStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ApplicantDetailDto(
        UUID applicationId,
        UUID candidateId,
        String candidateName,
        String candidateEmail,
        int matchScore,
        List<String> matchedSkills,
        List<String> missingSkills,
        ApplicationStatus status,
        Instant appliedAt,
        String resumeUrl,
        InterviewDetailsDto interview
) {}

