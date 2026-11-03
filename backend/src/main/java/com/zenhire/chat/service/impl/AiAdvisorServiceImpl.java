package com.zenhire.chat.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.ai.client.GeminiApiClient;
import com.zenhire.application.entity.Application;
import com.zenhire.application.repository.ApplicationRepository;
import com.zenhire.assessment.entity.TestAttempt;
import com.zenhire.assessment.repository.TestAttemptRepository;
import com.zenhire.chat.dto.ChatMessageDto;
import com.zenhire.chat.dto.ChatRequestDto;
import com.zenhire.chat.dto.ChatResponseDto;
import com.zenhire.chat.entity.ChatMessage;
import com.zenhire.chat.entity.MessageSender;
import com.zenhire.chat.repository.ChatMessageRepository;
import com.zenhire.chat.service.AiAdvisorService;
import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.resume.entity.Resume;
import com.zenhire.resume.repository.ResumeRepository;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAdvisorServiceImpl implements AiAdvisorService {

    private final ChatMessageRepository chatMessageRepository;
    private final CandidateRepository candidateRepository;
    private final ResumeRepository resumeRepository;
    private final ApplicationRepository applicationRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final GeminiApiClient geminiApiClient;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_INSTRUCTION = """
            You are ZenHire AI Career Guide, a friendly and professional career advisor talking directly to a job candidate.
            You are supplied with the candidate's verified profile data:
            - Parsed resume skills, experience, and education.
            - Candidate application statuses and target job titles.
            - Assessment tests they have attempted and passed.
            
            Rules:
            1. Answer questions professionally and encouragement-focused, based ONLY on the supplied candidate context.
            2. If the candidate asks questions outside their profile or applications (e.g. general trivia, salary negotiations for other companies, personal topics), politely explain that you are only authorized to assist with their ZenHire profile and application pipeline.
            3. Keep answers concise, actionable, and structured.
            4. Respond ONLY with a valid JSON object matching this shape:
            {
              "reply": "your conversational response string"
            }
            Do not include any markdown fences or commentary outside the JSON.
            """;

    @Override
    @Transactional
    public ChatResponseDto sendMessage(UserPrincipal principal, ChatRequestDto request) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        // 1. Persist the incoming candidate question
        ChatMessage userMessage = ChatMessage.builder()
                .candidate(candidate)
                .sender(MessageSender.CANDIDATE)
                .message(request.message().trim())
                .build();
        chatMessageRepository.save(userMessage);

        // 2. Assemble Candidate Verified Context
        Optional<Resume> resumeOpt = resumeRepository.findByCandidateIdAndIsLatestTrue(candidate.getId());
        List<Application> applications = applicationRepository.findAllByCandidateIdOrderByAppliedAtDesc(candidate.getId());
        List<TestAttempt> passedAttempts = testAttemptRepository.findAllByCandidateIdOrderByStartedAtDesc(candidate.getId())
                .stream().filter(TestAttempt::isPassed).toList();

        List<String> skills = resumeOpt.map(Resume::getParsedSkills).orElse(List.of());
        String experience = resumeOpt.map(Resume::getParsedExperience).orElse("No resume uploaded yet.");
        String education = resumeOpt.map(Resume::getParsedEducation).orElse("Not specified.");

        List<String> applicationSummaries = applications.stream()
                .map(a -> String.format("%s at %s (Status: %s, Match: %d%%)",
                        a.getJob().getTitle(), a.getJob().getRecruiter().getCompanyName(), a.getStatus(), a.getMatchScore()))
                .toList();

        List<String> passedTests = passedAttempts.stream()
                .map(t -> String.format("%s (Score: %d%%)", t.getTest().getTitle(), t.getScore()))
                .toList();

        // 3. Assemble Windowed History (last 20 messages)
        List<ChatMessage> recentMessages = chatMessageRepository.findTop20ByCandidateIdOrderByCreatedAtDesc(candidate.getId());
        Collections.reverse(recentMessages);

        StringBuilder historyBuilder = new StringBuilder();
        for (ChatMessage msg : recentMessages) {
            historyBuilder.append(msg.getSender().name()).append(": ").append(msg.getMessage()).append("\n");
        }

        String userPrompt = String.format("""
                Candidate Verified Context:
                Name: %s
                Skills: %s
                Experience: %s
                Education: %s
                Active Applications: %s
                Passed Assessments: %s
                
                Conversation History:
                %s
                
                Candidate's New Question:
                %s
                """,
                candidate.getUser().getName(),
                skills,
                experience,
                education,
                applicationSummaries,
                passedTests,
                historyBuilder,
                request.message().trim()
        );

        // 4. Invoke Gemini API with structured prompt
        String aiReplyText = executeAiOrFallback(userPrompt, candidate.getUser().getName(), skills, applicationSummaries);

        // 5. Persist the AI response
        ChatMessage aiMessage = ChatMessage.builder()
                .candidate(candidate)
                .sender(MessageSender.AI)
                .message(aiReplyText)
                .build();
        ChatMessage savedAi = chatMessageRepository.save(aiMessage);

        log.info("AI Career Advisor generated reply for candidate: {}", candidate.getId());
        return new ChatResponseDto(aiReplyText, mapToDto(savedAi));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatHistory(UserPrincipal principal) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        return chatMessageRepository.findAllByCandidateIdOrderByCreatedAtAsc(candidate.getId()).stream()
                .map(this::mapToDto)
                .toList();
    }

    private String executeAiOrFallback(String userPrompt, String name, List<String> skills, List<String> apps) {
        Optional<String> geminiResponse = geminiApiClient.generateContent(SYSTEM_INSTRUCTION, userPrompt);

        if (geminiResponse.isPresent()) {
            try {
                String cleanedJson = cleanJsonFences(geminiResponse.get());
                JsonNode root = objectMapper.readTree(cleanedJson);
                if (root.has("reply") && root.get("reply").isTextual()) {
                    return root.get("reply").asText().trim();
                }
            } catch (Exception ex) {
                log.warn("Failed to parse Gemini chat response as JSON: {}. Using fallback advisor.", ex.getMessage());
            }
        }

        // Deterministic Fallback Response
        if (skills.isEmpty()) {
            return String.format("Hello %s! I noticed you haven't uploaded a resume yet. To unlock AI job matching and skill assessments, please upload your resume in PDF format under the Resume tab.", name);
        } else if (apps.isEmpty()) {
            return String.format("Hello %s! Based on your skills in %s, you're in a great position to explore our open roles. Remember to complete the required category assessment test before applying!",
                    name, String.join(", ", skills.subList(0, Math.min(3, skills.size()))));
        } else {
            return String.format("Hello %s! You have %d active job applications in your pipeline. Make sure to review your target role skill requirements to maximize interview preparation.",
                    name, apps.size());
        }
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

    private ChatMessageDto mapToDto(ChatMessage msg) {
        return new ChatMessageDto(
                msg.getId(),
                msg.getSender(),
                msg.getMessage(),
                msg.getCreatedAt()
        );
    }
}

