package com.zenhire.job.controller;

import com.zenhire.common.dto.ApiResponse;
import com.zenhire.common.dto.PageResponse;
import com.zenhire.job.dto.CreateJobRequestDto;
import com.zenhire.job.dto.JobResponseDto;
import com.zenhire.job.dto.UpdateJobStatusDto;
import com.zenhire.job.entity.RoleCategory;
import com.zenhire.job.service.JobService;
import com.zenhire.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller exposing REST endpoints for job requisition authoring, discovery, and filtering.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Job Requisitions", description = "Endpoints for posting, querying, and managing hiring positions")
public class JobController {

    private final JobService jobService;

    @PostMapping("/jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Publish a new job requisition (Recruiters only)")
    public ResponseEntity<ApiResponse<JobResponseDto>> createJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateJobRequestDto request
    ) {
        JobResponseDto createdJob = jobService.createJob(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job created successfully", createdJob));
    }

    @GetMapping("/jobs")
    @Operation(summary = "Discover open jobs with optional role category and text search filters")
    public ResponseEntity<ApiResponse<PageResponse<JobResponseDto>>> getJobs(
            @RequestParam(required = false) RoleCategory category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<JobResponseDto> jobs = jobService.getJobs(category, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Jobs retrieved successfully", jobs));
    }

    @GetMapping("/jobs/{id}")
    @Operation(summary = "Get full details of a specific job requisition")
    public ResponseEntity<ApiResponse<JobResponseDto>> getJobById(@PathVariable UUID id) {
        JobResponseDto job = jobService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success("Job details loaded", job));
    }

    @PatchMapping("/jobs/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Update the status of a job requisition (OPEN / CLOSED)")
    public ResponseEntity<ApiResponse<JobResponseDto>> updateJobStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateJobStatusDto statusDto
    ) {
        JobResponseDto updatedJob = jobService.updateJobStatus(principal, id, statusDto.status());
        return ResponseEntity.ok(ApiResponse.success("Job status updated", updatedJob));
    }

    @GetMapping("/recruiter/jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "List all jobs created by the authenticated recruiter")
    public ResponseEntity<ApiResponse<List<JobResponseDto>>> getRecruiterJobs(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<JobResponseDto> jobs = jobService.getRecruiterJobs(principal);
        return ResponseEntity.ok(ApiResponse.success("Recruiter jobs retrieved", jobs));
    }
}

