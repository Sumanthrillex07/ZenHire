package com.zenhire.resume;

import com.zenhire.resume.controller.ResumeController;
import com.zenhire.resume.dto.ParsedResumeDto;
import com.zenhire.resume.dto.ResumeUploadResponseDto;
import com.zenhire.resume.service.ResumeService;
import com.zenhire.security.CustomUserDetailsService;
import com.zenhire.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ResumeController.class)
@AutoConfigureMockMvc(addFilters = false)
class ResumeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResumeService resumeService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/v1/resumes - 201 Created on valid PDF upload")
    void shouldUploadResumeSuccessfully() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "resume", "test-resume.pdf", "application/pdf", "%PDF-1.4 sample content".getBytes()
        );

        ResumeUploadResponseDto responseDto = new ResumeUploadResponseDto(
                UUID.randomUUID(),
                "/uploads/test-resume.pdf",
                List.of("Java", "Spring Boot"),
                "3 yrs exp",
                "B.S. CS",
                Instant.now()
        );

        when(resumeService.uploadResume(any(), any())).thenReturn(responseDto);

        mockMvc.perform(multipart("/api/v1/resumes").file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fileUrl").value("/uploads/test-resume.pdf"))
                .andExpect(jsonPath("$.data.skills[0]").value("Java"));
    }

    @Test
    @DisplayName("GET /api/v1/resumes/latest - 200 OK")
    void shouldGetLatestResume() throws Exception {
        ParsedResumeDto responseDto = new ParsedResumeDto(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "/uploads/test-resume.pdf",
                List.of("Java", "Spring Boot"),
                "3 yrs exp",
                "B.S. CS",
                Instant.now()
        );

        when(resumeService.getLatestResume(any())).thenReturn(responseDto);

        mockMvc.perform(get("/api/v1/resumes/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fileUrl").value("/uploads/test-resume.pdf"))
                .andExpect(jsonPath("$.data.skills[0]").value("Java"));
    }
}

