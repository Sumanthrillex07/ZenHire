package com.zenhire.resume.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ResumeUploadResponseDto(
        UUID id,
        String fileUrl,
        List<String> skills,
        String experience,
        String education,
        String projects,
        String certifications,
        Map<String, String> sections,
        List<SkillProfileItem> skillProfile,
        Instant uploadedAt
) {
    // Backward-compatible constructor
    public ResumeUploadResponseDto(
            UUID id,
            String fileUrl,
            List<String> skills,
            String experience,
            String education,
            Instant uploadedAt
    ) {
        this(id, fileUrl, skills, experience, education, "", "", Map.of(), List.of(), uploadedAt);
    }
}
