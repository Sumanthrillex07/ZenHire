package com.zenhire.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequestDto(
        @NotBlank(message = "Message text cannot be empty")
        @Size(max = 2000, message = "Message must not exceed 2000 characters")
        String message
) {}

