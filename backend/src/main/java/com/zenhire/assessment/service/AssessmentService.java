package com.zenhire.assessment.service;

import com.zenhire.assessment.dto.*;
import com.zenhire.security.UserPrincipal;

import java.util.List;
import java.util.UUID;

/**
 * Service contract for assessment catalog inspection, masked question delivery, and grading.
 */
public interface AssessmentService {

    List<TestSummaryDto> getTestCatalog(UserPrincipal principal);

    TestDetailDto getTestDetails(UUID testId);

    StartAttemptResponseDto startAttempt(UserPrincipal principal, UUID testId);

    AttemptResultDto submitAttempt(UserPrincipal principal, UUID attemptId, SubmitAttemptRequestDto request);
}

