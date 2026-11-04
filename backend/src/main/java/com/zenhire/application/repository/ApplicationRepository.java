package com.zenhire.application.repository;

import com.zenhire.application.entity.Application;
import com.zenhire.application.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    boolean existsByCandidateIdAndJobId(UUID candidateId, UUID jobId);

    Optional<Application> findByCandidateIdAndJobId(UUID candidateId, UUID jobId);

    @EntityGraph(attributePaths = {"job", "job.recruiter", "interview"})
    List<Application> findAllByCandidateIdOrderByAppliedAtDesc(UUID candidateId);

    long countByCandidateId(UUID candidateId);

    @EntityGraph(attributePaths = {"candidate", "candidate.user", "resume", "interview"})
    List<Application> findAllByJobIdOrderByMatchScoreDesc(UUID jobId);

    @EntityGraph(attributePaths = {"candidate", "candidate.user", "resume", "interview"})
    List<Application> findAllByJobIdOrderByAppliedAtDesc(UUID jobId);

    long countByJobRecruiterId(UUID recruiterId);

    long countByJobRecruiterIdAndStatus(UUID recruiterId, ApplicationStatus status);

    @EntityGraph(attributePaths = {"candidate", "candidate.user", "job"})
    List<Application> findTop5ByJobRecruiterIdOrderByMatchScoreDesc(UUID recruiterId);

    long countByJobId(UUID jobId);
}

