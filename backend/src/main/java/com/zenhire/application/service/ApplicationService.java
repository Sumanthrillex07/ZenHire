package com.zenhire.application.service;

import com.zenhire.application.dto.ApplicantDetailDto;
import com.zenhire.application.dto.ApplicationResponseDto;
import com.zenhire.application.dto.InterviewDetailsDto;
import com.zenhire.application.dto.ScheduleInterviewRequestDto;
import com.zenhire.application.entity.ApplicationStatus;
import com.zenhire.security.UserPrincipal;

import java.util.List;
import java.util.UUID;

/**
 * Service contract for job applications, assessment gating validation, pipeline transitions, and interview scheduling.
 */
public interface ApplicationService {

    ApplicationResponseDto applyForJob(UserPrincipal principal, UUID jobId);

    List<ApplicationResponseDto> getCandidateApplications(UserPrincipal principal);

    List<ApplicantDetailDto> getJobApplicants(UserPrincipal principal, UUID jobId, String sort);

    ApplicationResponseDto updateApplicationStatus(UserPrincipal principal, UUID applicationId, ApplicationStatus status);

    InterviewDetailsDto scheduleInterview(UserPrincipal principal, UUID applicationId, ScheduleInterviewRequestDto request);
}

