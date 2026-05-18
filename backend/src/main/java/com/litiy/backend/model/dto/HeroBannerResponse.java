package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.HeroBanner;

import java.time.Instant;

public record HeroBannerResponse(
        Long id,
        String imageUrl,
        String imageKey,
        int positionX,
        int positionY,
        Instant createdAt
) {
    public static HeroBannerResponse from(HeroBanner b) {
        return new HeroBannerResponse(
                b.getId(),
                b.getImageUrl(),
                b.getImageKey(),
                b.getPositionX() != null ? b.getPositionX() : 50,
                b.getPositionY() != null ? b.getPositionY() : 50,
                b.getCreatedAt()
        );
    }
}
