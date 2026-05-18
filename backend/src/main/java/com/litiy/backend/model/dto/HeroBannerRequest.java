package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;

public record HeroBannerRequest(
        @NotBlank String imageUrl,
        @NotBlank String imageKey,
        Integer positionX,
        Integer positionY
) {}
