package com.zenhire.resume.service.impl;

import com.zenhire.common.exception.FileProcessingException;
import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.common.service.FileStorageService;
import com.zenhire.resume.dto.ParsedResumeData;
import com.zenhire.resume.dto.ParsedResumeDto;
import com.zenhire.resume.dto.ResumeUploadResponseDto;
import com.zenhire.resume.entity.Resume;
import com.zenhire.resume.extractor.PdfTextExtractor;
import com.zenhire.resume.extractor.ResumeExtractionStrategy;
import com.zenhire.resume.repository.ResumeRepository;
import com.zenhire.resume.service.ResumeService;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final CandidateRepository candidateRepository;
    private final FileStorageService fileStorageService;
    private final PdfTextExtractor pdfTextExtractor;
    private final ResumeExtractionStrategy resumeExtractionStrategy;

    @Override
    @Transactional
    public ResumeUploadResponseDto uploadResume(UserPrincipal principal, MultipartFile file) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        String fileUrl = fileStorageService.storePdfFile(file);

        byte[] pdfBytes;
        try {
            pdfBytes = file.getBytes();
        } catch (IOException ex) {
            throw new FileProcessingException("Could not read uploaded file content", ex);
        }

        String rawText = pdfTextExtractor.extractText(pdfBytes);
        ParsedResumeData parsedData = resumeExtractionStrategy.extract(rawText);

        // De-activate previous latest resumes
        resumeRepository.markOldResumesNotLatest(candidate.getId());

        Resume resume = Resume.builder()
                .candidate(candidate)
                .fileUrl(fileUrl)
                .rawText(rawText)
                .parsedSkills(parsedData.skills())
                .parsedExperience(parsedData.experience())
                .parsedEducation(parsedData.education())
                .isLatest(true)
                .build();

        Resume saved = resumeRepository.save(resume);
        log.info("Resume parsed and persisted successfully [ID: {}] for candidate: {}", saved.getId(), candidate.getId());

        return new ResumeUploadResponseDto(
                saved.getId(),
                saved.getFileUrl(),
                saved.getParsedSkills(),
                saved.getParsedExperience(),
                saved.getParsedEducation(),
                saved.getUploadedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ParsedResumeDto getLatestResume(UserPrincipal principal) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        Resume resume = resumeRepository.findByCandidateIdAndIsLatestTrue(candidate.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "candidateId", candidate.getId()));

        return mapToDto(resume);
    }

    @Override
    @Transactional(readOnly = true)
    public ParsedResumeDto getCandidateResume(UUID candidateId) {
        Resume resume = resumeRepository.findByCandidateIdAndIsLatestTrue(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "candidateId", candidateId));

        return mapToDto(resume);
    }

    private ParsedResumeDto mapToDto(Resume resume) {
        return new ParsedResumeDto(
                resume.getId(),
                resume.getCandidate().getId(),
                resume.getFileUrl(),
                resume.getParsedSkills(),
                resume.getParsedExperience(),
                resume.getParsedEducation(),
                resume.getUploadedAt()
        );
    }
}

