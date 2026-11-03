package com.zenhire.recruiter.service;

import com.zenhire.recruiter.dto.RecruiterDashboardDto;
import com.zenhire.recruiter.dto.RecruiterProfileDto;
import com.zenhire.recruiter.dto.RecruiterProfileUpdateDto;
import com.zenhire.security.UserPrincipal;

/**
 * Service managing company recruiter profile details and dashboard KPI aggregations.
 */
public interface RecruiterService {

    RecruiterProfileDto getProfile(UserPrincipal principal);

    RecruiterProfileDto updateProfile(UserPrincipal principal, RecruiterProfileUpdateDto updateDto);

    RecruiterDashboardDto getDashboard(UserPrincipal principal);
}

