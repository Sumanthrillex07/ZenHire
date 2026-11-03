package com.zenhire.resume.repository;

import com.zenhire.resume.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {

    Optional<Resume> findByCandidateIdAndIsLatestTrue(UUID candidateId);

    List<Resume> findAllByCandidateIdOrderByUploadedAtDesc(UUID candidateId);

    boolean existsByCandidateId(UUID candidateId);

    @Modifying
    @Query("UPDATE Resume r SET r.isLatest = false WHERE r.candidate.id = :candidateId")
    void markOldResumesNotLatest(@Param("candidateId") UUID candidateId);
}
