package com.zenhire.job.service.impl;

import com.zenhire.common.dto.PageResponse;
import com.zenhire.common.exception.ForbiddenOperationException;
import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.job.dto.CreateJobRequestDto;
import com.zenhire.job.dto.JobResponseDto;
import com.zenhire.job.entity.Job;
import com.zenhire.job.entity.JobStatus;
import com.zenhire.job.entity.RoleCategory;
import com.zenhire.job.repository.JobRepository;
import com.zenhire.job.service.JobService;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Recruiter;
import com.zenhire.user.repository.RecruiterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final RecruiterRepository recruiterRepository;

    @Override
    @Transactional
    public JobResponseDto createJob(UserPrincipal principal, CreateJobRequestDto request) {
        Recruiter recruiter = recruiterRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile", "userId", principal.getId()));

        List<String> cleanedSkills = request.requiredSkills().stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .toList();

        Job job = Job.builder()
                .recruiter(recruiter)
                .title(request.title().trim())
                .description(request.description().trim())
                .requiredSkills(cleanedSkills)
                .roleCategory(request.roleCategory())
                .status(JobStatus.OPEN)
                .build();

        Job saved = jobRepository.save(job);
        log.info("Job requisition created successfully [ID: {}, Title: '{}'] by recruiter: {}",
                saved.getId(), saved.getTitle(), recruiter.getId());

        return mapToDto(saved, 0L);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<JobResponseDto> getJobs(RoleCategory category, String search, Pageable pageable) {
        String sanitizedSearch = StringUtils.hasText(search) ? search.trim() : null;

        Page<Job> jobPage = jobRepository.searchJobs(JobStatus.OPEN, category, sanitizedSearch, pageable);

        List<JobResponseDto> dtoList = jobPage.getContent().stream()
                .map(job -> mapToDto(job, 0L))
                .toList();

        return PageResponse.of(jobPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponseDto getJobById(UUID jobId) {
        Job job = jobRepository.findWithRecruiterById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        return mapToDto(job, 0L);
    }

    @Override
    @Transactional
    public JobResponseDto updateJobStatus(UserPrincipal principal, UUID jobId, JobStatus newStatus) {
        Job job = jobRepository.findWithRecruiterById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        if (!job.getRecruiter().getUser().getId().equals(principal.getId())) {
            throw new ForbiddenOperationException("You do not have permission to modify job " + jobId);
        }

        job.setStatus(newStatus);
        Job saved = jobRepository.save(job);
        log.info("Updated status of job {} to {}", jobId, newStatus);

        return mapToDto(saved, 0L);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponseDto> getRecruiterJobs(UserPrincipal principal) {
        Recruiter recruiter = recruiterRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile", "userId", principal.getId()));

        return jobRepository.findAllByRecruiterIdOrderByCreatedAtDesc(recruiter.getId()).stream()
                .map(job -> mapToDto(job, 0L))
                .toList();
    }

    private JobResponseDto mapToDto(Job job, long applicantsCount) {
        return new JobResponseDto(
                job.getId(),
                job.getRecruiter().getId(),
                job.getRecruiter().getCompanyName(),
                job.getTitle(),
                job.getDescription(),
                job.getRequiredSkills(),
                job.getRoleCategory(),
                job.getStatus(),
                applicantsCount,
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }
}
