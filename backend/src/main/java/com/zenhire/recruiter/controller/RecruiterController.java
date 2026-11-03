package com.zenhire.recruiter.controller;

import com.zenhire.common.dto.ApiResponse;
import com.zenhire.recruiter.dto.RecruiterProfileDto;
import com.zenhire.recruiter.dto.RecruiterProfileUpdateDto;
import com.zenhire.recruiter.service.RecruiterService;
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
 * Controller for Recruiter company and profile operations.
 */
@RestController
@RequestMapping("/api/v1/recruiter")
@RequiredArgsConstructor
@Tag(name = "Recruiter", description = "Endpoints for company recruiter profile and dashboard management")
public class RecruiterController {

    private final RecruiterService recruiterService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Get current recruiter profile details")
    public ResponseEntity<ApiResponse<RecruiterProfileDto>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        RecruiterProfileDto profile = recruiterService.getProfile(principal);
        return ResponseEntity.ok(ApiResponse.success("Recruiter profile loaded", profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Update recruiter's name and company name")
    public ResponseEntity<ApiResponse<RecruiterProfileDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RecruiterProfileUpdateDto updateDto
    ) {
        RecruiterProfileDto updated = recruiterService.updateProfile(principal, updateDto);
        return ResponseEntity.ok(ApiResponse.success("Recruiter profile updated successfully", updated));
    }
}

