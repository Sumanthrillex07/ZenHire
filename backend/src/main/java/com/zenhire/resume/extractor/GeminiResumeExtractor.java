package com.zenhire.resume.extractor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.ai.client.GeminiApiClient;
import com.zenhire.resume.dto.ParsedResumeData;
import com.zenhire.resume.dto.SkillProfileItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * AI-powered resume extractor utilizing Google Gemini 1.5 Flash with section matching,
 * skill taxonomy normalization, and evidence scoring.
 */
@Slf4j
@Component
@Primary
@RequiredArgsConstructor
public class GeminiResumeExtractor implements ResumeExtractionStrategy {

    private final GeminiApiClient geminiApiClient;
    private final HeuristicResumeExtractor fallbackExtractor;
    private final SkillTaxonomyService taxonomyService;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_INSTRUCTION = """
            You are an advanced recruitment intelligence system and technical resume analyzer.
            Perform deep extraction on the provided resume text across 5 canonical sections:
            1. Skills
            2. Experience
            3. Projects
            4. Education
            5. Certifications

            Extract all technical skills mentioned in the Skills section as well as contextual evidence in Experience, Projects, Education, and Certifications.
            Normalize all skills (e.g., K8s -> Kubernetes, Postgres -> PostgreSQL, ReactJS -> React).
            For each skill, evaluate:
            - name: Canonical skill name
            - category: One of [LANGUAGES, BACKEND, FRONTEND, DATABASES, CLOUD_DEVOPS, ARCHITECTURE, TESTING_TOOLS, AI_ML, OTHER]
            - confidence: Float from 0.50 to 1.00 based on presence in dedicated skills section + project/experience evidence
            - recency: One of [CURRENT, RECENT, HISTORICAL] based on the years or latest job role
            - sourceSections: Array of sections where found, e.g. ["SKILLS", "EXPERIENCE", "PROJECTS"]
            - evidenceSnippet: Concrete excerpt or quote showing how the skill was utilized

            Respond ONLY with a valid JSON object matching this exact structure:
            {
              "sections": {
                "skills": "text summary of skills section",
                "experience": "text summary of professional experience",
                "projects": "text summary of key projects",
                "education": "text summary of academic degrees",
                "certifications": "text summary of certifications"
              },
              "skillProfile": [
                {
                  "name": "Spring Boot",
                  "category": "BACKEND",
                  "confidence": 0.95,
                  "recency": "CURRENT",
                  "sourceSections": ["SKILLS", "EXPERIENCE"],
                  "evidenceSnippet": "Built high-throughput REST APIs using Spring Boot and JPA"
                }
              ]
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

                Map<String, String> sectionsMap = new HashMap<>();
                if (root.has("sections") && root.get("sections").isObject()) {
                    JsonNode secNode = root.get("sections");
                    secNode.fieldNames().forEachRemaining(field ->
                            sectionsMap.put(field.toUpperCase(), secNode.get(field).asText().trim())
                    );
                }

                String experience = sectionsMap.getOrDefault("EXPERIENCE", "");
                String education = sectionsMap.getOrDefault("EDUCATION", "");
                String projects = sectionsMap.getOrDefault("PROJECTS", "");
                String certifications = sectionsMap.getOrDefault("CERTIFICATIONS", "");

                List<SkillProfileItem> skillProfile = new ArrayList<>();
                Set<String> canonicalSkillsSet = new LinkedHashSet<>();

                if (root.has("skillProfile") && root.get("skillProfile").isArray()) {
                    for (JsonNode item : root.get("skillProfile")) {
                        String rawName = item.has("name") ? item.get("name").asText().trim() : "";
                        if (rawName.isBlank()) continue;

                        String canonicalName = taxonomyService.normalize(rawName);
                        String category = item.has("category") ? item.get("category").asText().trim() : taxonomyService.getCategory(canonicalName);
                        double confidence = item.has("confidence") ? item.get("confidence").asDouble(0.80) : 0.80;
                        String recency = item.has("recency") ? item.get("recency").asText().trim() : "RECENT";
                        String evidence = item.has("evidenceSnippet") ? item.get("evidenceSnippet").asText().trim() : "";

                        List<String> sourceSections = new ArrayList<>();
                        if (item.has("sourceSections") && item.get("sourceSections").isArray()) {
                            item.get("sourceSections").forEach(s -> sourceSections.add(s.asText().toUpperCase()));
                        }
                        if (sourceSections.isEmpty()) {
                            sourceSections.add("SKILLS");
                        }

                        skillProfile.add(new SkillProfileItem(
                                canonicalName,
                                category,
                                confidence,
                                recency,
                                sourceSections,
                                evidence
                        ));
                        canonicalSkillsSet.add(canonicalName);
                    }
                }

                // If Gemini extracted zero skills or structure was empty, trigger fallback
                if (!canonicalSkillsSet.isEmpty()) {
                    skillProfile.sort(Comparator.comparingDouble(SkillProfileItem::confidence).reversed());
                    log.info("Gemini successfully extracted {} validated skills with section evidence", skillProfile.size());

                    return new ParsedResumeData(
                            new ArrayList<>(canonicalSkillsSet),
                            experience,
                            education,
                            projects,
                            certifications,
                            sectionsMap,
                            skillProfile
                    );
                }
            } catch (Exception ex) {
                log.warn("Failed to parse Gemini resume response as JSON: {}. Executing heuristic fallback.", ex.getMessage());
            }
        }

        log.info("Executing NLP & heuristic section-matching fallback");
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
