package com.zenhire.recruiter.dto;

import jakarta.validation.constraints.Size;

public record RecruiterProfileUpdateDto(
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(min = 2, max = 150, message = "Company name must be between 2 and 150 characters")
        String companyName
) {}

