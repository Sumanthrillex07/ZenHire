package com.zenhire.job;

import com.zenhire.common.dto.PageResponse;
import com.zenhire.common.exception.ForbiddenOperationException;
import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.job.dto.CreateJobRequestDto;
import com.zenhire.job.dto.JobResponseDto;
import com.zenhire.job.entity.Job;
import com.zenhire.job.entity.JobStatus;
import com.zenhire.job.entity.RoleCategory;
import com.zenhire.job.repository.JobRepository;
import com.zenhire.job.service.impl.JobServiceImpl;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Recruiter;
import com.zenhire.user.entity.Role;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.RecruiterRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private RecruiterRepository recruiterRepository;

    @Mock
    private com.zenhire.application.repository.ApplicationRepository applicationRepository;

    @InjectMocks
    private JobServiceImpl jobService;

    @Test
    @DisplayName("Should successfully create a job posting")
    void shouldCreateJob() {
        UUID userId = UUID.randomUUID();
        UUID recruiterId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Recruiter", "rec@company.com", "pass",
                Role.ROLE_RECRUITER, null, recruiterId, List.of()
        );

        User user = User.builder().id(userId).name("Recruiter").email("rec@company.com").build();
        Recruiter recruiter = Recruiter.builder().id(recruiterId).user(user).companyName("Acme Corp").build();

        when(recruiterRepository.findByUserId(userId)).thenReturn(Optional.of(recruiter));

        CreateJobRequestDto request = new CreateJobRequestDto(
                "Senior Java Engineer",
                "Build cloud microservices",
                List.of("Java", "Spring Boot", "PostgreSQL"),
                RoleCategory.BACKEND
        );

        Job savedJob = Job.builder()
                .id(UUID.randomUUID())
                .recruiter(recruiter)
                .title(request.title())
                .description(request.description())
                .requiredSkills(request.requiredSkills())
                .roleCategory(request.roleCategory())
                .status(JobStatus.OPEN)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(jobRepository.save(any(Job.class))).thenReturn(savedJob);

        JobResponseDto response = jobService.createJob(principal, request);

        assertThat(response.title()).isEqualTo("Senior Java Engineer");
        assertThat(response.companyName()).isEqualTo("Acme Corp");
        assertThat(response.roleCategory()).isEqualTo(RoleCategory.BACKEND);
        assertThat(response.status()).isEqualTo(JobStatus.OPEN);
        verify(jobRepository, times(1)).save(any(Job.class));
    }

    @Test
    @DisplayName("Should retrieve jobs with filtering and pagination")
    void shouldGetJobs() {
        UUID recruiterId = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).name("Recruiter").email("rec@company.com").build();
        Recruiter recruiter = Recruiter.builder().id(recruiterId).user(user).companyName("Acme Corp").build();

        Job job = Job.builder()
                .id(UUID.randomUUID())
                .recruiter(recruiter)
                .title("Senior Java Engineer")
                .description("Build microservices")
                .requiredSkills(List.of("Java"))
                .roleCategory(RoleCategory.BACKEND)
                .status(JobStatus.OPEN)
                .createdAt(Instant.now())
                .build();

        Pageable pageable = PageRequest.of(0, 10);
        when(jobRepository.searchJobs(JobStatus.OPEN, RoleCategory.BACKEND, "Java", pageable))
                .thenReturn(new PageImpl<>(List.of(job), pageable, 1));

        PageResponse<JobResponseDto> result = jobService.getJobs(RoleCategory.BACKEND, "Java", pageable);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).title()).isEqualTo("Senior Java Engineer");
        assertThat(result.totalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should throw ForbiddenOperationException when non-owner updates job status")
    void shouldRejectStatusUpdateFromNonOwner() {
        UUID ownerUserId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();

        UserPrincipal otherPrincipal = new UserPrincipal(
                otherUserId, "Attacker", "hacker@evil.com", "pass",
                Role.ROLE_RECRUITER, null, UUID.randomUUID(), List.of()
        );

        User ownerUser = User.builder().id(ownerUserId).name("Legit").email("legit@company.com").build();
        Recruiter ownerRecruiter = Recruiter.builder().id(UUID.randomUUID()).user(ownerUser).companyName("Acme").build();

        Job job = Job.builder()
                .id(jobId)
                .recruiter(ownerRecruiter)
                .title("Job")
                .status(JobStatus.OPEN)
                .build();

        when(jobRepository.findWithRecruiterById(jobId)).thenReturn(Optional.of(job));

        assertThatThrownBy(() -> jobService.updateJobStatus(otherPrincipal, jobId, JobStatus.CLOSED))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessageContaining("You do not have permission to modify job");
    }
}

