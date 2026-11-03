package com.zenhire.candidate.service.impl;

import com.zenhire.candidate.dto.CandidateProfileDto;
import com.zenhire.candidate.dto.CandidateProfileUpdateDto;
import com.zenhire.candidate.service.CandidateService;
import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.CandidateRepository;
import com.zenhire.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CandidateProfileDto getProfile(UserPrincipal principal) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        return mapToDto(candidate);
    }

    @Override
    @Transactional
    public CandidateProfileDto updateProfile(UserPrincipal principal, CandidateProfileUpdateDto updateDto) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        User user = candidate.getUser();

        if (StringUtils.hasText(updateDto.name())) {
            user.setName(updateDto.name().trim());
            userRepository.save(user);
        }

        if (updateDto.phone() != null) {
            candidate.setPhone(updateDto.phone().trim());
        }

        if (updateDto.headline() != null) {
            candidate.setHeadline(updateDto.headline().trim());
        }

        Candidate saved = candidateRepository.save(candidate);
        log.info("Updated candidate profile for userId: {}", principal.getId());
        return mapToDto(saved);
    }

    private CandidateProfileDto mapToDto(Candidate candidate) {
        return new CandidateProfileDto(
                candidate.getId(),
                candidate.getUser().getId(),
                candidate.getUser().getName(),
                candidate.getUser().getEmail(),
                candidate.getPhone(),
                candidate.getHeadline(),
                candidate.getCreatedAt()
        );
    }
}

