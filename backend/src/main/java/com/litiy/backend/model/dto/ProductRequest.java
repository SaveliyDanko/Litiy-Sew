package com.litiy.backend.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductRequest(
        @NotBlank String title,
        @NotNull @Min(0) Integer price,
        String description,
        @NotBlank String imageUrl,
        @NotBlank String imageKey
) {}
