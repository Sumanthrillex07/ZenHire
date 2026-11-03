package com.zenhire.recruiter.dto;

import java.util.List;

public record RecruiterDashboardDto(
        long openJobs,
        long totalApplicants,
        long shortlisted,
        List<TopScorerDto> topScorers,
        List<JobSummaryDto> jobs
) {}

