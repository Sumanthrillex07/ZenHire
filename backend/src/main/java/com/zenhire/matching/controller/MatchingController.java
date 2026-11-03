package com.zenhire.matching.controller;

import com.zenhire.common.dto.ApiResponse;
import com.zenhire.matching.dto.MatchResultDto;
import com.zenhire.matching.service.MatchingService;
import com.zenhire.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for candidate-job compatibility match preview and score analysis.
 */
@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Job Matching", description = "Endpoints for AI-powered candidate-job compatibility scoring")
public class MatchingController {

    private final MatchingService matchingService;

    @GetMapping("/{jobId}/match")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Calculate 60/40 hybrid compatibility score for the current candidate against a target job")
    public ResponseEntity<ApiResponse<MatchResultDto>> getJobMatch(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID jobId
    ) {
        MatchResultDto matchResult = matchingService.calculateCandidateJobMatch(principal, jobId);
        return ResponseEntity.ok(ApiResponse.success("Match score calculated", matchResult));
    }
}

