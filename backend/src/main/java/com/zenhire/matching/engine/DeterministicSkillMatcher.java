package com.zenhire.matching.engine;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Deterministic skill overlap evaluator accounting for 60% of the hybrid match score.
 */
@Slf4j
@Component
public class DeterministicSkillMatcher {

    public record SkillOverlapResult(
            int overlapScore,
            List<String> matchedSkills,
            List<String> missingSkills
    ) {}

    /**
     * Calculates the deterministic overlap between candidate skills and job requirements.
     *
     * @param candidateSkills Skills parsed from candidate's resume
     * @param requiredSkills Skills required by the job requisition
     * @return Overlap score (0-100) and categorized skill lists
     */
    public SkillOverlapResult calculateOverlap(List<String> candidateSkills, List<String> requiredSkills) {
        if (requiredSkills == null || requiredSkills.isEmpty()) {
            return new SkillOverlapResult(100, List.of(), List.of());
        }

        if (candidateSkills == null || candidateSkills.isEmpty()) {
            return new SkillOverlapResult(0, List.of(), new ArrayList<>(requiredSkills));
        }

        // Set of normalized candidate skills for fast case-insensitive lookup
        Set<String> normalizedCandidateSkills = new HashSet<>();
        for (String skill : candidateSkills) {
            normalizedCandidateSkills.add(normalize(skill));
        }

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String reqSkill : requiredSkills) {
            if (isSkillMatched(normalize(reqSkill), normalizedCandidateSkills)) {
                matched.add(reqSkill);
            } else {
                missing.add(reqSkill);
            }
        }

        int overlapScore = Math.round(((float) matched.size() / requiredSkills.size()) * 100);
        overlapScore = Math.max(0, Math.min(100, overlapScore));

        log.debug("Skill overlap calculation: {}/{} skills matched, score = {}",
                matched.size(), requiredSkills.size(), overlapScore);

        return new SkillOverlapResult(overlapScore, matched, missing);
    }

    private boolean isSkillMatched(String normalizedReq, Set<String> candidateSkills) {
        if (candidateSkills.contains(normalizedReq)) {
            return true;
        }
        // Substring / alias check (e.g. "postgresql" matches "postgres")
        for (String cand : candidateSkills) {
            if (cand.contains(normalizedReq) || normalizedReq.contains(cand)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String skill) {
        if (skill == null) return "";
        return skill.toLowerCase()
                .replaceAll("[^a-z0-9]", "")
                .trim();
    }
}

