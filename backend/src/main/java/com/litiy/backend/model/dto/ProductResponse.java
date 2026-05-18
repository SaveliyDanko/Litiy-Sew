package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.Product;

import java.time.Instant;

public record ProductResponse(
        Long id,
        String title,
        Integer price,
        String description,
        String imageUrl,
        String imageKey,
        Instant createdAt
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getTitle(),
                p.getPrice(),
                p.getDescription(),
                p.getImageUrl(),
                p.getImageKey(),
                p.getCreatedAt()
        );
    }
}
