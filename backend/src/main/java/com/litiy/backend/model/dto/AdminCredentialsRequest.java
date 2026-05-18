package com.litiy.backend.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record AdminCredentialsRequest(
        @Email String email,
        @Size(min = 8) String password
) {}
