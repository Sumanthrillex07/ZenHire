package com.zenhire.chat.dto;

public record ChatResponseDto(
        String reply,
        ChatMessageDto aiMessage
) {}

