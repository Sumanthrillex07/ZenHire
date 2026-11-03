package com.zenhire.auth.service;

import com.zenhire.auth.dto.AuthResponseDto;
import com.zenhire.auth.dto.LoginRequestDto;
import com.zenhire.auth.dto.RegisterRequestDto;
import com.zenhire.auth.dto.UserDto;
import com.zenhire.common.exception.DuplicateResourceException;
import com.zenhire.common.exception.InvalidInputException;
import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.security.JwtTokenProvider;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.entity.Recruiter;
import com.zenhire.user.entity.Role;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.CandidateRepository;
import com.zenhire.user.repository.RecruiterRepository;
import com.zenhire.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AuthService managing user signups, credentials validation,
 * profile creation, and JWT issue.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final RecruiterRepository recruiterRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        String normalizedEmail = request.email().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("User", "email", normalizedEmail);
        }

        if (request.role() == Role.ROLE_RECRUITER) {
            if (request.companyName() == null || request.companyName().trim().isEmpty()) {
                throw new InvalidInputException("Company name is required for recruiter registration");
            }
        }

        User user = User.builder()
                .name(request.name().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();

        user = userRepository.save(user);

        if (request.role() == Role.ROLE_CANDIDATE) {
            Candidate candidate = Candidate.builder()
                    .user(user)
                    .build();
            candidate = candidateRepository.save(candidate);
            user.setCandidate(candidate);
        } else if (request.role() == Role.ROLE_RECRUITER) {
            Recruiter recruiter = Recruiter.builder()
                    .user(user)
                    .companyName(request.companyName().trim())
                    .build();
            recruiter = recruiterRepository.save(recruiter);
            user.setRecruiter(recruiter);
        }

        UserPrincipal principal = UserPrincipal.create(user);
        String token = jwtTokenProvider.generateToken(principal);

        UserDto userDto = new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCandidate() != null ? user.getCandidate().getId() : null,
                user.getRecruiter() != null ? user.getRecruiter().getId() : null
        );

        log.info("Registered new user with email: {} and role: {}", user.getEmail(), user.getRole());
        return new AuthResponseDto(token, userDto);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginRequestDto request) {
        String normalizedEmail = request.email().toLowerCase().trim();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(principal);

        UserDto userDto = new UserDto(
                principal.getId(),
                principal.getName(),
                principal.getEmail(),
                principal.getRole(),
                principal.getCandidateId(),
                principal.getRecruiterId()
        );

        log.info("User logged in successfully: {}", principal.getEmail());
        return new AuthResponseDto(token, userDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findWithProfilesById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCandidate() != null ? user.getCandidate().getId() : null,
                user.getRecruiter() != null ? user.getRecruiter().getId() : null
        );
    }
}

