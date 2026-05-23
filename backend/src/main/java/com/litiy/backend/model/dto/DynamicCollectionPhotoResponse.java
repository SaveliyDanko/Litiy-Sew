package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.DynamicCollectionPhoto;

public record DynamicCollectionPhotoResponse(
        Long id,
        Long collectionId,
        String photoType,
        String imageUrl,
        String imageKey,
        String imageSrcSet,
        int positionX,
        int positionY,
        int scale,
        int positionXMobile,
        int positionYMobile,
        int scaleMobile,
        int positionXTablet,
        int positionYTablet,
        int scaleTablet,
        int sortOrder,
        String createdAt
) {
    public static DynamicCollectionPhotoResponse from(DynamicCollectionPhoto p) {
        return new DynamicCollectionPhotoResponse(
                p.getId(),
                p.getCollectionId(),
                p.getPhotoType(),
                p.getImageUrl(),
                p.getImageKey(),
                p.getImageSrcSet(),
                p.getPositionX() != null ? p.getPositionX() : 50,
                p.getPositionY() != null ? p.getPositionY() : 50,
                p.getScale() != null ? p.getScale() : 100,
                p.getPositionXMobile() != null ? p.getPositionXMobile() : 50,
                p.getPositionYMobile() != null ? p.getPositionYMobile() : 50,
                p.getScaleMobile() != null ? p.getScaleMobile() : 100,
                p.getPositionXTablet() != null ? p.getPositionXTablet() : 50,
                p.getPositionYTablet() != null ? p.getPositionYTablet() : 50,
                p.getScaleTablet() != null ? p.getScaleTablet() : 100,
                p.getSortOrder() != null ? p.getSortOrder() : 0,
                p.getCreatedAt().toString()
        );
    }
}
