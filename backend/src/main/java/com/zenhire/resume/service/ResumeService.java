package com.zenhire.resume.service;

import com.zenhire.resume.dto.ParsedResumeDto;
import com.zenhire.resume.dto.ResumeUploadResponseDto;
import com.zenhire.security.UserPrincipal;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Service contract for processing PDF resume uploads, text extraction, and history retrieval.
 */
public interface ResumeService {

    ResumeUploadResponseDto uploadResume(UserPrincipal principal, MultipartFile file);

    ParsedResumeDto getLatestResume(UserPrincipal principal);

    ParsedResumeDto getCandidateResume(UUID candidateId);
}

