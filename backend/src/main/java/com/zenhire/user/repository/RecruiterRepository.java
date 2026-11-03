package com.zenhire.user.repository;

import com.zenhire.user.entity.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecruiterRepository extends JpaRepository<Recruiter, UUID> {

    Optional<Recruiter> findByUserId(UUID userId);
}

