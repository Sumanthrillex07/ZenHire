package com.zenhire.auth.dto;

public record AuthResponseDto(
        String token,
        UserDto user
) {}

