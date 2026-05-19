package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.HeroBanner;

import java.time.Instant;

public record HeroBannerResponse(
        Long id,
        String imageUrl,
        String imageKey,
        String imageUrlMobile,
        String imageKeyMobile,
        int positionX,
        int positionY,
        int positionXMobile,
        int positionYMobile,
        int scale,
        int scaleMobile,
        Instant createdAt
) {
    public static HeroBannerResponse from(HeroBanner b) {
        return new HeroBannerResponse(
                b.getId(),
                b.getImageUrl(),
                b.getImageKey(),
                b.getImageUrlMobile(),
                b.getImageKeyMobile(),
                b.getPositionX() != null ? b.getPositionX() : 50,
                b.getPositionY() != null ? b.getPositionY() : 50,
                b.getPositionXMobile() != null ? b.getPositionXMobile() : 50,
                b.getPositionYMobile() != null ? b.getPositionYMobile() : 50,
                b.getScale() != null ? b.getScale() : 100,
                b.getScaleMobile() != null ? b.getScaleMobile() : 100,
                b.getCreatedAt()
        );
    }
}
