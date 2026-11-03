package com.zenhire.application.controller;

import com.zenhire.application.dto.ApplicantDetailDto;
import com.zenhire.application.dto.ApplicationResponseDto;
import com.zenhire.application.dto.InterviewDetailsDto;
import com.zenhire.application.dto.ScheduleInterviewRequestDto;
import com.zenhire.application.dto.UpdateApplicationStatusDto;
import com.zenhire.application.service.ApplicationService;
import com.zenhire.common.dto.ApiResponse;
import com.zenhire.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller exposing endpoints for job applications, applicant ranking, pipeline management, and interview scheduling.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Applications & Pipeline", description = "Endpoints for job applications, gating verification, and recruiter applicant tracking")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/jobs/{jobId}/apply")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Submit an application for an open job requisition (enforces assessment gating)")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> applyForJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID jobId
    ) {
        ApplicationResponseDto application = applicationService.applyForJob(principal, jobId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted successfully", application));
    }

    @GetMapping("/candidate/applications")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get application tracking history for the authenticated candidate")
    public ResponseEntity<ApiResponse<List<ApplicationResponseDto>>> getCandidateApplications(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ApplicationResponseDto> applications = applicationService.getCandidateApplications(principal);
        return ResponseEntity.ok(ApiResponse.success("Applications retrieved", applications));
    }

    @GetMapping("/jobs/{jobId}/applicants")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Get ranked applicants for a recruiter's job requisition")
    public ResponseEntity<ApiResponse<List<ApplicantDetailDto>>> getJobApplicants(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID jobId,
            @RequestParam(required = false, defaultValue = "matchScore") String sort
    ) {
        List<ApplicantDetailDto> applicants = applicationService.getJobApplicants(principal, jobId, sort);
        return ResponseEntity.ok(ApiResponse.success("Applicants retrieved", applicants));
    }

    @PatchMapping("/applications/{applicationId}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Update an applicant's pipeline status (APPLIED, SHORTLISTED, REJECTED, HIRED)")
    public ResponseEntity<ApiResponse<ApplicationResponseDto>> updateApplicationStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID applicationId,
            @Valid @RequestBody UpdateApplicationStatusDto statusDto
    ) {
        ApplicationResponseDto updated = applicationService.updateApplicationStatus(principal, applicationId, statusDto.status());
        return ResponseEntity.ok(ApiResponse.success("Application status updated", updated));
    }

    @PostMapping("/applications/{applicationId}/interview")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Schedule an interview round and transition application status to INTERVIEW_SCHEDULED")
    public ResponseEntity<ApiResponse<InterviewDetailsDto>> scheduleInterview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID applicationId,
            @Valid @RequestBody ScheduleInterviewRequestDto request
    ) {
        InterviewDetailsDto interview = applicationService.scheduleInterview(principal, applicationId, request);
        return ResponseEntity.ok(ApiResponse.success("Interview scheduled successfully", interview));
    }
}
