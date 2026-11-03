package com.zenhire.matching.service;

import com.zenhire.job.entity.Job;
import com.zenhire.matching.dto.MatchResultDto;
import com.zenhire.resume.entity.Resume;
import com.zenhire.security.UserPrincipal;

import java.util.UUID;

/**
 * Service contract for calculating candidate-job compatibility scores and skill differentials.
 */
public interface MatchingService {

    MatchResultDto calculateCandidateJobMatch(UserPrincipal principal, UUID jobId);

    MatchResultDto calculateMatchForEntities(Resume resume, Job job);
}

