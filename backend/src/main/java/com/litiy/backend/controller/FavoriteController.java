package com.litiy.backend.controller;

import com.litiy.backend.model.dto.FavoriteRequest;
import com.litiy.backend.model.dto.FavoriteResponse;
import com.litiy.backend.service.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<FavoriteResponse>> list(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(favoriteService.list(principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<FavoriteResponse> add(@AuthenticationPrincipal UserDetails principal,
                                                @Valid @RequestBody FavoriteRequest request) {
        return ResponseEntity.ok(favoriteService.add(principal.getUsername(), request));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal UserDetails principal,
                                       @PathVariable String productId) {
        favoriteService.remove(principal.getUsername(), productId);
        return ResponseEntity.noContent().build();
    }
}
