package com.zenhire.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Non-blocking client wrapper for Google Gemini 1.5 Flash REST API.
 * Encapsulates structured prompt execution and automated fallback readiness.
 */
@Slf4j
@Component
public class GeminiApiClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final String baseUrl;

    public GeminiApiClient(
            WebClient webClient,
            ObjectMapper objectMapper,
            @Value("${ai.gemini.api-key:}") String apiKey,
            @Value("${ai.gemini.model:gemini-1.5-flash}") String model,
            @Value("${ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl
    ) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
    }

    /**
     * Executes a prompt against Gemini 1.5 Flash enforcing structured JSON output.
     *
     * @param systemInstruction Behavioral guidelines and schema specifications
     * @param userPrompt The domain content to analyze
     * @return Raw JSON response string from Gemini, or empty if unconfigured or error
     */
    public Optional<String> generateContent(String systemInstruction, String userPrompt) {
        if (!StringUtils.hasText(apiKey)) {
            log.info("Gemini API key is not configured; triggering deterministic fallback engine.");
            return Optional.empty();
        }

        try {
            String combinedText = systemInstruction + "\n\n" + userPrompt;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "role", "user",
                                    "parts", List.of(Map.of("text", combinedText))
                            )
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.2,
                            "responseMimeType", "application/json"
                    )
            );

            String responseString = webClient.post()
                    .uri(baseUrl + "/models/" + model + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (responseString == null) {
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(responseString);
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            if (textNode.isMissingNode() || !textNode.isTextual()) {
                log.warn("Gemini response missing text candidate part: {}", responseString);
                return Optional.empty();
            }

            return Optional.of(textNode.asText().trim());
        } catch (Exception ex) {
            log.warn("Gemini API invocation failed: {}. Falling back gracefully.", ex.getMessage());
            return Optional.empty();
        }
    }
}
