package com.zenhire.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.ai.client.GeminiApiClient;
import com.zenhire.application.repository.ApplicationRepository;
import com.zenhire.assessment.repository.TestAttemptRepository;
import com.zenhire.chat.dto.ChatRequestDto;
import com.zenhire.chat.dto.ChatResponseDto;
import com.zenhire.chat.entity.ChatMessage;
import com.zenhire.chat.entity.MessageSender;
import com.zenhire.chat.repository.ChatMessageRepository;
import com.zenhire.chat.service.impl.AiAdvisorServiceImpl;
import com.zenhire.resume.entity.Resume;
import com.zenhire.resume.repository.ResumeRepository;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.entity.Role;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.CandidateRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiAdvisorServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private TestAttemptRepository testAttemptRepository;

    @Mock
    private GeminiApiClient geminiApiClient;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AiAdvisorServiceImpl aiAdvisorService;

    @Test
    @DisplayName("Should successfully send message and return AI reply")
    void shouldSendMessageAndReturnAiReply() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, candidateId, null, List.of()
        );

        User user = User.builder().id(userId).name("Jane Doe").email("jane@example.com").build();
        Candidate candidate = Candidate.builder().id(candidateId).user(user).build();
        Resume resume = Resume.builder().candidate(candidate).parsedSkills(List.of("Java", "Spring Boot")).build();

        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.of(candidate));
        when(resumeRepository.findByCandidateIdAndIsLatestTrue(candidateId)).thenReturn(Optional.of(resume));
        when(applicationRepository.findAllByCandidateIdOrderByAppliedAtDesc(candidateId)).thenReturn(List.of());
        when(testAttemptRepository.findAllByCandidateIdOrderByStartedAtDesc(candidateId)).thenReturn(List.of());
        when(chatMessageRepository.findTop20ByCandidateIdOrderByCreatedAtDesc(candidateId)).thenReturn(List.of());

        // Simulate Gemini unconfigured/fallback
        when(geminiApiClient.generateContent(any(), any())).thenReturn(Optional.empty());

        ChatMessage savedAiMessage = ChatMessage.builder()
                .id(UUID.randomUUID())
                .candidate(candidate)
                .sender(MessageSender.AI)
                .message("Hello Jane Doe! Based on your skills in Java, Spring Boot, you're in a great position...")
                .createdAt(Instant.now())
                .build();
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(savedAiMessage);

        ChatRequestDto request = new ChatRequestDto("How can I improve my backend match score?");
        ChatResponseDto response = aiAdvisorService.sendMessage(principal, request);

        assertThat(response.reply()).contains("Jane Doe");
        verify(chatMessageRepository, times(2)).save(any(ChatMessage.class)); // 1 for user, 1 for AI
    }
}

