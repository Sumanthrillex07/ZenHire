package com.zenhire.job.repository;

import com.zenhire.job.entity.Job;
import com.zenhire.job.entity.JobStatus;
import com.zenhire.job.entity.RoleCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    @EntityGraph(attributePaths = {"recruiter"})
    Optional<Job> findWithRecruiterById(UUID id);

    @EntityGraph(attributePaths = {"recruiter"})
    @Query("SELECT j FROM Job j " +
           "WHERE j.status = :status " +
           "AND (:category IS NULL OR j.roleCategory = :category) " +
           "AND (:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(j.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Job> searchJobs(
            @Param("status") JobStatus status,
            @Param("category") RoleCategory category,
            @Param("search") String search,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"recruiter"})
    List<Job> findAllByRecruiterIdOrderByCreatedAtDesc(UUID recruiterId);

    long countByRecruiterIdAndStatus(UUID recruiterId, JobStatus status);

    long countByRecruiterId(UUID recruiterId);
}

