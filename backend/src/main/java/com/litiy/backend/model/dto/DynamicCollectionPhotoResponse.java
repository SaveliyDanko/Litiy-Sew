package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.DynamicCollectionPhoto;

public record DynamicCollectionPhotoResponse(
        Long id,
        Long collectionId,
        String photoType,
        String imageUrl,
        String imageKey,
        int positionX,
        int positionY,
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
                p.getPositionX() != null ? p.getPositionX() : 50,
                p.getPositionY() != null ? p.getPositionY() : 50,
                p.getSortOrder() != null ? p.getSortOrder() : 0,
                p.getCreatedAt().toString()
        );
    }
}
