package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.FavoriteItem;

public record FavoriteResponse(
        String productId,
        String title,
        Integer price,
        String image
) {
    public static FavoriteResponse from(FavoriteItem item) {
        return new FavoriteResponse(item.getProductId(), item.getTitle(), item.getPrice(), item.getImage());
    }
}
