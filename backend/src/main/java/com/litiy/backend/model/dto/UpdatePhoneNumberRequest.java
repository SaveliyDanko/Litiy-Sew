package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePhoneNumberRequest(
        @NotBlank @Size(max = 32) String phoneNumber
) {
}
