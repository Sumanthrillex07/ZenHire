package com.zenhire.application.entity;

import com.zenhire.assessment.entity.TestAttempt;
import com.zenhire.job.entity.Job;
import com.zenhire.resume.entity.Resume;
import com.zenhire.user.entity.Candidate;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Job application entity linking candidate, job requisition, gate test attempt, and match score.
 */
@Entity
@Table(
        name = "applications",
        uniqueConstraints = @UniqueConstraint(name = "uq_candidate_job", columnNames = {"candidate_id", "job_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gate_test_attempt_id", nullable = false)
    private TestAttempt gateTestAttempt;

    @Column(name = "match_score", nullable = false)
    private int matchScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "matched_skills", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private List<String> matchedSkills = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "missing_skills", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private List<String> missingSkills = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Interview interview;

    @CreationTimestamp
    @Column(name = "applied_at", nullable = false, updatable = false)
    private Instant appliedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

