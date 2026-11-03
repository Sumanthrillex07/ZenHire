package com.zenhire.resume.entity;

import com.zenhire.user.entity.Candidate;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing an uploaded and parsed candidate resume.
 */
@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "raw_text", nullable = false, columnDefinition = "TEXT")
    private String rawText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parsed_skills", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private List<String> parsedSkills = new ArrayList<>();

    @Column(name = "parsed_experience", columnDefinition = "TEXT")
    private String parsedExperience;

    @Column(name = "parsed_education", columnDefinition = "TEXT")
    private String parsedEducation;

    @Column(name = "is_latest", nullable = false)
    @Builder.Default
    private boolean isLatest = true;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;
}
