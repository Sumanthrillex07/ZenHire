package com.zenhire.resume;

import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.common.service.FileStorageService;
import com.zenhire.resume.dto.ParsedResumeData;
import com.zenhire.resume.dto.ParsedResumeDto;
import com.zenhire.resume.dto.ResumeUploadResponseDto;
import com.zenhire.resume.entity.Resume;
import com.zenhire.resume.extractor.PdfTextExtractor;
import com.zenhire.resume.extractor.ResumeExtractionStrategy;
import com.zenhire.resume.repository.ResumeRepository;
import com.zenhire.resume.service.impl.ResumeServiceImpl;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.entity.Role;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.CandidateRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeServiceTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private PdfTextExtractor pdfTextExtractor;

    @Mock
    private ResumeExtractionStrategy resumeExtractionStrategy;

    @InjectMocks
    private ResumeServiceImpl resumeService;

    @Test
    @DisplayName("Should successfully upload, extract, and save resume")
    void shouldUploadAndSaveResume() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, candidateId, null, List.of()
        );

        User user = User.builder().id(userId).name("Jane Doe").email("jane@example.com").build();
        Candidate candidate = Candidate.builder().id(candidateId).user(user).build();

        MockMultipartFile file = new MockMultipartFile(
                "resume", "resume.pdf", "application/pdf", "%PDF-1.4 mock".getBytes()
        );

        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.of(candidate));
        when(fileStorageService.storePdfFile(file)).thenReturn("/uploads/resume.pdf");
        when(pdfTextExtractor.extractText(any())).thenReturn("Raw resume text");
        when(resumeExtractionStrategy.extract("Raw resume text"))
                .thenReturn(new ParsedResumeData(List.of("Java", "Spring Boot"), "3 yrs exp", "B.S. CS"));

        Resume savedResume = Resume.builder()
                .id(UUID.randomUUID())
                .candidate(candidate)
                .fileUrl("/uploads/resume.pdf")
                .rawText("Raw resume text")
                .parsedSkills(List.of("Java", "Spring Boot"))
                .parsedExperience("3 yrs exp")
                .parsedEducation("B.S. CS")
                .isLatest(true)
                .uploadedAt(Instant.now())
                .build();

        when(resumeRepository.save(any(Resume.class))).thenReturn(savedResume);

        ResumeUploadResponseDto response = resumeService.uploadResume(principal, file);

        assertThat(response.fileUrl()).isEqualTo("/uploads/resume.pdf");
        assertThat(response.skills()).contains("Java", "Spring Boot");
        assertThat(response.experience()).isEqualTo("3 yrs exp");
        verify(resumeRepository).markOldResumesNotLatest(candidateId);
        verify(resumeRepository).save(any(Resume.class));
    }

    @Test
    @DisplayName("Should retrieve latest resume")
    void shouldGetLatestResume() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, candidateId, null, List.of()
        );

        Candidate candidate = Candidate.builder().id(candidateId).build();
        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.of(candidate));

        Resume resume = Resume.builder()
                .id(UUID.randomUUID())
                .candidate(candidate)
                .fileUrl("/uploads/resume.pdf")
                .rawText("Text")
                .parsedSkills(List.of("Java"))
                .parsedExperience("Exp")
                .parsedEducation("Edu")
                .uploadedAt(Instant.now())
                .build();

        when(resumeRepository.findByCandidateIdAndIsLatestTrue(candidateId)).thenReturn(Optional.of(resume));

        ParsedResumeDto result = resumeService.getLatestResume(principal);

        assertThat(result.skills()).contains("Java");
        assertThat(result.fileUrl()).isEqualTo("/uploads/resume.pdf");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when no resume found")
    void shouldThrowWhenResumeNotFound() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, candidateId, null, List.of()
        );

        Candidate candidate = Candidate.builder().id(candidateId).build();
        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.of(candidate));
        when(resumeRepository.findByCandidateIdAndIsLatestTrue(candidateId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resumeService.getLatestResume(principal))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

