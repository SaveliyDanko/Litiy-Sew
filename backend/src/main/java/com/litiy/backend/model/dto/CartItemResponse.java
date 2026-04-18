package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.CartItem;

public record CartItemResponse(
        Long id,
        String productId,
        String title,
        Integer price,
        String image,
        String height,
        String size,
        Integer quantity
) {
    public static CartItemResponse from(CartItem item) {
        return new CartItemResponse(
                item.getId(),
                item.getProductId(),
                item.getTitle(),
                item.getPrice(),
                item.getImage(),
                item.getHeight(),
                item.getSize(),
                item.getQuantity()
        );
    }
}
