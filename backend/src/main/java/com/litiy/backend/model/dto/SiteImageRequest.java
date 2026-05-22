package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SiteImageRequest(
        @NotBlank String slotKey,
        @NotNull String imageUrl,
        @NotNull String imageKey,
        String imageSrcSet,
        Integer positionX,
        Integer positionY,
        Integer scale,
        Integer containerHeight,
        Integer containerHeightMobile
) {}
