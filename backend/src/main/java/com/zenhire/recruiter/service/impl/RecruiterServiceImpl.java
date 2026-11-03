package com.zenhire.recruiter.service.impl;

import com.zenhire.application.entity.Application;
import com.zenhire.application.entity.ApplicationStatus;
import com.zenhire.application.repository.ApplicationRepository;
import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.job.entity.Job;
import com.zenhire.job.entity.JobStatus;
import com.zenhire.job.repository.JobRepository;
import com.zenhire.recruiter.dto.*;
import com.zenhire.recruiter.service.RecruiterService;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Recruiter;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.RecruiterRepository;
import com.zenhire.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecruiterServiceImpl implements RecruiterService {

    private final RecruiterRepository recruiterRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    @Transactional(readOnly = true)
    public RecruiterProfileDto getProfile(UserPrincipal principal) {
        Recruiter recruiter = recruiterRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile", "userId", principal.getId()));

        return mapToDto(recruiter);
    }

    @Override
    @Transactional
    public RecruiterProfileDto updateProfile(UserPrincipal principal, RecruiterProfileUpdateDto updateDto) {
        Recruiter recruiter = recruiterRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile", "userId", principal.getId()));

        User user = recruiter.getUser();

        if (StringUtils.hasText(updateDto.name())) {
            user.setName(updateDto.name().trim());
            userRepository.save(user);
        }

        if (StringUtils.hasText(updateDto.companyName())) {
            recruiter.setCompanyName(updateDto.companyName().trim());
        }

        Recruiter saved = recruiterRepository.save(recruiter);
        log.info("Updated recruiter profile for userId: {}", principal.getId());
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RecruiterDashboardDto getDashboard(UserPrincipal principal) {
        Recruiter recruiter = recruiterRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile", "userId", principal.getId()));

        long openJobs = jobRepository.countByRecruiterIdAndStatus(recruiter.getId(), JobStatus.OPEN);
        long totalApplicants = applicationRepository.countByJobRecruiterId(recruiter.getId());
        long shortlisted = applicationRepository.countByJobRecruiterIdAndStatus(recruiter.getId(), ApplicationStatus.SHORTLISTED);

        List<Application> topApplications = applicationRepository.findTop5ByJobRecruiterIdOrderByMatchScoreDesc(recruiter.getId());
        List<TopScorerDto> topScorers = topApplications.stream().map(app -> new TopScorerDto(
                app.getId(),
                app.getCandidate().getUser().getName(),
                app.getJob().getTitle(),
                app.getMatchScore(),
                app.getStatus()
        )).toList();

        List<Job> recruiterJobs = jobRepository.findAllByRecruiterIdOrderByCreatedAtDesc(recruiter.getId());
        List<JobSummaryDto> jobSummaries = recruiterJobs.stream().map(job -> new JobSummaryDto(
                job.getId(),
                job.getTitle(),
                job.getRoleCategory(),
                job.getStatus(),
                job.getCreatedAt(),
                applicationRepository.countByJobId(job.getId())
        )).toList();

        return new RecruiterDashboardDto(openJobs, totalApplicants, shortlisted, topScorers, jobSummaries);
    }

    private RecruiterProfileDto mapToDto(Recruiter recruiter) {
        return new RecruiterProfileDto(
                recruiter.getId(),
                recruiter.getUser().getId(),
                recruiter.getUser().getName(),
                recruiter.getUser().getEmail(),
                recruiter.getCompanyName(),
                recruiter.getCreatedAt()
        );
    }
}

