package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;

public record HeroBannerRequest(
        @NotBlank String imageUrl,
        @NotBlank String imageKey,
        String imageSrcSet,
        String imageUrlMobile,
        String imageKeyMobile,
        String imageSrcSetMobile,
        String imageUrlTablet,
        String imageKeyTablet,
        String imageSrcSetTablet,
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
