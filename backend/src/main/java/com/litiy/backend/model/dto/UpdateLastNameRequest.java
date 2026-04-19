package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateLastNameRequest(
        @NotBlank @Size(max = 100) String lastName
) {
}
