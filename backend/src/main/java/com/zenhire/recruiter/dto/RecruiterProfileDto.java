package com.zenhire.recruiter.dto;

import java.time.Instant;
import java.util.UUID;

public record RecruiterProfileDto(
        UUID recruiterId,
        UUID userId,
        String name,
        String email,
        String companyName,
        Instant createdAt
) {}

