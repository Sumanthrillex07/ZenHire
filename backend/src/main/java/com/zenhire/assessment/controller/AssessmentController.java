package com.zenhire.assessment.controller;

import com.zenhire.assessment.dto.*;
import com.zenhire.assessment.service.AssessmentService;
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
 * Controller exposing assessment catalog, masked question delivery, and grading endpoints.
 */
@RestController
@RequestMapping("/api/v1/tests")
@RequiredArgsConstructor
@Tag(name = "Assessments", description = "Endpoints for aptitude and role-specific gating tests")
public class AssessmentController {

    private final AssessmentService assessmentService;

    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get assessment test catalog with candidate completion and score status")
    public ResponseEntity<ApiResponse<List<TestSummaryDto>>> getTestCatalog(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<TestSummaryDto> catalog = assessmentService.getTestCatalog(principal);
        return ResponseEntity.ok(ApiResponse.success("Assessment catalog loaded", catalog));
    }

    @GetMapping("/{testId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get assessment questions with answers masked at the DTO layer")
    public ResponseEntity<ApiResponse<TestDetailDto>> getTestDetails(@PathVariable UUID testId) {
        TestDetailDto testDetails = assessmentService.getTestDetails(testId);
        return ResponseEntity.ok(ApiResponse.success("Test details loaded", testDetails));
    }

    @PostMapping("/{testId}/attempts")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Start a new assessment attempt session")
    public ResponseEntity<ApiResponse<StartAttemptResponseDto>> startAttempt(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID testId
    ) {
        StartAttemptResponseDto response = assessmentService.startAttempt(principal, testId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Test attempt initiated", response));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Submit attempt answers for server-side grading and gating validation")
    public ResponseEntity<ApiResponse<AttemptResultDto>> submitAttempt(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID attemptId,
            @Valid @RequestBody SubmitAttemptRequestDto request
    ) {
        AttemptResultDto result = assessmentService.submitAttempt(principal, attemptId, request);
        return ResponseEntity.ok(ApiResponse.success("Assessment submitted and graded", result));
    }
}

