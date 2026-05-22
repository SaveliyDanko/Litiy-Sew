package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;

public record HeroBannerRequest(
        @NotBlank String imageUrl,
        @NotBlank String imageKey,
        String imageUrlMobile,
        String imageKeyMobile,
        String imageUrlTablet,
        String imageKeyTablet,
        Integer positionX,
        Integer positionY,
        Integer positionXMobile,
        Integer positionYMobile,
        Integer positionXTablet,
        Integer positionYTablet,
        Integer scale,
        Integer scaleMobile,
        Integer scaleTablet
) {}
