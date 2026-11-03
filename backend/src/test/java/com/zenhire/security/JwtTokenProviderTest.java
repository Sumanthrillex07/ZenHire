package com.zenhire.security;

import com.zenhire.user.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    @DisplayName("Should generate valid token and extract user details")
    void shouldGenerateAndValidateToken() {
        UUID userId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();

        UserPrincipal principal = new UserPrincipal(
                userId,
                "Jane Doe",
                "jane@example.com",
                "hashedpassword",
                Role.ROLE_CANDIDATE,
                candidateId,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_CANDIDATE"))
        );

        String token = jwtTokenProvider.generateToken(principal);

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(userId);

        var claims = jwtTokenProvider.getClaimsFromToken(token);
        assertThat(claims.get("email")).isEqualTo("jane@example.com");
        assertThat(claims.get("role")).isEqualTo("ROLE_CANDIDATE");
        assertThat(claims.get("candidateId")).isEqualTo(candidateId.toString());
    }

    @Test
    @DisplayName("Should return false for invalid token")
    void shouldFailForInvalidToken() {
        assertThat(jwtTokenProvider.validateToken("invalid.token.structure")).isFalse();
    }
}

