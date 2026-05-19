package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;

public record HeroBannerRequest(
        @NotBlank String imageUrl,
        @NotBlank String imageKey,
        String imageUrlMobile,
        String imageKeyMobile,
        Integer positionX,
        Integer positionY,
        Integer positionXMobile,
        Integer positionYMobile
) {}
