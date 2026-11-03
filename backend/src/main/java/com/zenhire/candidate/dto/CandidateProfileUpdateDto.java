package com.zenhire.candidate.dto;

import jakarta.validation.constraints.Size;

public record CandidateProfileUpdateDto(
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 30, message = "Phone must be at most 30 characters")
        String phone,

        @Size(max = 255, message = "Headline must be at most 255 characters")
        String headline
) {}

