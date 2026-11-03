package com.zenhire.assessment;

import com.zenhire.assessment.dto.AnswerSubmissionItemDto;
import com.zenhire.assessment.dto.AttemptResultDto;
import com.zenhire.assessment.dto.StartAttemptResponseDto;
import com.zenhire.assessment.dto.SubmitAttemptRequestDto;
import com.zenhire.assessment.dto.TestDetailDto;
import com.zenhire.assessment.entity.Question;
import com.zenhire.assessment.entity.QuestionDifficulty;
import com.zenhire.assessment.entity.TestAttempt;
import com.zenhire.assessment.entity.TestType;
import com.zenhire.assessment.repository.QuestionRepository;
import com.zenhire.assessment.repository.TestAnswerRepository;
import com.zenhire.assessment.repository.TestAttemptRepository;
import com.zenhire.assessment.repository.TestRepository;
import com.zenhire.assessment.service.impl.AssessmentServiceImpl;
import com.zenhire.common.exception.BaseApiException;
import com.zenhire.common.exception.InvalidWorkflowStateException;
import com.zenhire.job.entity.RoleCategory;
import com.zenhire.resume.repository.ResumeRepository;
import com.zenhire.security.UserPrincipal;
import com.zenhire.user.entity.Candidate;
import com.zenhire.user.entity.Role;
import com.zenhire.user.entity.User;
import com.zenhire.user.repository.CandidateRepository;
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
class AssessmentServiceTest {

    @Mock
    private TestRepository testRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private TestAttemptRepository testAttemptRepository;

    @Mock
    private TestAnswerRepository testAnswerRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @InjectMocks
    private AssessmentServiceImpl assessmentService;

    @Test
    @DisplayName("Should return questions with answer masking enforced at DTO layer")
    void shouldReturnQuestionsWithMaskedAnswers() {
        UUID testId = UUID.randomUUID();
        com.zenhire.assessment.entity.Test test = com.zenhire.assessment.entity.Test.builder()
                .id(testId)
                .title("Backend Assessment")
                .testType(TestType.ROLE_SPECIFIC)
                .roleCategory(RoleCategory.BACKEND)
                .passScore(60)
                .build();

        Question q1 = Question.builder()
                .id(UUID.randomUUID())
                .test(test)
                .questionText("What is Spring Boot?")
                .options(List.of("Framework", "Language", "OS", "DB"))
                .correctIndex(0)
                .topicTag("spring-boot")
                .difficulty(QuestionDifficulty.EASY)
                .build();

        when(testRepository.findById(testId)).thenReturn(Optional.of(test));
        when(questionRepository.findAllByTestIdOrderByCreatedAtAsc(testId)).thenReturn(List.of(q1));

        TestDetailDto details = assessmentService.getTestDetails(testId);

        assertThat(details.title()).isEqualTo("Backend Assessment");
        assertThat(details.questions()).hasSize(1);
        assertThat(details.questions().get(0).questionText()).isEqualTo("What is Spring Boot?");
        // QuestionCandidateDto physically lacks correctIndex getter/field
    }

    @Test
    @DisplayName("Should reject starting attempt if candidate has not uploaded resume")
    void shouldRejectAttemptWithoutResume() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();
        UUID testId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, candidateId, null, List.of()
        );

        Candidate candidate = Candidate.builder().id(candidateId).build();
        when(candidateRepository.findByUserId(userId)).thenReturn(Optional.of(candidate));
        when(resumeRepository.existsByCandidateId(candidateId)).thenReturn(false);

        assertThatThrownBy(() -> assessmentService.startAttempt(principal, testId))
                .isInstanceOf(BaseApiException.class)
                .hasMessageContaining("You must upload a resume before taking assessment tests");
    }

    @Test
    @DisplayName("Should grade submitted attempt correctly and mark passed")
    void shouldGradeAttemptSuccessfully() {
        UUID userId = UUID.randomUUID();
        UUID attemptId = UUID.randomUUID();
        UUID testId = UUID.randomUUID();
        UUID q1Id = UUID.randomUUID();
        UUID q2Id = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, UUID.randomUUID(), null, List.of()
        );

        User user = User.builder().id(userId).build();
        Candidate candidate = Candidate.builder().id(UUID.randomUUID()).user(user).build();

        com.zenhire.assessment.entity.Test test = com.zenhire.assessment.entity.Test.builder()
                .id(testId)
                .passScore(60)
                .build();

        TestAttempt attempt = TestAttempt.builder()
                .id(attemptId)
                .candidate(candidate)
                .test(test)
                .totalQuestions(2)
                .completedAt(null)
                .build();

        Question q1 = Question.builder().id(q1Id).correctIndex(1).topicTag("spring").build();
        Question q2 = Question.builder().id(q2Id).correctIndex(2).topicTag("sql").build();

        when(testAttemptRepository.findById(attemptId)).thenReturn(Optional.of(attempt));
        when(questionRepository.findAllByTestIdOrderByCreatedAtAsc(testId)).thenReturn(List.of(q1, q2));

        // Submit: answer 1 correct (index 1), answer 2 wrong (selected 0 instead of 2)
        SubmitAttemptRequestDto request = new SubmitAttemptRequestDto(List.of(
                new AnswerSubmissionItemDto(q1Id, 1),
                new AnswerSubmissionItemDto(q2Id, 0)
        ));

        AttemptResultDto result = assessmentService.submitAttempt(principal, attemptId, request);

        // 1 of 2 correct = 50% score, passScore is 60, so passed = false
        assertThat(result.score()).isEqualTo(50);
        assertThat(result.passed()).isFalse();
        assertThat(result.correctCount()).isEqualTo(1);
        assertThat(result.totalQuestions()).isEqualTo(2);
        verify(testAnswerRepository).saveAll(any());
        verify(testAttemptRepository).save(attempt);
    }

    @Test
    @DisplayName("Should reject submitting already completed attempt")
    void shouldRejectAlreadyCompletedAttempt() {
        UUID userId = UUID.randomUUID();
        UUID attemptId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId, "Jane Doe", "jane@example.com", "pass",
                Role.ROLE_CANDIDATE, UUID.randomUUID(), null, List.of()
        );

        User user = User.builder().id(userId).build();
        Candidate candidate = Candidate.builder().id(UUID.randomUUID()).user(user).build();

        TestAttempt completedAttempt = TestAttempt.builder()
                .id(attemptId)
                .candidate(candidate)
                .completedAt(Instant.now())
                .build();

        when(testAttemptRepository.findById(attemptId)).thenReturn(Optional.of(completedAttempt));

        SubmitAttemptRequestDto request = new SubmitAttemptRequestDto(List.of());

        assertThatThrownBy(() -> assessmentService.submitAttempt(principal, attemptId, request))
                .isInstanceOf(InvalidWorkflowStateException.class)
                .hasMessageContaining("already been submitted");
    }
}
