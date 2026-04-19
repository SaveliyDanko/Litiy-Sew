package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginVerifyRequest(
        @NotBlank String challengeId,
        @NotBlank @Pattern(regexp = "\\d{4,8}") String code
) {
}
