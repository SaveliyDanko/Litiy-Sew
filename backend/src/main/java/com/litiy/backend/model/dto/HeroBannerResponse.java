package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.HeroBanner;

import java.time.Instant;

public record HeroBannerResponse(
        Long id,
        String imageUrl,
        String imageKey,
        String imageSrcSet,
        String imageUrlMobile,
        String imageKeyMobile,
        String imageSrcSetMobile,
        String imageUrlTablet,
        String imageKeyTablet,
        String imageSrcSetTablet,
        int positionX,
        int positionY,
        int positionXMobile,
        int positionYMobile,
        int positionXTablet,
        int positionYTablet,
        int scale,
        int scaleMobile,
        int scaleTablet,
        Instant createdAt
) {
    public static HeroBannerResponse from(HeroBanner b) {
        return new HeroBannerResponse(
                b.getId(),
                b.getImageUrl(),
                b.getImageKey(),
                b.getImageSrcSet(),
                b.getImageUrlMobile(),
                b.getImageKeyMobile(),
                b.getImageSrcSetMobile(),
                b.getImageUrlTablet(),
                b.getImageKeyTablet(),
                b.getImageSrcSetTablet(),
                b.getPositionX()       != null ? b.getPositionX()       : 50,
                b.getPositionY()       != null ? b.getPositionY()       : 50,
                b.getPositionXMobile() != null ? b.getPositionXMobile() : 50,
                b.getPositionYMobile() != null ? b.getPositionYMobile() : 50,
                b.getPositionXTablet() != null ? b.getPositionXTablet() : 50,
                b.getPositionYTablet() != null ? b.getPositionYTablet() : 50,
                b.getScale()           != null ? b.getScale()           : 100,
                b.getScaleMobile()     != null ? b.getScaleMobile()     : 100,
                b.getScaleTablet()     != null ? b.getScaleTablet()     : 100,
                b.getCreatedAt()
        );
    }
}
