package com.zenhire.matching;

import com.zenhire.job.entity.Job;
import com.zenhire.job.entity.RoleCategory;
import com.zenhire.matching.dto.MatchResultDto;
import com.zenhire.matching.engine.DeterministicSkillMatcher;
import com.zenhire.matching.engine.HybridMatchingEngine;
import com.zenhire.matching.engine.LlmFitEvaluator;
import com.zenhire.resume.entity.Resume;
import com.zenhire.user.entity.Candidate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HybridMatchingEngineTest {

    @Mock
    private DeterministicSkillMatcher skillMatcher;

    @Mock
    private LlmFitEvaluator llmFitEvaluator;

    @InjectMocks
    private HybridMatchingEngine hybridMatchingEngine;

    @Test
    @DisplayName("Should accurately compute 60/40 weighted formula: round(0.6 * 100 + 0.4 * 50) = 80")
    void shouldComputeWeightedFormula() {
        Candidate candidate = Candidate.builder().id(UUID.randomUUID()).build();
        Resume resume = Resume.builder()
                .candidate(candidate)
                .parsedSkills(List.of("Java", "Spring Boot"))
                .parsedExperience("3 yrs")
                .parsedEducation("B.S. CS")
                .build();

        Job job = Job.builder()
                .id(UUID.randomUUID())
                .title("Java Dev")
                .roleCategory(RoleCategory.BACKEND)
                .requiredSkills(List.of("Java", "Spring Boot"))
                .description("Build APIs")
                .build();

        when(skillMatcher.calculateOverlap(any(), any()))
                .thenReturn(new DeterministicSkillMatcher.SkillOverlapResult(100, List.of("Java", "Spring Boot"), List.of()));

        when(llmFitEvaluator.evaluateFit(any(), any(), eq(100), any(), any()))
                .thenReturn(new LlmFitEvaluator.LlmFitResult(50, "Good technical alignment."));

        MatchResultDto result = hybridMatchingEngine.computeMatch(resume, job);

        // 0.6 * 100 + 0.4 * 50 = 60 + 20 = 80
        assertThat(result.matchScore()).isEqualTo(80);
        assertThat(result.skillOverlapScore()).isEqualTo(100);
        assertThat(result.llmFitScore()).isEqualTo(50);
        assertThat(result.reasoning()).isEqualTo("Good technical alignment.");
    }

    @Test
    @DisplayName("Should accurately compute round(0.6 * 75 + 0.4 * 80) = 77")
    void shouldComputePartialWeightedScore() {
        Candidate candidate = Candidate.builder().id(UUID.randomUUID()).build();
        Resume resume = Resume.builder()
                .candidate(candidate)
                .parsedSkills(List.of("Java", "Spring Boot", "React"))
                .build();

        Job job = Job.builder()
                .id(UUID.randomUUID())
                .title("Full Stack")
                .roleCategory(RoleCategory.BACKEND)
                .requiredSkills(List.of("Java", "Spring Boot", "React", "Docker"))
                .description("Build full stack apps")
                .build();

        when(skillMatcher.calculateOverlap(any(), any()))
                .thenReturn(new DeterministicSkillMatcher.SkillOverlapResult(75, List.of("Java", "Spring Boot", "React"), List.of("Docker")));

        when(llmFitEvaluator.evaluateFit(any(), any(), eq(75), any(), any()))
                .thenReturn(new LlmFitEvaluator.LlmFitResult(80, "Solid experience in core languages."));

        MatchResultDto result = hybridMatchingEngine.computeMatch(resume, job);

        // 0.6 * 75 + 0.4 * 80 = 45 + 32 = 77
        assertThat(result.matchScore()).isEqualTo(77);
        assertThat(result.skillOverlapScore()).isEqualTo(75);
        assertThat(result.llmFitScore()).isEqualTo(80);
    }
}

