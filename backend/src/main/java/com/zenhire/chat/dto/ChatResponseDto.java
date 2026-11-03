package com.zenhire.chat.dto;

public record ChatResponseDto(
        String reply,
        String message,
        ChatMessageDto aiMessage
) {
    public ChatResponseDto(String reply, ChatMessageDto aiMessage) {
        this(reply, reply, aiMessage);
    }
}

