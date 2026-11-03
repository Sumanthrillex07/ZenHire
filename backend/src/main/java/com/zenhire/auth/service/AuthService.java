package com.zenhire.auth.service;

import com.zenhire.auth.dto.AuthResponseDto;
import com.zenhire.auth.dto.LoginRequestDto;
import com.zenhire.auth.dto.RegisterRequestDto;
import com.zenhire.auth.dto.UserDto;
import com.zenhire.security.UserPrincipal;

/**
 * Service contract for user registration, authentication, and session identity retrieval.
 */
public interface AuthService {

    AuthResponseDto register(RegisterRequestDto request);

    AuthResponseDto login(LoginRequestDto request);

    UserDto getCurrentUser(UserPrincipal principal);
}

