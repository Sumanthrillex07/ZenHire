package com.zenhire.application.service.impl;

import com.zenhire.application.dto.ApplicantDetailDto;
import com.zenhire.application.dto.ApplicationResponseDto;
import com.zenhire.application.dto.InterviewDetailsDto;
import com.zenhire.application.dto.ScheduleInterviewRequestDto;
import com.zenhire.application.entity.Application;
import com.zenhire.application.entity.ApplicationStatus;
import com.zenhire.application.entity.Interview;
import com.zenhire.application.entity.InterviewStatus;
import com.zenhire.application.repository.ApplicationRepository;
import com.zenhire.application.repository.InterviewRepository;
import com.zenhire.application.service.ApplicationService;
import com.zenhire.assessment.entity.Test;
import com.zenhire.assessment.entity.TestAttempt;
import com.zenhire.assessment.repository.TestAttemptRepository;
import com.zenhire.assessment.repository.TestRepository;
import com.zenhire.common.exception.*;
import com.zenhire.job.entity.Job;
import com.zenhire.job.repository.JobRepository;
import com.zenhire.matching.dto.MatchResultDto;
import com.zenhire.matching.service.MatchingService;
import com.zenhire.resume.entity.Resume;
import com.zenhire.resume.repository.ResumeRepository;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final TestRepository testRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final MatchingService matchingService;

    @Override
    @Transactional
    public ApplicationResponseDto applyForJob(UserPrincipal principal, UUID jobId) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        // 1. Verify Candidate has an active parsed resume
        Resume resume = resumeRepository.findByCandidateIdAndIsLatestTrue(candidate.getId())
                .orElseThrow(() -> new BaseApiException("You must upload a resume before applying to jobs", HttpStatus.BAD_REQUEST, "RESUME_REQUIRED") {});

        // 2. Prevent duplicate applications
        if (applicationRepository.existsByCandidateIdAndJobId(candidate.getId(), jobId)) {
            throw new DuplicateResourceException("You have already submitted an application for this job.");
        }

        Job job = jobRepository.findWithRecruiterById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        // 3. Application Gating Check: Candidate MUST have passed the category test
        Test gateTest = testRepository.findByRoleCategory(job.getRoleCategory())
                .orElseThrow(() -> new ResourceNotFoundException("Gating Assessment", "roleCategory", job.getRoleCategory()));

        Optional<TestAttempt> passingAttemptOpt = testAttemptRepository
                .findFirstByCandidateIdAndTestIdAndPassedTrueOrderByScoreDesc(candidate.getId(), gateTest.getId());

        if (passingAttemptOpt.isEmpty()) {
            log.warn("Candidate {} blocked by assessment gate on job {} (category: {})",
                    candidate.getId(), jobId, job.getRoleCategory());
            throw new AssessmentGatingException(gateTest.getId(), job.getRoleCategory().name());
        }

        TestAttempt gateAttempt = passingAttemptOpt.get();

        // 4. Calculate hybrid match score (60% deterministic + 40% LLM)
        MatchResultDto matchResult = matchingService.calculateMatchForEntities(resume, job);

        Application application = Application.builder()
                .candidate(candidate)
                .job(job)
                .resume(resume)
                .gateTestAttempt(gateAttempt)
                .matchScore(matchResult.matchScore())
                .matchedSkills(matchResult.matchedSkills())
                .missingSkills(matchResult.missingSkills())
                .status(ApplicationStatus.APPLIED)
                .build();

        Application saved = applicationRepository.save(application);
        log.info("Application submitted successfully [ID: {}] for candidate {} on job {} with match score {}",
                saved.getId(), candidate.getId(), jobId, saved.getMatchScore());

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getCandidateApplications(UserPrincipal principal) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        return applicationRepository.findAllByCandidateIdOrderByAppliedAtDesc(candidate.getId()).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicantDetailDto> getJobApplicants(UserPrincipal principal, UUID jobId, String sort) {
        Job job = jobRepository.findWithRecruiterById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        // Ownership validation
        if (!job.getRecruiter().getUser().getId().equals(principal.getId())) {
            throw new ForbiddenOperationException("You do not have permission to view applicants for this job");
        }

        List<Application> applications = ("appliedAt".equalsIgnoreCase(sort))
                ? applicationRepository.findAllByJobIdOrderByAppliedAtDesc(jobId)
                : applicationRepository.findAllByJobIdOrderByMatchScoreDesc(jobId);

        return applications.stream().map(app -> new ApplicantDetailDto(
                app.getId(),
                app.getCandidate().getId(),
                app.getCandidate().getUser().getName(),
                app.getCandidate().getUser().getEmail(),
                app.getMatchScore(),
                app.getMatchedSkills(),
                app.getMissingSkills(),
                app.getStatus(),
                app.getAppliedAt(),
                app.getResume().getFileUrl(),
                mapInterview(app.getInterview())
        )).toList();
    }

    @Override
    @Transactional
    public ApplicationResponseDto updateApplicationStatus(UserPrincipal principal, UUID applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (!application.getJob().getRecruiter().getUser().getId().equals(principal.getId())) {
            throw new ForbiddenOperationException("You do not have permission to update this application");
        }

        application.setStatus(status);
        Application saved = applicationRepository.save(application);
        log.info("Application {} status updated to {}", applicationId, status);

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public InterviewDetailsDto scheduleInterview(UserPrincipal principal, UUID applicationId, ScheduleInterviewRequestDto request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        if (!application.getJob().getRecruiter().getUser().getId().equals(principal.getId())) {
            throw new ForbiddenOperationException("You do not have permission to schedule an interview for this application");
        }

        Interview interview = interviewRepository.findByApplicationId(applicationId)
                .orElse(Interview.builder().application(application).build());

        interview.setScheduledTime(request.scheduledTime());
        interview.setMode(request.mode());
        interview.setStatus(InterviewStatus.SCHEDULED);
        interview.setNotes(request.notes());

        Interview savedInterview = interviewRepository.save(interview);

        // State Machine auto-transition to INTERVIEW_SCHEDULED
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        log.info("Scheduled interview {} for application {}", savedInterview.getId(), applicationId);

        return mapInterview(savedInterview);
    }

    private ApplicationResponseDto mapToDto(Application app) {
        return new ApplicationResponseDto(
                app.getId(),
                app.getJob().getId(),
                app.getJob().getTitle(),
                app.getJob().getRecruiter().getCompanyName(),
                app.getJob().getRoleCategory(),
                app.getMatchScore(),
                app.getMatchedSkills(),
                app.getMissingSkills(),
                app.getStatus(),
                app.getAppliedAt(),
                mapInterview(app.getInterview())
        );
    }

    private InterviewDetailsDto mapInterview(Interview interview) {
        if (interview == null) return null;
        return new InterviewDetailsDto(
                interview.getId(),
                interview.getScheduledTime(),
                interview.getMode(),
                interview.getStatus(),
                interview.getNotes()
        );
    }
}

