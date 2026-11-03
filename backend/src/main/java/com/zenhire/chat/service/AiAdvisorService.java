package com.zenhire.chat.service;

import com.zenhire.chat.dto.ChatMessageDto;
import com.zenhire.chat.dto.ChatRequestDto;
import com.zenhire.chat.dto.ChatResponseDto;
import com.zenhire.security.UserPrincipal;

import java.util.List;

/**
 * Service contract for context-grounded AI Career Advisor conversational assistance.
 */
public interface AiAdvisorService {

    ChatResponseDto sendMessage(UserPrincipal principal, ChatRequestDto request);

    List<ChatMessageDto> getChatHistory(UserPrincipal principal);
}

