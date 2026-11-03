package com.zenhire.resume.controller;

import com.zenhire.common.dto.ApiResponse;
import com.zenhire.resume.dto.ParsedResumeDto;
import com.zenhire.resume.dto.ResumeUploadResponseDto;
import com.zenhire.resume.service.ResumeService;
import com.zenhire.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Controller managing candidate resume uploads, automated parsing, and resume inspection.
 */
@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
@Tag(name = "Resume Intelligence", description = "Endpoints for uploading, parsing, and retrieving candidate resumes")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Upload and parse candidate resume (PDF format, max 5MB)")
    public ResponseEntity<ApiResponse<ResumeUploadResponseDto>> uploadResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("resume") MultipartFile file
    ) {
        ResumeUploadResponseDto response = resumeService.uploadResume(principal, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume uploaded and parsed successfully", response));
    }

    @GetMapping("/latest")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get the candidate's currently active parsed resume")
    public ResponseEntity<ApiResponse<ParsedResumeDto>> getLatestResume(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ParsedResumeDto resume = resumeService.getLatestResume(principal);
        return ResponseEntity.ok(ApiResponse.success("Resume retrieved", resume));
    }

    @GetMapping("/candidates/{candidateId}")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Inspect an applicant's parsed resume details (Recruiters only)")
    public ResponseEntity<ApiResponse<ParsedResumeDto>> getCandidateResume(
            @PathVariable UUID candidateId
    ) {
        ParsedResumeDto resume = resumeService.getCandidateResume(candidateId);
        return ResponseEntity.ok(ApiResponse.success("Candidate resume retrieved", resume));
    }
}
