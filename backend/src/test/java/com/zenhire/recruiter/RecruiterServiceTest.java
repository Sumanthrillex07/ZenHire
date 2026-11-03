package com.zenhire.recruiter;

import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.recruiter.dto.RecruiterProfileDto;
import com.zenhire.recruiter.dto.RecruiterProfileUpdateDto;
import com.zenhire.recruiter.service.impl.RecruiterServiceImpl;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Recruiter;
import com.zenhire.user.entity.Role;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.RecruiterRepository;
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
class RecruiterServiceTest {

    @Mock
    private RecruiterRepository recruiterRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RecruiterServiceImpl recruiterService;

    @Test
    @DisplayName("Should return recruiter profile")
    void shouldReturnRecruiterProfile() {
        UUID userId = UUID.randomUUID();
        UUID recruiterId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Acme HR", "hr@acme.com", "pass",
                Role.ROLE_RECRUITER, null, recruiterId, List.of()
        );

        User user = User.builder().id(userId).name("Acme HR").email("hr@acme.com").build();
        Recruiter recruiter = Recruiter.builder()
                .id(recruiterId)
                .user(user)
                .companyName("Acme Corporation")
                .createdAt(Instant.now())
                .build();

        when(recruiterRepository.findByUserId(userId)).thenReturn(Optional.of(recruiter));

        RecruiterProfileDto result = recruiterService.getProfile(principal);

        assertThat(result.name()).isEqualTo("Acme HR");
        assertThat(result.companyName()).isEqualTo("Acme Corporation");
    }

    @Test
    @DisplayName("Should update recruiter company name and user name")
    void shouldUpdateRecruiterProfile() {
        UUID userId = UUID.randomUUID();
        UUID recruiterId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Acme HR", "hr@acme.com", "pass",
                Role.ROLE_RECRUITER, null, recruiterId, List.of()
        );

        User user = User.builder().id(userId).name("Acme HR").email("hr@acme.com").build();
        Recruiter recruiter = Recruiter.builder()
                .id(recruiterId)
                .user(user)
                .companyName("Acme Corp")
                .createdAt(Instant.now())
                .build();

        when(recruiterRepository.findByUserId(userId)).thenReturn(Optional.of(recruiter));
        when(recruiterRepository.save(any(Recruiter.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RecruiterProfileUpdateDto updateDto = new RecruiterProfileUpdateDto("Acme Global HR", "Acme Global Industries");
        RecruiterProfileDto updated = recruiterService.updateProfile(principal, updateDto);

        assertThat(updated.name()).isEqualTo("Acme Global HR");
        assertThat(updated.companyName()).isEqualTo("Acme Global Industries");
        verify(userRepository).save(user);
        verify(recruiterRepository).save(recruiter);
    }
}

