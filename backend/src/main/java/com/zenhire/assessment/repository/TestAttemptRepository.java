package com.zenhire.assessment.repository;

import com.zenhire.assessment.entity.TestAttempt;
import com.zenhire.job.entity.RoleCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, UUID> {

    Optional<TestAttempt> findFirstByCandidateIdAndTestIdAndPassedTrueOrderByScoreDesc(UUID candidateId, UUID testId);

    List<TestAttempt> findAllByCandidateIdOrderByStartedAtDesc(UUID candidateId);

    Optional<TestAttempt> findTopByCandidateIdAndTestIdOrderByScoreDesc(UUID candidateId, UUID testId);

    boolean existsByCandidateIdAndTestRoleCategoryAndPassedTrue(UUID candidateId, RoleCategory roleCategory);
}
