package com.zenhire.candidate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenhire.candidate.controller.CandidateController;
import com.zenhire.candidate.dto.CandidateProfileDto;
import com.zenhire.candidate.dto.CandidateProfileUpdateDto;
import com.zenhire.candidate.service.CandidateService;
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

@WebMvcTest(CandidateController.class)
@AutoConfigureMockMvc(addFilters = false)
class CandidateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CandidateService candidateService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("GET /api/v1/candidate/profile - 200 OK")
    void shouldGetProfile() throws Exception {
        UUID candidateId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        CandidateProfileDto dto = new CandidateProfileDto(
                candidateId, userId, "Jane Doe", "jane@example.com",
                "+1234567890", "Backend Engineer", Instant.now()
        );

        when(candidateService.getProfile(any())).thenReturn(dto);

        mockMvc.perform(get("/api/v1/candidate/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Jane Doe"))
                .andExpect(jsonPath("$.data.phone").value("+1234567890"));
    }

    @Test
    @DisplayName("PUT /api/v1/candidate/profile - 200 OK on update")
    void shouldUpdateProfile() throws Exception {
        UUID candidateId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        CandidateProfileUpdateDto updateDto = new CandidateProfileUpdateDto("Jane Smith", "+1987654321", "Lead Dev");

        CandidateProfileDto dto = new CandidateProfileDto(
                candidateId, userId, "Jane Smith", "jane@example.com",
                "+1987654321", "Lead Dev", Instant.now()
        );

        when(candidateService.updateProfile(any(), any())).thenReturn(dto);

        mockMvc.perform(put("/api/v1/candidate/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Jane Smith"))
                .andExpect(jsonPath("$.data.headline").value("Lead Dev"));
    }
}

