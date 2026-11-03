package com.zenhire.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.chat.controller.AiChatController;
import com.zenhire.chat.dto.ChatMessageDto;
import com.zenhire.chat.dto.ChatRequestDto;
import com.zenhire.chat.dto.ChatResponseDto;
import com.zenhire.chat.entity.MessageSender;
import com.zenhire.chat.service.AiAdvisorService;
import com.zenhire.security.CustomUserDetailsService;
import com.zenhire.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiChatController.class)
@AutoConfigureMockMvc(addFilters = false)
class AiChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AiAdvisorService aiAdvisorService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/v1/chat - 200 OK")
    void shouldSendMessage() throws Exception {
        ChatRequestDto request = new ChatRequestDto("What should I prepare for interview?");
        ChatMessageDto aiMsg = new ChatMessageDto(
                UUID.randomUUID(), MessageSender.AI, "Review your Spring Boot projects.", Instant.now()
        );
        ChatResponseDto responseDto = new ChatResponseDto("Review your Spring Boot projects.", aiMsg);

        when(aiAdvisorService.sendMessage(any(), any())).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reply").value("Review your Spring Boot projects."))
                .andExpect(jsonPath("$.data.aiMessage.sender").value("AI"));
    }

    @Test
    @DisplayName("GET /api/v1/chat/history - 200 OK")
    void shouldGetChatHistory() throws Exception {
        ChatMessageDto msg = new ChatMessageDto(
                UUID.randomUUID(), MessageSender.CANDIDATE, "Hello AI", Instant.now()
        );

        when(aiAdvisorService.getChatHistory(any())).thenReturn(List.of(msg));

        mockMvc.perform(get("/api/v1/chat/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].message").value("Hello AI"))
                .andExpect(jsonPath("$.data[0].sender").value("CANDIDATE"));
    }
}

