package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record FavoriteRequest(
        @NotBlank @Size(max = 128) String productId,
        @NotBlank @Size(max = 255) String title,
        @NotNull @PositiveOrZero Integer price,
        @NotBlank @Size(max = 512) String image
) {}
