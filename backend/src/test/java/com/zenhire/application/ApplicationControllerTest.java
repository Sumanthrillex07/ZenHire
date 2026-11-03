package com.zenhire.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.application.controller.ApplicationController;
import com.zenhire.application.dto.*;
import com.zenhire.application.entity.ApplicationStatus;
import com.zenhire.application.entity.InterviewMode;
import com.zenhire.application.entity.InterviewStatus;
import com.zenhire.application.service.ApplicationService;
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

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ApplicationService applicationService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/v1/jobs/{jobId}/apply - 201 Created")
    void shouldApplyForJob() throws Exception {
        UUID jobId = UUID.randomUUID();
        ApplicationResponseDto responseDto = new ApplicationResponseDto(
                UUID.randomUUID(), jobId, "Backend Dev", "Acme", RoleCategory.BACKEND, 88,
                List.of("Java"), List.of(), ApplicationStatus.APPLIED, Instant.now(), null
        );

        when(applicationService.applyForJob(any(), any())).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/jobs/{jobId}/apply", jobId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.matchScore").value(88))
                .andExpect(jsonPath("$.data.status").value("APPLIED"));
    }

    @Test
    @DisplayName("GET /api/v1/candidate/applications - 200 OK")
    void shouldGetCandidateApplications() throws Exception {
        ApplicationResponseDto responseDto = new ApplicationResponseDto(
                UUID.randomUUID(), UUID.randomUUID(), "Backend Dev", "Acme", RoleCategory.BACKEND, 88,
                List.of("Java"), List.of(), ApplicationStatus.APPLIED, Instant.now(), null
        );

        when(applicationService.getCandidateApplications(any())).thenReturn(List.of(responseDto));

        mockMvc.perform(get("/api/v1/candidate/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].jobTitle").value("Backend Dev"));
    }

    @Test
    @DisplayName("GET /api/v1/jobs/{jobId}/applicants - 200 OK")
    void shouldGetJobApplicants() throws Exception {
        UUID jobId = UUID.randomUUID();
        ApplicantDetailDto applicantDto = new ApplicantDetailDto(
                UUID.randomUUID(), UUID.randomUUID(), "Jane Doe", "jane@example.com", 92,
                List.of("Java", "Spring Boot"), List.of(), ApplicationStatus.SHORTLISTED,
                Instant.now(), "/uploads/resume.pdf", null
        );

        when(applicationService.getJobApplicants(any(), any(), any())).thenReturn(List.of(applicantDto));

        mockMvc.perform(get("/api/v1/jobs/{jobId}/applicants", jobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].candidateName").value("Jane Doe"))
                .andExpect(jsonPath("$.data[0].matchScore").value(92));
    }

    @Test
    @DisplayName("PATCH /api/v1/applications/{applicationId}/status - 200 OK")
    void shouldUpdateApplicationStatus() throws Exception {
        UUID appId = UUID.randomUUID();
        UpdateApplicationStatusDto statusDto = new UpdateApplicationStatusDto(ApplicationStatus.SHORTLISTED);

        ApplicationResponseDto responseDto = new ApplicationResponseDto(
                appId, UUID.randomUUID(), "Backend Dev", "Acme", RoleCategory.BACKEND, 88,
                List.of("Java"), List.of(), ApplicationStatus.SHORTLISTED, Instant.now(), null
        );

        when(applicationService.updateApplicationStatus(any(), any(), any())).thenReturn(responseDto);

        mockMvc.perform(patch("/api/v1/applications/{applicationId}/status", appId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SHORTLISTED"));
    }

    @Test
    @DisplayName("POST /api/v1/applications/{applicationId}/interview - 200 OK")
    void shouldScheduleInterview() throws Exception {
        UUID appId = UUID.randomUUID();
        ScheduleInterviewRequestDto request = new ScheduleInterviewRequestDto(
                Instant.now().plusSeconds(86400), InterviewMode.ONLINE, "Round 1"
        );

        InterviewDetailsDto interviewDto = new InterviewDetailsDto(
                UUID.randomUUID(), Instant.now().plusSeconds(86400), InterviewMode.ONLINE, InterviewStatus.SCHEDULED, "Round 1"
        );

        when(applicationService.scheduleInterview(any(), any(), any())).thenReturn(interviewDto);

        mockMvc.perform(post("/api/v1/applications/{applicationId}/interview", appId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.mode").value("ONLINE"));
    }
}
