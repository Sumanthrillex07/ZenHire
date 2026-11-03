package com.zenhire.candidate.service;

import com.zenhire.candidate.dto.CandidateAnalysisDto;
import com.zenhire.candidate.dto.CandidateDashboardDto;
import com.zenhire.candidate.dto.CandidateProfileDto;
import com.zenhire.candidate.dto.CandidateProfileUpdateDto;
import com.zenhire.security.UserPrincipal;

/**
 * Service managing candidate profile details, dashboard status, and skill topic analytics.
 */
public interface CandidateService {

    CandidateProfileDto getProfile(UserPrincipal principal);

    CandidateProfileDto updateProfile(UserPrincipal principal, CandidateProfileUpdateDto updateDto);

    CandidateDashboardDto getDashboard(UserPrincipal principal);

    CandidateAnalysisDto getSkillAnalysis(UserPrincipal principal);
}

