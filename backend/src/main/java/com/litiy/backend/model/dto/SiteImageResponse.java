package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.SiteImage;

public record SiteImageResponse(
        Long id,
        String slotKey,
        String imageUrl,
        String imageKey,
        int positionX,
        int positionY,
        int scale
) {
    public static SiteImageResponse from(SiteImage s) {
        return new SiteImageResponse(
                s.getId(),
                s.getSlotKey(),
                s.getImageUrl(),
                s.getImageKey(),
                s.getPositionX() != null ? s.getPositionX() : 50,
                s.getPositionY() != null ? s.getPositionY() : 50,
                s.getScale() != null ? s.getScale() : 100
        );
    }
}
