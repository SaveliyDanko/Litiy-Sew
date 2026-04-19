package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateFirstNameRequest(
        @NotBlank @Size(max = 100) String firstName
) {
}
