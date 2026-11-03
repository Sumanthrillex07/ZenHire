package com.zenhire.candidate.dto;

import java.time.Instant;
import java.util.UUID;

public record CandidateProfileDto(
        UUID candidateId,
        UUID userId,
        String name,
        String email,
        String phone,
        String headline,
        Instant createdAt
) {}

