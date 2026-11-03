package com.zenhire.assessment.entity;

import com.zenhire.job.entity.RoleCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Assessment definition representing a skill validation test.
 */
@Entity
@Table(name = "tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Test {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "test_type", nullable = false, length = 30)
    private TestType testType;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_category", length = 50)
    private RoleCategory roleCategory;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "pass_score", nullable = false)
    @Builder.Default
    private int passScore = 60;

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

