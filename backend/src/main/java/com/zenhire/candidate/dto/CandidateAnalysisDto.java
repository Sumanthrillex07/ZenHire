package com.zenhire.candidate.dto;

import com.zenhire.job.entity.RoleCategory;

import java.util.List;

public record CandidateAnalysisDto(
        List<String> strongTopics,
        List<String> weakTopics,
        List<RoleCategory> recommendedRoles
) {}
