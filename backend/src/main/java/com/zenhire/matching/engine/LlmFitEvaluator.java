package com.zenhire.matching.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.ai.client.GeminiApiClient;
import com.zenhire.job.entity.Job;
import com.zenhire.resume.entity.Resume;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * AI-powered qualitative narrative fit evaluator accounting for 40% of the hybrid match score.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LlmFitEvaluator {

    private final GeminiApiClient geminiApiClient;
    private final ObjectMapper objectMapper;

    public record LlmFitResult(int score, String reasoning) {}

    private static final String SYSTEM_INSTRUCTION = """
            You are an expert technical hiring manager. Compare the candidate's parsed qualifications against the job description and required skills. Evaluate the narrative depth of their experience, relevance of past roles, and technical maturity.
            Respond ONLY with a valid JSON object matching this exact structure:
            {
              "llmFitScore": integer between 0 and 100,
              "reasoning": "1 to 2 concise sentences explaining why you gave this score"
            }
            Do not include any markdown fences, preamble, or conversational commentary.
            """;

    /**
     * Evaluates qualitative candidate-job fit using Gemini 1.5 with deterministic fallback.
     */
    public LlmFitResult evaluateFit(
            Resume resume,
            Job job,
            int deterministicScore,
            List<String> matchedSkills,
            List<String> missingSkills
    ) {
        String userPrompt = String.format("""
                Candidate Qualifications:
                ""\"
                Skills: %s
                Experience: %s
                Education: %s
                ""\"
                
                Job Requisition:
                ""\"
                Title: %s
                Role Category: %s
                Required Skills: %s
                Description: %s
                ""\"
                """,
                resume.getParsedSkills(),
                resume.getParsedExperience() != null ? resume.getParsedExperience() : "Not specified",
                resume.getParsedEducation() != null ? resume.getParsedEducation() : "Not specified",
                job.getTitle(),
                job.getRoleCategory(),
                job.getRequiredSkills(),
                job.getDescription()
        );

        Optional<String> aiResponseOpt = geminiApiClient.generateContent(SYSTEM_INSTRUCTION, userPrompt);

        if (aiResponseOpt.isPresent()) {
            try {
                String jsonText = cleanJsonFences(aiResponseOpt.get());
                JsonNode root = objectMapper.readTree(jsonText);

                if (root.has("llmFitScore")) {
                    int score = root.get("llmFitScore").asInt();
                    score = Math.max(0, Math.min(100, score));
                    String reasoning = root.has("reasoning") ? root.get("reasoning").asText().trim() : "Evaluated by AI matching engine.";

                    log.info("Gemini evaluated candidate-job fit score: {} for job: {}", score, job.getId());
                    return new LlmFitResult(score, reasoning);
                }
            } catch (Exception ex) {
                log.warn("Failed to parse Gemini fit response: {}. Using deterministic fallback.", ex.getMessage());
            }
        }

        // Deterministic Fallback Logic
        String fallbackReasoning = String.format(
                "Candidate matches %d of %d required technical skills with relevant domain background.",
                matchedSkills.size(),
                job.getRequiredSkills().size()
        );
        log.info("Using deterministic fallback fit score: {}", deterministicScore);
        return new LlmFitResult(deterministicScore, fallbackReasoning);
    }

    private String cleanJsonFences(String raw) {
        String cleaned = raw.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }
}

