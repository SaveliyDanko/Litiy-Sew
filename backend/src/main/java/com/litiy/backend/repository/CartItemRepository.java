package com.litiy.backend.repository;

import com.litiy.backend.model.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<CartItem> findByIdAndUserId(Long id, Long userId);

    Optional<CartItem> findByUserIdAndProductIdAndHeightAndSize(
            Long userId, String productId, String height, String size);

    void deleteByUserId(Long userId);
}
