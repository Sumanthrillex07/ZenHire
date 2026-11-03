package com.zenhire.user.repository;

import com.zenhire.user.entity.Candidate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID> {

    @EntityGraph(attributePaths = {"user"})
    Optional<Candidate> findByUserId(UUID userId);
}

