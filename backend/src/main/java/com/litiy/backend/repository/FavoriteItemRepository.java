package com.litiy.backend.repository;

import com.litiy.backend.model.entity.FavoriteItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteItemRepository extends JpaRepository<FavoriteItem, Long> {
    List<FavoriteItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<FavoriteItem> findByUserIdAndProductId(Long userId, String productId);

    void deleteByUserIdAndProductId(Long userId, String productId);
}
