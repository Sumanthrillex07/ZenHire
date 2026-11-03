package com.zenhire.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.common.dto.PageResponse;
import com.zenhire.job.controller.JobController;
import com.zenhire.job.dto.CreateJobRequestDto;
import com.zenhire.job.dto.JobResponseDto;
import com.zenhire.job.dto.UpdateJobStatusDto;
import com.zenhire.job.entity.JobStatus;
import com.zenhire.job.entity.RoleCategory;
import com.zenhire.job.service.JobService;
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

@WebMvcTest(JobController.class)
@AutoConfigureMockMvc(addFilters = false)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JobService jobService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/v1/jobs - 201 Created on valid job creation")
    void shouldCreateJobSuccessfully() throws Exception {
        CreateJobRequestDto request = new CreateJobRequestDto(
                "Full Stack Developer",
                "Work on React & Java",
                List.of("React", "Java"),
                RoleCategory.FRONTEND
        );

        JobResponseDto responseDto = new JobResponseDto(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "Acme Corp",
                "Full Stack Developer",
                "Work on React & Java",
                List.of("React", "Java"),
                RoleCategory.FRONTEND,
                JobStatus.OPEN,
                0L,
                Instant.now(),
                Instant.now()
        );

        when(jobService.createJob(any(), any())).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Full Stack Developer"))
                .andExpect(jsonPath("$.data.roleCategory").value("FRONTEND"));
    }

    @Test
    @DisplayName("POST /api/v1/jobs - 400 Bad Request on missing title")
    void shouldFailValidationOnMissingTitle() throws Exception {
        CreateJobRequestDto request = new CreateJobRequestDto(
                "",
                "Work on React & Java",
                List.of("React", "Java"),
                RoleCategory.FRONTEND
        );

        mockMvc.perform(post("/api/v1/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.errorCode").value("VALIDATION_FAILED"));
    }

    @Test
    @DisplayName("GET /api/v1/jobs - 200 OK with PageResponse")
    void shouldGetJobs() throws Exception {
        JobResponseDto responseDto = new JobResponseDto(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "Acme Corp",
                "Full Stack Developer",
                "Work on React & Java",
                List.of("React", "Java"),
                RoleCategory.FRONTEND,
                JobStatus.OPEN,
                0L,
                Instant.now(),
                Instant.now()
        );

        PageResponse<JobResponseDto> pageResponse = PageResponse.of(List.of(responseDto), 0, 10, 1, 1, true);
        when(jobService.getJobs(any(), any(), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].title").value("Full Stack Developer"));
    }

    @Test
    @DisplayName("PATCH /api/v1/jobs/{id}/status - 200 OK on valid status update")
    void shouldUpdateJobStatus() throws Exception {
        UUID jobId = UUID.randomUUID();
        UpdateJobStatusDto statusDto = new UpdateJobStatusDto(JobStatus.CLOSED);

        JobResponseDto responseDto = new JobResponseDto(
                jobId,
                UUID.randomUUID(),
                "Acme Corp",
                "Full Stack Developer",
                "Work on React & Java",
                List.of("React", "Java"),
                RoleCategory.FRONTEND,
                JobStatus.CLOSED,
                0L,
                Instant.now(),
                Instant.now()
        );

        when(jobService.updateJobStatus(any(), any(), any())).thenReturn(responseDto);

        mockMvc.perform(patch("/api/v1/jobs/{id}/status", jobId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CLOSED"));
    }
}
