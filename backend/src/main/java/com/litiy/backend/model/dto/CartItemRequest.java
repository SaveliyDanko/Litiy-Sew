package com.litiy.backend.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CartItemRequest(
        @NotBlank @Size(max = 128) String productId,
        @NotBlank @Size(max = 255) String title,
        @NotNull @PositiveOrZero Integer price,
        @NotBlank @Size(max = 512) String image,
        @NotBlank @Size(max = 32) String height,
        @NotBlank @Size(max = 16) String size,
        @NotNull @Min(1) Integer quantity
) {}
