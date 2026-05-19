package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;

public record SiteImageRequest(
        @NotBlank String slotKey,
        @NotBlank String imageUrl,
        @NotBlank String imageKey,
        Integer positionX,
        Integer positionY,
        Integer scale
) {}
