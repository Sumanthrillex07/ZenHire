package com.zenhire.matching;

import com.zenhire.matching.controller.MatchingController;
import com.zenhire.matching.dto.MatchResultDto;
import com.zenhire.matching.service.MatchingService;
import com.zenhire.security.CustomUserDetailsService;
import com.zenhire.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MatchingController.class)
@AutoConfigureMockMvc(addFilters = false)
class MatchingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MatchingService matchingService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("GET /api/v1/jobs/{jobId}/match - 200 OK with MatchResultDto")
    void shouldReturnJobMatch() throws Exception {
        UUID jobId = UUID.randomUUID();

        MatchResultDto dto = new MatchResultDto(
                85,
                90,
                78,
                List.of("Java", "Spring Boot"),
                List.of("Kubernetes"),
                "Candidate has strong backend experience."
        );

        when(matchingService.calculateCandidateJobMatch(any(), any())).thenReturn(dto);

        mockMvc.perform(get("/api/v1/jobs/{jobId}/match", jobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.matchScore").value(85))
                .andExpect(jsonPath("$.data.skillOverlapScore").value(90))
                .andExpect(jsonPath("$.data.llmFitScore").value(78))
                .andExpect(jsonPath("$.data.matchedSkills[0]").value("Java"));
    }
}

