package com.zenhire.matching;

import com.zenhire.matching.engine.DeterministicSkillMatcher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DeterministicSkillMatcherTest {

    private final DeterministicSkillMatcher matcher = new DeterministicSkillMatcher();

    @Test
    @DisplayName("Should return 100% when all required skills match")
    void shouldReturn100PercentOnFullMatch() {
        List<String> candidateSkills = List.of("Java", "Spring Boot", "PostgreSQL", "Docker");
        List<String> requiredSkills = List.of("java", "spring boot", "postgresql");

        var result = matcher.calculateOverlap(candidateSkills, requiredSkills);

        assertThat(result.overlapScore()).isEqualTo(100);
        assertThat(result.matchedSkills()).hasSize(3);
        assertThat(result.missingSkills()).isEmpty();
    }

    @Test
    @DisplayName("Should calculate partial overlap correctly")
    void shouldCalculatePartialOverlap() {
        List<String> candidateSkills = List.of("Java", "React");
        List<String> requiredSkills = List.of("Java", "Spring Boot", "Docker", "Kubernetes");

        var result = matcher.calculateOverlap(candidateSkills, requiredSkills);

        // 1 of 4 matched = 25%
        assertThat(result.overlapScore()).isEqualTo(25);
        assertThat(result.matchedSkills()).containsExactly("Java");
        assertThat(result.missingSkills()).containsExactly("Spring Boot", "Docker", "Kubernetes");
    }

    @Test
    @DisplayName("Should return 0% when candidate has no matching skills")
    void shouldReturn0OnNoMatch() {
        List<String> candidateSkills = List.of("PHP", "Laravel");
        List<String> requiredSkills = List.of("Python", "Django");

        var result = matcher.calculateOverlap(candidateSkills, requiredSkills);

        assertThat(result.overlapScore()).isEqualTo(0);
        assertThat(result.matchedSkills()).isEmpty();
        assertThat(result.missingSkills()).hasSize(2);
    }

    @Test
    @DisplayName("Should normalize casing and special characters")
    void shouldNormalizeSkills() {
        List<String> candidateSkills = List.of("Node-JS", "TailwindCSS");
        List<String> requiredSkills = List.of("Node.js", "Tailwind CSS");

        var result = matcher.calculateOverlap(candidateSkills, requiredSkills);

        assertThat(result.overlapScore()).isEqualTo(100);
        assertThat(result.matchedSkills()).hasSize(2);
    }
}

