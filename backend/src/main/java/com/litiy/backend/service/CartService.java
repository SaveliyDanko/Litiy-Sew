package com.litiy.backend.service;

import com.litiy.backend.model.dto.CartItemRequest;
import com.litiy.backend.model.dto.CartItemResponse;
import com.litiy.backend.model.dto.CartItemUpdateRequest;
import com.litiy.backend.model.entity.CartItem;
import com.litiy.backend.model.entity.User;
import com.litiy.backend.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<CartItemResponse> list(String username) {
        User user = userService.getByUsername(username);
        return cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(CartItemResponse::from)
                .toList();
    }

    @Transactional
    public CartItemResponse add(String username, CartItemRequest request) {
        User user = userService.getByUsername(username);
        Instant now = Instant.now();
        CartItem item = cartItemRepository
                .findByUserIdAndProductIdAndHeightAndSize(
                        user.getId(), request.productId(), request.height(), request.size())
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + request.quantity());
                    existing.setTitle(request.title());
                    existing.setPrice(request.price());
                    existing.setImage(request.image());
                    existing.setUpdatedAt(now);
                    return existing;
                })
                .orElseGet(() -> CartItem.builder()
                        .user(user)
                        .productId(request.productId())
                        .title(request.title())
                        .price(request.price())
                        .image(request.image())
                        .height(request.height())
                        .size(request.size())
                        .quantity(request.quantity())
                        .createdAt(now)
                        .updatedAt(now)
                        .build());
        return CartItemResponse.from(cartItemRepository.save(item));
    }

    @Transactional
    public CartItemResponse updateQuantity(String username, Long itemId, CartItemUpdateRequest request) {
        User user = userService.getByUsername(username);
        CartItem item = cartItemRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        item.setQuantity(request.quantity());
        item.setUpdatedAt(Instant.now());
        return CartItemResponse.from(cartItemRepository.save(item));
    }

    @Transactional
    public void remove(String username, Long itemId) {
        User user = userService.getByUsername(username);
        CartItem item = cartItemRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clear(String username) {
        User user = userService.getByUsername(username);
        cartItemRepository.deleteByUserId(user.getId());
    }
}
