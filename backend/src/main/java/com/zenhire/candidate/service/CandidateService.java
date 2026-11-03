package com.zenhire.candidate.service;

import com.zenhire.candidate.dto.CandidateProfileDto;
import com.zenhire.candidate.dto.CandidateProfileUpdateDto;
import com.zenhire.security.UserPrincipal;

/**
 * Service managing candidate profile details.
 */
public interface CandidateService {

    CandidateProfileDto getProfile(UserPrincipal principal);

    CandidateProfileDto updateProfile(UserPrincipal principal, CandidateProfileUpdateDto updateDto);
}

