package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.PortfolioPhoto;

import java.time.Instant;

public record PortfolioPhotoResponse(
        Long id,
        String photoUrl,
        String photoKey,
        String caption,
        Integer sortOrder,
        Integer positionX,
        Integer positionY,
        Integer scale,
        Instant createdAt
) {
    public static PortfolioPhotoResponse from(PortfolioPhoto p) {
        return new PortfolioPhotoResponse(
                p.getId(),
                p.getPhotoUrl(),
                p.getPhotoKey(),
                p.getCaption(),
                p.getSortOrder(),
                p.getPositionX() != null ? p.getPositionX() : 50,
                p.getPositionY() != null ? p.getPositionY() : 50,
                p.getScale() != null ? p.getScale() : 100,
                p.getCreatedAt()
        );
    }
}
