package com.zenhire.matching.engine;

import com.zenhire.job.entity.Job;
import com.zenhire.matching.dto.MatchResultDto;
import com.zenhire.resume.entity.Resume;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Orchestrator synthesizing deterministic skill overlap (60%) and LLM qualitative fit (40%).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HybridMatchingEngine {

    private final DeterministicSkillMatcher skillMatcher;
    private final LlmFitEvaluator llmFitEvaluator;

    /**
     * Executes the hybrid match calculation: finalScore = round(0.6 * skillScore + 0.4 * llmScore).
     *
     * @param resume The candidate's active resume
     * @param job The target job requisition
     * @return Complete structured match outcome
     */
    public MatchResultDto computeMatch(Resume resume, Job job) {
        DeterministicSkillMatcher.SkillOverlapResult overlapResult =
                skillMatcher.calculateOverlap(resume.getParsedSkills(), job.getRequiredSkills());

        LlmFitEvaluator.LlmFitResult llmResult = llmFitEvaluator.evaluateFit(
                resume,
                job,
                overlapResult.overlapScore(),
                overlapResult.matchedSkills(),
                overlapResult.missingSkills()
        );

        // Calculate weighted score
        int finalScore = Math.round(0.6f * overlapResult.overlapScore() + 0.4f * llmResult.score());
        finalScore = Math.max(0, Math.min(100, finalScore));

        log.info("Hybrid match computed for candidate {} against job {}: skillScore={}, llmScore={}, finalScore={}",
                resume.getCandidate().getId(), job.getId(), overlapResult.overlapScore(), llmResult.score(), finalScore);

        return new MatchResultDto(
                finalScore,
                overlapResult.overlapScore(),
                llmResult.score(),
                overlapResult.matchedSkills(),
                overlapResult.missingSkills(),
                llmResult.reasoning()
        );
    }
}

