package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.SiteImage;

public record SiteImageResponse(
        Long id,
        String slotKey,
        String imageUrl,
        String imageKey,
        String imageSrcSet,
        int positionX,
        int positionY,
        int scale,
        int containerHeight,
        int containerHeightMobile
) {
    public static SiteImageResponse from(SiteImage s) {
        return new SiteImageResponse(
                s.getId(),
                s.getSlotKey(),
                s.getImageUrl(),
                s.getImageKey(),
                s.getImageSrcSet(),
                s.getPositionX() != null ? s.getPositionX() : 50,
                s.getPositionY() != null ? s.getPositionY() : 50,
                s.getScale() != null ? s.getScale() : 100,
                s.getContainerHeight() != null ? s.getContainerHeight() : 0,
                s.getContainerHeightMobile() != null ? s.getContainerHeightMobile() : 0
        );
    }
}
