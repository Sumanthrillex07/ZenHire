package com.zenhire.job.service;

import com.zenhire.common.dto.PageResponse;
import com.zenhire.job.dto.CreateJobRequestDto;
import com.zenhire.job.dto.JobResponseDto;
import com.zenhire.job.entity.JobStatus;
import com.zenhire.job.entity.RoleCategory;
import com.zenhire.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Service contract for managing job requisitions and candidate search queries.
 */
public interface JobService {

    JobResponseDto createJob(UserPrincipal principal, CreateJobRequestDto request);

    PageResponse<JobResponseDto> getJobs(RoleCategory category, String search, Pageable pageable);

    JobResponseDto getJobById(UUID jobId);

    JobResponseDto updateJobStatus(UserPrincipal principal, UUID jobId, JobStatus newStatus);

    List<JobResponseDto> getRecruiterJobs(UserPrincipal principal);
}

