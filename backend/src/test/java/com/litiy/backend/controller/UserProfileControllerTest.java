package com.litiy.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.litiy.backend.model.entity.Role;
import com.litiy.backend.model.entity.User;
import com.litiy.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        userRepository.save(User.builder()
                .email("alice@example.com")
                .passwordHash("encoded-password")
                .emailVerified(true)
                .role(Role.USER)
                .createdAt(Instant.now())
                .build());
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void updatesFirstNameSeparately() throws Exception {
        mockMvc.perform(patch("/api/users/me/first-name")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(Map.of("firstName", " Alice "))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.lastName").doesNotExist())
                .andExpect(jsonPath("$.phoneNumber").doesNotExist());

        User user = userRepository.findByEmail("alice@example.com").orElseThrow();
        assertThat(user.getFirstName()).isEqualTo("Alice");
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void updatesProfileFieldsTogether() throws Exception {
        mockMvc.perform(patch("/api/users/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(Map.of(
                                "firstName", "Alice",
                                "lastName", "Johnson",
                                "phoneNumber", "+7 (999) 123-45-67"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.lastName").value("Johnson"))
                .andExpect(jsonPath("$.phoneNumber").value("+79991234567"));

        User user = userRepository.findByEmail("alice@example.com").orElseThrow();
        assertThat(user.getFirstName()).isEqualTo("Alice");
        assertThat(user.getLastName()).isEqualTo("Johnson");
        assertThat(user.getPhoneNumber()).isEqualTo("+79991234567");
    }
}
