package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.PortfolioProjectPhoto;

public record PortfolioProjectPhotoResponse(
        Long id,
        Long projectId,
        String imageUrl,
        String imageKey,
        String imageSrcSet,
        int positionX,
        int positionY,
        int scale,
        int sortOrder,
        String createdAt
) {
    public static PortfolioProjectPhotoResponse from(PortfolioProjectPhoto p) {
        return new PortfolioProjectPhotoResponse(
                p.getId(),
                p.getProjectId(),
                p.getImageUrl(),
                p.getImageKey(),
                p.getImageSrcSet(),
                p.getPositionX() != null ? p.getPositionX() : 50,
                p.getPositionY() != null ? p.getPositionY() : 50,
                p.getScale() != null ? p.getScale() : 100,
                p.getSortOrder() != null ? p.getSortOrder() : 0,
                p.getCreatedAt().toString()
        );
    }
}
