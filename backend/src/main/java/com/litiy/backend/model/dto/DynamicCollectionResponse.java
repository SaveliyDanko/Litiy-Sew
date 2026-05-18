package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.DynamicCollection;

import java.util.List;

public record DynamicCollectionResponse(
        Long id,
        String slug,
        String title,
        String subtitle,
        String eyebrow,
        String description,
        String detailIntro,
        String detailFocus,
        String tone,
        int sortOrder,
        boolean featured,
        String createdAt,
        List<DynamicCollectionPhotoResponse> photos
) {
    public static DynamicCollectionResponse from(DynamicCollection c, List<DynamicCollectionPhotoResponse> photos) {
        return new DynamicCollectionResponse(
                c.getId(),
                c.getSlug(),
                c.getTitle(),
                c.getSubtitle(),
                c.getEyebrow(),
                c.getDescription(),
                c.getDetailIntro(),
                c.getDetailFocus(),
                c.getTone() != null ? c.getTone() : "neutral",
                c.getSortOrder() != null ? c.getSortOrder() : 0,
                Boolean.TRUE.equals(c.getFeatured()),
                c.getCreatedAt().toString(),
                photos
        );
    }
}
