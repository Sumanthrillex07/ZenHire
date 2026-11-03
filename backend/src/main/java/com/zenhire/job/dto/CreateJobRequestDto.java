package com.zenhire.job.dto;

import com.zenhire.job.entity.RoleCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateJobRequestDto(
        @NotBlank(message = "Job title is required")
        @Size(max = 150, message = "Job title must not exceed 150 characters")
        String title,

        @NotBlank(message = "Job description is required")
        String description,

        @NotEmpty(message = "At least one required skill must be specified")
        List<String> requiredSkills,

        @NotNull(message = "Role category is required (FRONTEND, BACKEND, or AI_ML)")
        RoleCategory roleCategory
) {}

