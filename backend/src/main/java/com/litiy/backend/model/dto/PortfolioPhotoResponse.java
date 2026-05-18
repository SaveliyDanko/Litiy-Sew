package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.PortfolioPhoto;

import java.time.Instant;

public record PortfolioPhotoResponse(
        Long id,
        String photoUrl,
        String photoKey,
        String caption,
        Integer sortOrder,
        Instant createdAt
) {
    public static PortfolioPhotoResponse from(PortfolioPhoto p) {
        return new PortfolioPhotoResponse(
                p.getId(),
                p.getPhotoUrl(),
                p.getPhotoKey(),
                p.getCaption(),
                p.getSortOrder(),
                p.getCreatedAt()
        );
    }
}
