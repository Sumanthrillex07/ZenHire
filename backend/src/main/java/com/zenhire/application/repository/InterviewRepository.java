package com.zenhire.application.repository;

import com.zenhire.application.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, UUID> {

    Optional<Interview> findByApplicationId(UUID applicationId);
}

