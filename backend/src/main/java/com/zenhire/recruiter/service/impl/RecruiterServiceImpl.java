package com.zenhire.recruiter.service.impl;

import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.recruiter.dto.RecruiterProfileDto;
import com.zenhire.recruiter.dto.RecruiterProfileUpdateDto;
import com.zenhire.recruiter.service.RecruiterService;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Recruiter;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.RecruiterRepository;
import com.zenhire.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecruiterServiceImpl implements RecruiterService {

    private final RecruiterRepository recruiterRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public RecruiterProfileDto getProfile(UserPrincipal principal) {
        Recruiter recruiter = recruiterRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile", "userId", principal.getId()));

        return mapToDto(recruiter);
    }

    @Override
    @Transactional
    public RecruiterProfileDto updateProfile(UserPrincipal principal, RecruiterProfileUpdateDto updateDto) {
        Recruiter recruiter = recruiterRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile", "userId", principal.getId()));

        User user = recruiter.getUser();

        if (StringUtils.hasText(updateDto.name())) {
            user.setName(updateDto.name().trim());
            userRepository.save(user);
        }

        if (StringUtils.hasText(updateDto.companyName())) {
            recruiter.setCompanyName(updateDto.companyName().trim());
        }

        Recruiter saved = recruiterRepository.save(recruiter);
        log.info("Updated recruiter profile for userId: {}", principal.getId());
        return mapToDto(saved);
    }

    private RecruiterProfileDto mapToDto(Recruiter recruiter) {
        return new RecruiterProfileDto(
                recruiter.getId(),
                recruiter.getUser().getId(),
                recruiter.getUser().getName(),
                recruiter.getUser().getEmail(),
                recruiter.getCompanyName(),
                recruiter.getCreatedAt()
        );
    }
}

