package com.zenhire.candidate;

import com.zenhire.candidate.dto.CandidateProfileDto;
import com.zenhire.candidate.dto.CandidateProfileUpdateDto;
import com.zenhire.candidate.service.impl.CandidateServiceImpl;
import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.entity.Role;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.CandidateRepository;
import com.zenhire.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateServiceTest {

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CandidateServiceImpl candidateService;

    @Test
    @DisplayName("Should return candidate profile")
    void shouldReturnCandidateProfile() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, candidateId, null, List.of()
        );

        User user = User.builder().id(userId).name("Jane Doe").email("jane@example.com").build();
        Candidate candidate = Candidate.builder()
                .id(candidateId)
                .user(user)
                .phone("+1234567890")
                .headline("Full Stack Engineer")
                .createdAt(Instant.now())
                .build();

        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.of(candidate));

        CandidateProfileDto result = candidateService.getProfile(principal);

        assertThat(result.name()).isEqualTo("Jane Doe");
        assertThat(result.phone()).isEqualTo("+1234567890");
        assertThat(result.headline()).isEqualTo("Full Stack Engineer");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when candidate not found")
    void shouldThrowWhenCandidateNotFound() {
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, null, null, List.of()
        );

        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> candidateService.getProfile(principal))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should update candidate profile fields")
    void shouldUpdateCandidateProfile() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, candidateId, null, List.of()
        );

        User user = User.builder().id(userId).name("Jane Doe").email("jane@example.com").build();
        Candidate candidate = Candidate.builder()
                .id(candidateId)
                .user(user)
                .phone("+1234567890")
                .headline("Software Engineer")
                .createdAt(Instant.now())
                .build();

        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.of(candidate));
        when(candidateRepository.save(any(Candidate.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CandidateProfileUpdateDto updateDto = new CandidateProfileUpdateDto(
                "Jane Smith",
                "+1987654321",
                "Senior Backend Architect"
        );

        CandidateProfileDto updated = candidateService.updateProfile(principal, updateDto);

        assertThat(updated.name()).isEqualTo("Jane Smith");
        assertThat(updated.phone()).isEqualTo("+1987654321");
        assertThat(updated.headline()).isEqualTo("Senior Backend Architect");
        verify(userRepository).save(user);
        verify(candidateRepository).save(candidate);
    }
}

