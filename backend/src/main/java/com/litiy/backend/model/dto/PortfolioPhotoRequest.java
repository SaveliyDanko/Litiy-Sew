package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;

public record PortfolioPhotoRequest(
        @NotBlank String photoUrl,
        @NotBlank String photoKey,
        String photoSrcSet,
        String caption,
        Integer sortOrder,
        Integer positionX,
        Integer positionY,
        Integer scale
) {}
