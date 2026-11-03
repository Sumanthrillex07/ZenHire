package com.zenhire.auth.dto;

import com.zenhire.user.entity.Role;
import java.util.UUID;

public record UserDto(
        UUID id,
        String name,
        String email,
        Role role,
        UUID candidateId,
        UUID recruiterId
) {}

