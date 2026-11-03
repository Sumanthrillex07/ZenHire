package com.zenhire.candidate.dto;

import com.zenhire.assessment.dto.TestSummaryDto;

import java.time.Instant;
import java.util.List;

public record CandidateDashboardDto(
        boolean hasResume,
        Instant resumeUploadedAt,
        long applicationsCount,
        List<TestSummaryDto> tests
) {}
