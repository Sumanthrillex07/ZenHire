package com.zenhire.assessment.repository;

import com.zenhire.assessment.entity.TestAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TestAnswerRepository extends JpaRepository<TestAnswer, UUID> {

    List<TestAnswer> findAllByAttemptId(UUID attemptId);

    List<TestAnswer> findAllByAttemptCandidateId(UUID candidateId);
}
