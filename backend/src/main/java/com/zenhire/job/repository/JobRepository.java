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
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    @EntityGraph(attributePaths = {"recruiter"})
    Optional<Job> findWithRecruiterById(UUID id);

    @EntityGraph(attributePaths = {"recruiter"})
    Page<Job> findAllByStatus(JobStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"recruiter"})
    Page<Job> findAllByStatusAndRoleCategory(JobStatus status, RoleCategory roleCategory, Pageable pageable);

    @EntityGraph(attributePaths = {"recruiter"})
    @Query("SELECT j FROM Job j WHERE j.status = :status AND (LOWER(j.title) LIKE :pattern OR LOWER(j.description) LIKE :pattern)")
    Page<Job> searchJobsAll(
            @Param("status") JobStatus status,
            @Param("pattern") String pattern,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"recruiter"})
    @Query("SELECT j FROM Job j WHERE j.status = :status AND j.roleCategory = :category AND (LOWER(j.title) LIKE :pattern OR LOWER(j.description) LIKE :pattern)")
    Page<Job> searchJobsByCategory(
            @Param("status") JobStatus status,
            @Param("category") RoleCategory category,
            @Param("pattern") String pattern,
            Pageable pageable
    );

    default Page<Job> searchJobs(JobStatus status, RoleCategory category, String search, Pageable pageable) {
        if (StringUtils.hasText(search)) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            if (category != null) {
                return searchJobsByCategory(status, category, pattern, pageable);
            } else {
                return searchJobsAll(status, pattern, pageable);
            }
        } else {
            if (category != null) {
                return findAllByStatusAndRoleCategory(status, category, pageable);
            } else {
                return findAllByStatus(status, pageable);
            }
        }
    }

    @EntityGraph(attributePaths = {"recruiter"})
    List<Job> findAllByRecruiterIdOrderByCreatedAtDesc(UUID recruiterId);

    long countByRecruiterIdAndStatus(UUID recruiterId, JobStatus status);

    long countByRecruiterId(UUID recruiterId);
}

