package com.zenhire.auth;

import com.zenhire.auth.dto.AuthResponseDto;
import com.zenhire.auth.dto.LoginRequestDto;
import com.zenhire.auth.dto.RegisterRequestDto;
import com.zenhire.auth.dto.UserDto;
import com.zenhire.auth.service.AuthServiceImpl;
import com.zenhire.common.exception.DuplicateResourceException;
import com.zenhire.common.exception.InvalidInputException;
import com.zenhire.security.JwtTokenProvider;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.entity.Recruiter;
import com.zenhire.user.entity.Role;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.CandidateRepository;
import com.zenhire.user.repository.RecruiterRepository;
import com.zenhire.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private RecruiterRepository recruiterRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    @DisplayName("Should successfully register a candidate")
    void shouldRegisterCandidate() {
        RegisterRequestDto request = new RegisterRequestDto(
                "Jane Doe",
                "jane@example.com",
                "Password123!",
                Role.ROLE_CANDIDATE,
                null
        );

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encodedPassword");

        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .name(request.name())
                .email(request.email())
                .passwordHash("encodedPassword")
                .role(Role.ROLE_CANDIDATE)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        Candidate savedCandidate = Candidate.builder()
                .id(UUID.randomUUID())
                .user(savedUser)
                .build();
        when(candidateRepository.save(any(Candidate.class))).thenReturn(savedCandidate);
        when(jwtTokenProvider.generateToken(any())).thenReturn("mock.jwt.token");

        AuthResponseDto response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("mock.jwt.token");
        assertThat(response.user().name()).isEqualTo("Jane Doe");
        assertThat(response.user().role()).isEqualTo(Role.ROLE_CANDIDATE);
        verify(candidateRepository, times(1)).save(any(Candidate.class));
        verify(recruiterRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email exists")
    void shouldThrowDuplicateEmailException() {
        RegisterRequestDto request = new RegisterRequestDto(
                "Jane Doe",
                "jane@example.com",
                "Password123!",
                Role.ROLE_CANDIDATE,
                null
        );

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("User with email 'jane@example.com' already exists");
    }

    @Test
    @DisplayName("Should throw InvalidInputException if recruiter registers without company name")
    void shouldRequireCompanyNameForRecruiter() {
        RegisterRequestDto request = new RegisterRequestDto(
                "Tech Recruiter",
                "recruiter@tech.com",
                "Password123!",
                Role.ROLE_RECRUITER,
                ""
        );

        when(userRepository.existsByEmail("recruiter@tech.com")).thenReturn(false);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(InvalidInputException.class)
                .hasMessageContaining("Company name is required for recruiter registration");
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void shouldLoginSuccessfully() {
        LoginRequestDto request = new LoginRequestDto("jane@example.com", "Password123!");

        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(
                userId,
                "Jane Doe",
                "jane@example.com",
                "hashed",
                Role.ROLE_CANDIDATE,
                UUID.randomUUID(),
                null,
                java.util.List.of()
        );

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtTokenProvider.generateToken(principal)).thenReturn("mock.jwt.token");

        AuthResponseDto response = authService.login(request);

        assertThat(response.token()).isEqualTo("mock.jwt.token");
        assertThat(response.user().email()).isEqualTo("jane@example.com");
    }
}

