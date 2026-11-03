package com.zenhire.matching.service.impl;

import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.job.entity.Job;
import com.zenhire.job.repository.JobRepository;
import com.zenhire.matching.dto.MatchResultDto;
import com.zenhire.matching.engine.HybridMatchingEngine;
import com.zenhire.matching.service.MatchingService;
import com.zenhire.resume.entity.Resume;
import com.zenhire.resume.repository.ResumeRepository;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchingServiceImpl implements MatchingService {

    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final ResumeRepository resumeRepository;
    private final HybridMatchingEngine hybridMatchingEngine;

    @Override
    @Transactional(readOnly = true)
    public MatchResultDto calculateCandidateJobMatch(UserPrincipal principal, UUID jobId) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        Resume resume = resumeRepository.findByCandidateIdAndIsLatestTrue(candidate.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Active resume not found for candidate", "candidateId", candidate.getId()));

        Job job = jobRepository.findWithRecruiterById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        return hybridMatchingEngine.computeMatch(resume, job);
    }

    @Override
    public MatchResultDto calculateMatchForEntities(Resume resume, Job job) {
        return hybridMatchingEngine.computeMatch(resume, job);
    }
}

