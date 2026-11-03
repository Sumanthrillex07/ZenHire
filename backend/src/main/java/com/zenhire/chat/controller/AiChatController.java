package com.zenhire.chat.controller;

import com.zenhire.chat.dto.ChatMessageDto;
import com.zenhire.chat.dto.ChatRequestDto;
import com.zenhire.chat.dto.ChatResponseDto;
import com.zenhire.chat.service.AiAdvisorService;
import com.zenhire.common.dto.ApiResponse;
import com.zenhire.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller exposing endpoints for context-grounded AI Career Advisor conversational assistance.
 */
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Tag(name = "AI Career Advisor", description = "Endpoints for conversational career guidance grounded in candidate profile")
public class AiChatController {

    private final AiAdvisorService aiAdvisorService;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Send a question to the AI Career Advisor and receive an individualized response")
    public ResponseEntity<ApiResponse<ChatResponseDto>> sendMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChatRequestDto request
    ) {
        ChatResponseDto response = aiAdvisorService.sendMessage(principal, request);
        return ResponseEntity.ok(ApiResponse.success("AI reply generated", response));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get conversation message history between candidate and AI Advisor")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> getChatHistory(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ChatMessageDto> history = aiAdvisorService.getChatHistory(principal);
        return ResponseEntity.ok(ApiResponse.success("Chat history retrieved", history));
    }
}

