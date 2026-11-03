package com.zenhire.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.auth.controller.AuthController;
import com.zenhire.auth.dto.AuthResponseDto;
import com.zenhire.auth.dto.LoginRequestDto;
import com.zenhire.auth.dto.RegisterRequestDto;
import com.zenhire.auth.dto.UserDto;
import com.zenhire.auth.service.AuthService;
import com.zenhire.security.CustomUserDetailsService;
import com.zenhire.security.JwtTokenProvider;
import com.zenhire.user.entity.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/v1/auth/register - 201 Created on valid input")
    void shouldRegisterSuccessfully() throws Exception {
        RegisterRequestDto request = new RegisterRequestDto(
                "Jane Doe",
                "jane@example.com",
                "SecretPass123",
                Role.ROLE_CANDIDATE,
                null
        );

        UserDto userDto = new UserDto(
                UUID.randomUUID(),
                "Jane Doe",
                "jane@example.com",
                Role.ROLE_CANDIDATE,
                UUID.randomUUID(),
                null
        );
        AuthResponseDto responseDto = new AuthResponseDto("jwt.token.here", userDto);

        when(authService.register(any(RegisterRequestDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt.token.here"))
                .andExpect(jsonPath("$.data.user.name").value("Jane Doe"))
                .andExpect(jsonPath("$.data.user.email").value("jane@example.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - 400 Bad Request on invalid email")
    void shouldFailValidationOnInvalidEmail() throws Exception {
        RegisterRequestDto request = new RegisterRequestDto(
                "Jane Doe",
                "invalid-email",
                "SecretPass123",
                Role.ROLE_CANDIDATE,
                null
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.error.validationErrors[0].field").value("email"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - 200 OK on successful login")
    void shouldLoginSuccessfully() throws Exception {
        LoginRequestDto request = new LoginRequestDto("jane@example.com", "SecretPass123");

        UserDto userDto = new UserDto(
                UUID.randomUUID(),
                "Jane Doe",
                "jane@example.com",
                Role.ROLE_CANDIDATE,
                UUID.randomUUID(),
                null
        );
        AuthResponseDto responseDto = new AuthResponseDto("jwt.token.here", userDto);

        when(authService.login(any(LoginRequestDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt.token.here"))
                .andExpect(jsonPath("$.data.user.email").value("jane@example.com"));
    }
}

