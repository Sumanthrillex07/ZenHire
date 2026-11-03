package com.zenhire.resume.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ParsedResumeDto(
        UUID id,
        UUID candidateId,
        String fileUrl,
        List<String> skills,
        String experience,
        String education,
        Instant uploadedAt
) {}

