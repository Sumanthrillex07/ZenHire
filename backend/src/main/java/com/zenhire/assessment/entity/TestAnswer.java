package com.zenhire.assessment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Itemized candidate response recorded during an assessment attempt.
 */
@Entity
@Table(name = "test_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private TestAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "selected_index", nullable = false)
    private int selectedIndex;

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect;

    @Column(name = "topic_tag", nullable = false, length = 100)
    private String topicTag;
}
