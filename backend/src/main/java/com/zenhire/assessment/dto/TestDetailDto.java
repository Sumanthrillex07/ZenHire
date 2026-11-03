package com.zenhire.assessment.dto;

import com.zenhire.assessment.entity.TestType;
import com.zenhire.job.entity.RoleCategory;

import java.util.List;
import java.util.UUID;

public record TestDetailDto(
        UUID id,
        TestType testType,
        RoleCategory roleCategory,
        String title,
        int passScore,
        List<QuestionCandidateDto> questions
) {}
