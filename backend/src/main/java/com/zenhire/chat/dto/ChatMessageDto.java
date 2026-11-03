package com.zenhire.chat.dto;

import com.zenhire.chat.entity.MessageSender;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageDto(
        UUID id,
        MessageSender sender,
        String message,
        Instant createdAt
) {}

