package com.litiy.backend.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PatternItemRequest(
        @NotBlank String title,
        @NotBlank String category,
        @NotNull @Min(0) Integer price,
        String description,
        @NotBlank String previewUrl,
        @NotBlank String previewKey,
        @NotBlank String sizes,
        @NotBlank String heights
) {}
