package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.PatternItem;

import java.time.Instant;

public record PatternItemResponse(
        Long id,
        String title,
        String category,
        Integer price,
        String description,
        String previewUrl,
        String previewKey,
        String previewSrcSet,
        String sizes,
        String heights,
        Instant createdAt
) {
    public static PatternItemResponse from(PatternItem p) {
        return new PatternItemResponse(
                p.getId(),
                p.getTitle(),
                p.getCategory(),
                p.getPrice(),
                p.getDescription(),
                p.getPreviewUrl(),
                p.getPreviewKey(),
                p.getPreviewSrcSet(),
                p.getSizes(),
                p.getHeights(),
                p.getCreatedAt()
        );
    }
}
