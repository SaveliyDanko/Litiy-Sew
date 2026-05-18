package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.CollectionMeta;

public record CollectionMetaResponse(
        Long id,
        String slug,
        String title,
        String subtitle
) {
    public static CollectionMetaResponse from(CollectionMeta m) {
        return new CollectionMetaResponse(m.getId(), m.getSlug(), m.getTitle(), m.getSubtitle());
    }
}
