package com.zenhire.resume.extractor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.ai.client.GeminiApiClient;
import com.zenhire.resume.dto.ParsedResumeData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * AI-powered resume extractor utilizing Google Gemini 1.5 Flash with deterministic fallback.
 */
@Slf4j
@Component
@Primary
@RequiredArgsConstructor
public class GeminiResumeExtractor implements ResumeExtractionStrategy {

    private final GeminiApiClient geminiApiClient;
    private final HeuristicResumeExtractor fallbackExtractor;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_INSTRUCTION = """
            You are an expert technical resume parser. Analyze the provided resume text and extract the candidate's technical skills, professional work experience summary, and educational background.
            Respond ONLY with a valid JSON object matching this exact structure:
            {
              "skills": ["string", "string"],
              "experience": "string summarizing total duration and key job roles",
              "education": "string summarizing degree, institution, and graduation year"
            }
            Do not include any markdown fences (e.g. ```json), XML tags, preamble, or commentary.
            """;

    @Override
    public ParsedResumeData extract(String rawText) {
        String userPrompt = "Resume Text:\n\"\"\"\n" + rawText + "\n\"\"\"";

        Optional<String> aiResponseOpt = geminiApiClient.generateContent(SYSTEM_INSTRUCTION, userPrompt);

        if (aiResponseOpt.isPresent()) {
            try {
                String jsonText = cleanJsonFences(aiResponseOpt.get());
                JsonNode root = objectMapper.readTree(jsonText);

                List<String> skills = new ArrayList<>();
                if (root.has("skills") && root.get("skills").isArray()) {
                    root.get("skills").forEach(skillNode -> skills.add(skillNode.asText().trim()));
                }

                String experience = root.has("experience") ? root.get("experience").asText().trim() : "";
                String education = root.has("education") ? root.get("education").asText().trim() : "";

                log.info("Gemini successfully extracted {} skills from resume", skills.size());
                return new ParsedResumeData(skills, experience, education);
            } catch (Exception ex) {
                log.warn("Failed to parse Gemini resume response as JSON: {}. Using heuristic fallback.", ex.getMessage());
            }
        }

        log.info("Executing heuristic resume extractor fallback");
        return fallbackExtractor.extract(rawText);
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

