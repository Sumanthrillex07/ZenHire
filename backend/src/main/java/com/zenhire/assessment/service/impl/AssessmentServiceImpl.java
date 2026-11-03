package com.zenhire.assessment.service.impl;

import com.zenhire.assessment.dto.*;
import com.zenhire.assessment.entity.Question;
import com.zenhire.assessment.entity.Test;
import com.zenhire.assessment.entity.TestAnswer;
import com.zenhire.assessment.entity.TestAttempt;
import com.zenhire.assessment.repository.QuestionRepository;
import com.zenhire.assessment.repository.TestAnswerRepository;
import com.zenhire.assessment.repository.TestAttemptRepository;
import com.zenhire.assessment.repository.TestRepository;
import com.zenhire.assessment.service.AssessmentService;
import com.zenhire.common.exception.BaseApiException;
import com.zenhire.common.exception.ForbiddenOperationException;
import com.zenhire.common.exception.InvalidWorkflowStateException;
import com.zenhire.common.exception.ResourceNotFoundException;
import com.zenhire.resume.repository.ResumeRepository;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements AssessmentService {

    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final TestAnswerRepository testAnswerRepository;
    private final CandidateRepository candidateRepository;
    private final ResumeRepository resumeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TestSummaryDto> getTestCatalog(UserPrincipal principal) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        List<Test> tests = testRepository.findAllByOrderByCreatedAtAsc();

        return tests.stream().map(test -> {
            Optional<TestAttempt> topAttempt = testAttemptRepository.findTopByCandidateIdAndTestIdOrderByScoreDesc(
                    candidate.getId(), test.getId()
            );

            boolean hasAttempted = topAttempt.isPresent();
            int highestScore = topAttempt.map(TestAttempt::getScore).orElse(0);
            boolean passed = topAttempt.map(TestAttempt::isPassed).orElse(false);

            return new TestSummaryDto(
                    test.getId(),
                    test.getTestType(),
                    test.getRoleCategory(),
                    test.getTitle(),
                    test.getPassScore(),
                    hasAttempted,
                    highestScore,
                    passed
            );
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TestDetailDto getTestDetails(UUID testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment Test", "id", testId));

        List<Question> questions = questionRepository.findAllByTestIdOrderByCreatedAtAsc(testId);

        // Map to DTO, deliberately omitting correctIndex to protect answer keys
        List<QuestionCandidateDto> questionDtos = questions.stream()
                .map(q -> new QuestionCandidateDto(
                        q.getId(),
                        q.getQuestionText(),
                        q.getOptions(),
                        q.getTopicTag(),
                        q.getDifficulty()
                ))
                .toList();

        return new TestDetailDto(
                test.getId(),
                test.getTestType(),
                test.getRoleCategory(),
                test.getTitle(),
                test.getPassScore(),
                questionDtos
        );
    }

    @Override
    @Transactional
    public StartAttemptResponseDto startAttempt(UserPrincipal principal, UUID testId) {
        Candidate candidate = candidateRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile", "userId", principal.getId()));

        if (!resumeRepository.existsByCandidateId(candidate.getId())) {
            throw new BaseApiException("You must upload a resume before taking assessment tests", HttpStatus.BAD_REQUEST, "RESUME_REQUIRED") {};
        }

        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment Test", "id", testId));

        List<Question> questions = questionRepository.findAllByTestIdOrderByCreatedAtAsc(testId);

        TestAttempt attempt = TestAttempt.builder()
                .candidate(candidate)
                .test(test)
                .totalQuestions(questions.size())
                .score(0)
                .passed(false)
                .build();

        TestAttempt saved = testAttemptRepository.save(attempt);
        log.info("Initiated assessment attempt {} for candidate {} on test {}", saved.getId(), candidate.getId(), testId);

        return new StartAttemptResponseDto(saved.getId());
    }

    @Override
    @Transactional
    public AttemptResultDto submitAttempt(UserPrincipal principal, UUID attemptId, SubmitAttemptRequestDto request) {
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Test Attempt", "id", attemptId));

        if (!attempt.getCandidate().getUser().getId().equals(principal.getId())) {
            throw new ForbiddenOperationException("You do not have permission to submit this test attempt");
        }

        if (attempt.getCompletedAt() != null) {
            throw new InvalidWorkflowStateException("This assessment attempt has already been submitted and scored.");
        }

        List<Question> questions = questionRepository.findAllByTestIdOrderByCreatedAtAsc(attempt.getTest().getId());
        Map<UUID, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        int correctCount = 0;
        List<TestAnswer> answersToSave = new ArrayList<>();

        for (AnswerSubmissionItemDto answerDto : request.answers()) {
            Question question = questionMap.get(answerDto.questionId());
            if (question != null) {
                boolean isCorrect = (answerDto.selectedIndex() == question.getCorrectIndex());
                if (isCorrect) {
                    correctCount++;
                }

                TestAnswer testAnswer = TestAnswer.builder()
                        .attempt(attempt)
                        .question(question)
                        .selectedIndex(answerDto.selectedIndex())
                        .isCorrect(isCorrect)
                        .topicTag(question.getTopicTag())
                        .build();

                answersToSave.add(testAnswer);
            }
        }

        testAnswerRepository.saveAll(answersToSave);

        int totalQuestions = questions.isEmpty() ? 1 : questions.size();
        int finalScore = Math.round(((float) correctCount / totalQuestions) * 100);
        finalScore = Math.max(0, Math.min(100, finalScore));
        boolean passed = finalScore >= attempt.getTest().getPassScore();

        attempt.setScore(finalScore);
        attempt.setPassed(passed);
        attempt.setCompletedAt(Instant.now());
        testAttemptRepository.save(attempt);

        log.info("Graded attempt {}: score={}% ({}/{} correct), passed={}",
                attemptId, finalScore, correctCount, totalQuestions, passed);

        return new AttemptResultDto(finalScore, passed, correctCount, totalQuestions);
    }
}

