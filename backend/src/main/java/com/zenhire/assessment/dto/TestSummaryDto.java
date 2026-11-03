package com.zenhire.assessment.dto;

import com.zenhire.assessment.entity.TestType;
import com.zenhire.job.entity.RoleCategory;

import java.util.UUID;

public record TestSummaryDto(
        UUID id,
        TestType testType,
        RoleCategory roleCategory,
        String title,
        int passScore,
        boolean hasAttempted,
        int highestScore,
        boolean passed
) {}
