package com.zenhire.recruiter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.recruiter.controller.RecruiterController;
import com.zenhire.recruiter.dto.RecruiterProfileDto;
import com.zenhire.recruiter.dto.RecruiterProfileUpdateDto;
import com.zenhire.recruiter.service.RecruiterService;
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
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RecruiterController.class)
@AutoConfigureMockMvc(addFilters = false)
class RecruiterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RecruiterService recruiterService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("GET /api/v1/recruiter/profile - 200 OK")
    void shouldGetProfile() throws Exception {
        UUID recruiterId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        RecruiterProfileDto dto = new RecruiterProfileDto(
                recruiterId, userId, "Acme HR", "hr@acme.com",
                "Acme Corporation", Instant.now()
        );

        when(recruiterService.getProfile(any())).thenReturn(dto);

        mockMvc.perform(get("/api/v1/recruiter/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Acme HR"))
                .andExpect(jsonPath("$.data.companyName").value("Acme Corporation"));
    }

    @Test
    @DisplayName("PUT /api/v1/recruiter/profile - 200 OK on update")
    void shouldUpdateProfile() throws Exception {
        UUID recruiterId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        RecruiterProfileUpdateDto updateDto = new RecruiterProfileUpdateDto("Acme Global HR", "Acme Global");

        RecruiterProfileDto dto = new RecruiterProfileDto(
                recruiterId, userId, "Acme Global HR", "hr@acme.com",
                "Acme Global", Instant.now()
        );

        when(recruiterService.updateProfile(any(), any())).thenReturn(dto);

        mockMvc.perform(put("/api/v1/recruiter/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Acme Global HR"))
                .andExpect(jsonPath("$.data.companyName").value("Acme Global"));
    }
}

