package com.zenhire.assessment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.assessment.controller.AssessmentController;
import com.zenhire.assessment.dto.*;
import com.zenhire.assessment.entity.QuestionDifficulty;
import com.zenhire.assessment.entity.TestType;
import com.zenhire.assessment.service.AssessmentService;
import com.zenhire.job.entity.RoleCategory;
import com.zenhire.security.CustomUserDetailsService;
import com.zenhire.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AssessmentController.class)
@AutoConfigureMockMvc(addFilters = false)
class AssessmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AssessmentService assessmentService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("GET /api/v1/tests - 200 OK")
    void shouldGetCatalog() throws Exception {
        UUID testId = UUID.randomUUID();
        TestSummaryDto summary = new TestSummaryDto(
                testId, TestType.ROLE_SPECIFIC, RoleCategory.BACKEND, "Backend Test", 60, true, 80, true
        );

        when(assessmentService.getTestCatalog(any())).thenReturn(List.of(summary));

        mockMvc.perform(get("/api/v1/tests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Backend Test"))
                .andExpect(jsonPath("$.data[0].highestScore").value(80));
    }

    @Test
    @DisplayName("GET /api/v1/tests/{testId} - 200 OK with masked questions")
    void shouldGetTestDetails() throws Exception {
        UUID testId = UUID.randomUUID();
        QuestionCandidateDto qDto = new QuestionCandidateDto(
                UUID.randomUUID(), "Question 1", List.of("A", "B"), "tag", QuestionDifficulty.EASY
        );
        TestDetailDto detailDto = new TestDetailDto(
                testId, TestType.ROLE_SPECIFIC, RoleCategory.BACKEND, "Backend Test", 60, List.of(qDto)
        );

        when(assessmentService.getTestDetails(testId)).thenReturn(detailDto);

        mockMvc.perform(get("/api/v1/tests/{testId}", testId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.questions[0].questionText").value("Question 1"))
                .andExpect(jsonPath("$.data.questions[0].correctIndex").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/tests/{testId}/attempts - 201 Created")
    void shouldStartAttempt() throws Exception {
        UUID testId = UUID.randomUUID();
        UUID attemptId = UUID.randomUUID();

        when(assessmentService.startAttempt(any(), any())).thenReturn(new StartAttemptResponseDto(attemptId));

        mockMvc.perform(post("/api/v1/tests/{testId}/attempts", testId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.attemptId").value(attemptId.toString()));
    }

    @Test
    @DisplayName("POST /api/v1/tests/attempts/{attemptId}/submit - 200 OK")
    void shouldSubmitAttempt() throws Exception {
        UUID attemptId = UUID.randomUUID();
        SubmitAttemptRequestDto request = new SubmitAttemptRequestDto(List.of(
                new AnswerSubmissionItemDto(UUID.randomUUID(), 1)
        ));

        AttemptResultDto resultDto = new AttemptResultDto(100, true, 1, 1);
        when(assessmentService.submitAttempt(any(), any(), any())).thenReturn(resultDto);

        mockMvc.perform(post("/api/v1/tests/attempts/{attemptId}/submit", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.score").value(100))
                .andExpect(jsonPath("$.data.passed").value(true));
    }
}
