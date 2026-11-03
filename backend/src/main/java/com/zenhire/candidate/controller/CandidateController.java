package com.zenhire.candidate.controller;

import com.zenhire.candidate.dto.CandidateProfileDto;
import com.zenhire.candidate.dto.CandidateProfileUpdateDto;
import com.zenhire.candidate.service.CandidateService;
import com.zenhire.common.dto.ApiResponse;
import com.zenhire.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Candidate profile operations.
 */
@RestController
@RequestMapping("/api/v1/candidate")
@RequiredArgsConstructor
@Tag(name = "Candidate", description = "Endpoints for candidate profile inspection and updates")
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get current candidate's profile details")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        CandidateProfileDto profile = candidateService.getProfile(principal);
        return ResponseEntity.ok(ApiResponse.success("Candidate profile loaded", profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Update candidate's name, phone, or professional headline")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CandidateProfileUpdateDto updateDto
    ) {
        CandidateProfileDto updated = candidateService.updateProfile(principal, updateDto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get candidate dashboard overview including resume status and test catalog summaries")
    public ResponseEntity<ApiResponse<com.zenhire.candidate.dto.CandidateDashboardDto>> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        com.zenhire.candidate.dto.CandidateDashboardDto dashboard = candidateService.getDashboard(principal);
        return ResponseEntity.ok(ApiResponse.success("Candidate dashboard loaded", dashboard));
    }

    @GetMapping("/analysis")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get candidate skill analytics: strong topics, weak topics, and recommended career paths")
    public ResponseEntity<ApiResponse<com.zenhire.candidate.dto.CandidateAnalysisDto>> getSkillAnalysis(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        com.zenhire.candidate.dto.CandidateAnalysisDto analysis = candidateService.getSkillAnalysis(principal);
        return ResponseEntity.ok(ApiResponse.success("Candidate skill analysis aggregated", analysis));
    }
}

