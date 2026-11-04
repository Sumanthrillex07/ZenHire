package com.zenhire.candidate.service.impl;

import com.zenhire.application.repository.ApplicationRepository;
import com.zenhire.assessment.dto.TestSummaryDto;
import com.zenhire.assessment.entity.TestAnswer;
import com.zenhire.assessment.entity.TestAttempt;
import com.zenhire.assessment.repository.TestAnswerRepository;
import com.zenhire.assessment.repository.TestAttemptRepository;
import com.zenhire.assessment.service.AssessmentService;
import com.zenhire.candidate.dto.CandidateAnalysisDto;
import com.zenhire.candidate.dto.CandidateDashboardDto;
import com.zenhire.candidate.dto.CandidateProfileDto;
import com.zenhire.candidate.dto.CandidateProfileUpdateDto;
import com.zenhire.candidate.service.CandidateService;
import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.job.entity.RoleCategory;
import com.zenhire.resume.entity.Resume;
import com.zenhire.resume.repository.ResumeRepository;
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

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ApplicationRepository applicationRepository;
    private final AssessmentService assessmentService;
    private final TestAnswerRepository testAnswerRepository;
    private final TestAttemptRepository testAttemptRepository;

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

    @Override
    @Transactional(readOnly = true)
    public CandidateDashboardDto getDashboard(UserPrincipal principal) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        Optional<Resume> resumeOpt = resumeRepository.findByCandidateIdAndIsLatestTrue(candidate.getId());
        long appCount = applicationRepository.countByCandidateId(candidate.getId());
        List<TestSummaryDto> testCatalog = assessmentService.getTestCatalog(principal);

        return new CandidateDashboardDto(
                resumeOpt.isPresent(),
                resumeOpt.map(Resume::getUploadedAt).orElse(null),
                appCount,
                testCatalog
        );
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateAnalysisDto getSkillAnalysis(UserPrincipal principal) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        List<TestAnswer> answers = testAnswerRepository.findAllByAttemptCandidateId(candidate.getId());

        // Group answers by topic tag: calculate accuracy percentage
        Map<String, List<TestAnswer>> answersByTopic = answers.stream()
                .collect(Collectors.groupingBy(TestAnswer::getTopicTag));

        List<String> strongTopics = new ArrayList<>();
        List<String> weakTopics = new ArrayList<>();

        answersByTopic.forEach((topic, topicAnswers) -> {
            long correct = topicAnswers.stream().filter(TestAnswer::isCorrect).count();
            double accuracy = (double) correct / topicAnswers.size();
            if (accuracy >= 0.70) {
                strongTopics.add(topic);
            } else {
                weakTopics.add(topic);
            }
        });

        // Recommended roles based on passed role-specific assessments
        List<TestAttempt> passingAttempts = testAttemptRepository.findAllByCandidateIdOrderByStartedAtDesc(candidate.getId())
                .stream()
                .filter(TestAttempt::isPassed)
                .toList();

        Set<RoleCategory> recommendedSet = new LinkedHashSet<>();
        for (TestAttempt attempt : passingAttempts) {
            if (attempt.getTest().getRoleCategory() != null) {
                recommendedSet.add(attempt.getTest().getRoleCategory());
            }
        }

        if (recommendedSet.isEmpty()) {
            // Default recommended exploration if no tests passed yet
            recommendedSet.add(RoleCategory.BACKEND);
        }

        return new CandidateAnalysisDto(strongTopics, weakTopics, new ArrayList<>(recommendedSet));
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

