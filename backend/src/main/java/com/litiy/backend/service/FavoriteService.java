package com.litiy.backend.service;

import com.litiy.backend.model.dto.FavoriteRequest;
import com.litiy.backend.model.dto.FavoriteResponse;
import com.litiy.backend.model.entity.FavoriteItem;
import com.litiy.backend.model.entity.User;
import com.litiy.backend.repository.FavoriteItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteItemRepository favoriteItemRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<FavoriteResponse> list(String username) {
        User user = userService.getByEmail(username);
        return favoriteItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(FavoriteResponse::from)
                .toList();
    }

    @Transactional
    public FavoriteResponse add(String username, FavoriteRequest request) {
        User user = userService.getByEmail(username);
        FavoriteItem item = favoriteItemRepository
                .findByUserIdAndProductId(user.getId(), request.productId())
                .orElseGet(() -> FavoriteItem.builder()
                        .user(user)
                        .productId(request.productId())
                        .createdAt(Instant.now())
                        .build());
        item.setTitle(request.title());
        item.setPrice(request.price());
        item.setImage(request.image());
        return FavoriteResponse.from(favoriteItemRepository.save(item));
    }

    @Transactional
    public void remove(String username, String productId) {
        User user = userService.getByEmail(username);
        favoriteItemRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }
}
