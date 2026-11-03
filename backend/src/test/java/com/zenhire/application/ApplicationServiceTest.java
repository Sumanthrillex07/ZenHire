package com.zenhire.application;

import com.zenhire.application.dto.ApplicationResponseDto;
import com.zenhire.application.dto.InterviewDetailsDto;
import com.zenhire.application.dto.ScheduleInterviewRequestDto;
import com.zenhire.application.entity.Application;
import com.zenhire.application.entity.ApplicationStatus;
import com.zenhire.application.entity.Interview;
import com.zenhire.application.entity.InterviewMode;
import com.zenhire.application.repository.ApplicationRepository;
import com.zenhire.application.repository.InterviewRepository;
import com.zenhire.application.service.impl.ApplicationServiceImpl;
import com.zenhire.assessment.entity.TestAttempt;
import com.zenhire.assessment.repository.TestAttemptRepository;
import com.zenhire.assessment.repository.TestRepository;
import com.zenhire.common.exception.AssessmentGatingException;
import com.zenhire.common.exception.DuplicateResourceException;
import com.zenhire.common.exception.ForbiddenOperationException;
import com.zenhire.job.entity.Job;
import com.zenhire.job.entity.RoleCategory;
import com.zenhire.job.repository.JobRepository;
import com.zenhire.matching.dto.MatchResultDto;
import com.zenhire.matching.service.MatchingService;
import com.zenhire.resume.entity.Resume;
import com.zenhire.resume.repository.ResumeRepository;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.entity.Recruiter;
import com.zenhire.user.entity.Role;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.CandidateRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private TestRepository testRepository;

    @Mock
    private TestAttemptRepository testAttemptRepository;

    @Mock
    private MatchingService matchingService;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    @Test
    @DisplayName("Should block application with AssessmentGatingException when candidate has not passed gating test")
    void shouldBlockApplicationWhenGatingTestNotPassed() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();
        UUID testId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, candidateId, null, List.of()
        );

        Candidate candidate = Candidate.builder().id(candidateId).build();
        Resume resume = Resume.builder().id(UUID.randomUUID()).candidate(candidate).build();
        Job job = Job.builder().id(jobId).roleCategory(RoleCategory.BACKEND).build();
        com.zenhire.assessment.entity.Test gateTest = com.zenhire.assessment.entity.Test.builder()
                .id(testId)
                .roleCategory(RoleCategory.BACKEND)
                .build();

        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.of(candidate));
        when(resumeRepository.findByCandidateIdAndIsLatestTrue(candidateId)).thenReturn(Optional.of(resume));
        when(applicationRepository.existsByCandidateIdAndJobId(candidateId, jobId)).thenReturn(false);
        when(jobRepository.findWithRecruiterById(jobId)).thenReturn(Optional.of(job));
        when(testRepository.findByRoleCategory(RoleCategory.BACKEND)).thenReturn(Optional.of(gateTest));
        when(testAttemptRepository.findFirstByCandidateIdAndTestIdAndPassedTrueOrderByScoreDesc(candidateId, testId))
                .thenReturn(Optional.empty()); // No passing attempt!

        assertThatThrownBy(() -> applicationService.applyForJob(principal, jobId))
                .isInstanceOf(AssessmentGatingException.class);
    }

    @Test
    @DisplayName("Should successfully apply when candidate has passed category gating assessment")
    void shouldApplyWhenGatingPassed() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();
        UUID testId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, candidateId, null, List.of()
        );

        Candidate candidate = Candidate.builder().id(candidateId).build();
        Resume resume = Resume.builder().id(UUID.randomUUID()).candidate(candidate).build();

        Recruiter recruiter = Recruiter.builder().id(UUID.randomUUID()).companyName("Acme").build();
        Job job = Job.builder()
                .id(jobId)
                .recruiter(recruiter)
                .title("Backend Eng")
                .roleCategory(RoleCategory.BACKEND)
                .build();

        com.zenhire.assessment.entity.Test gateTest = com.zenhire.assessment.entity.Test.builder()
                .id(testId)
                .roleCategory(RoleCategory.BACKEND)
                .build();

        TestAttempt passingAttempt = TestAttempt.builder()
                .id(UUID.randomUUID())
                .candidate(candidate)
                .test(gateTest)
                .score(85)
                .passed(true)
                .build();

        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.of(candidate));
        when(resumeRepository.findByCandidateIdAndIsLatestTrue(candidateId)).thenReturn(Optional.of(resume));
        when(applicationRepository.existsByCandidateIdAndJobId(candidateId, jobId)).thenReturn(false);
        when(jobRepository.findWithRecruiterById(jobId)).thenReturn(Optional.of(job));
        when(testRepository.findByRoleCategory(RoleCategory.BACKEND)).thenReturn(Optional.of(gateTest));
        when(testAttemptRepository.findFirstByCandidateIdAndTestIdAndPassedTrueOrderByScoreDesc(candidateId, testId))
                .thenReturn(Optional.of(passingAttempt));

        MatchResultDto match = new MatchResultDto(88, 90, 85, List.of("Java"), List.of(), "Great match");
        when(matchingService.calculateMatchForEntities(resume, job)).thenReturn(match);

        Application savedApp = Application.builder()
                .id(UUID.randomUUID())
                .candidate(candidate)
                .job(job)
                .resume(resume)
                .gateTestAttempt(passingAttempt)
                .matchScore(88)
                .matchedSkills(List.of("Java"))
                .missingSkills(List.of())
                .status(ApplicationStatus.APPLIED)
                .appliedAt(Instant.now())
                .build();

        when(applicationRepository.save(any(Application.class))).thenReturn(savedApp);

        ApplicationResponseDto response = applicationService.applyForJob(principal, jobId);

        assertThat(response.matchScore()).isEqualTo(88);
        assertThat(response.status()).isEqualTo(ApplicationStatus.APPLIED);
        verify(applicationRepository).save(any(Application.class));
    }

    @Test
    @DisplayName("Should prevent duplicate applications")
    void shouldPreventDuplicateApplication() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, candidateId, null, List.of()
        );

        Candidate candidate = Candidate.builder().id(candidateId).build();
        Resume resume = Resume.builder().id(UUID.randomUUID()).build();

        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.of(candidate));
        when(resumeRepository.findByCandidateIdAndIsLatestTrue(candidateId)).thenReturn(Optional.of(resume));
        when(applicationRepository.existsByCandidateIdAndJobId(candidateId, jobId)).thenReturn(true);

        assertThatThrownBy(() -> applicationService.applyForJob(principal, jobId))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already submitted an application");
    }

    @Test
    @DisplayName("Should schedule interview and transition application status to INTERVIEW_SCHEDULED")
    void shouldScheduleInterview() {
        UUID recruiterUserId = UUID.randomUUID();
        UUID applicationId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                recruiterUserId, "Recruiter", "rec@company.com", "pass",
                Role.ROLE_RECRUITER, null, UUID.randomUUID(), List.of()
        );

        User recruiterUser = User.builder().id(recruiterUserId).build();
        Recruiter recruiter = Recruiter.builder().user(recruiterUser).build();
        Job job = Job.builder().recruiter(recruiter).build();
        Application application = Application.builder()
                .id(applicationId)
                .job(job)
                .status(ApplicationStatus.SHORTLISTED)
                .build();

        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        when(interviewRepository.findByApplicationId(applicationId)).thenReturn(Optional.empty());

        Interview savedInterview = Interview.builder()
                .id(UUID.randomUUID())
                .application(application)
                .scheduledTime(Instant.now().plusSeconds(86400))
                .mode(InterviewMode.ONLINE)
                .notes("Technical interview")
                .build();
        when(interviewRepository.save(any(Interview.class))).thenReturn(savedInterview);

        ScheduleInterviewRequestDto request = new ScheduleInterviewRequestDto(
                Instant.now().plusSeconds(86400), InterviewMode.ONLINE, "Technical interview"
        );

        InterviewDetailsDto result = applicationService.scheduleInterview(principal, applicationId, request);

        assertThat(result.mode()).isEqualTo(InterviewMode.ONLINE);
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.INTERVIEW_SCHEDULED);
        verify(applicationRepository).save(application);
    }
}
