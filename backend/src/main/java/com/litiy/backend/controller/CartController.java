package com.litiy.backend.controller;

import com.litiy.backend.model.dto.CartItemRequest;
import com.litiy.backend.model.dto.CartItemResponse;
import com.litiy.backend.model.dto.CartItemUpdateRequest;
import com.litiy.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> list(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(cartService.list(principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<CartItemResponse> add(@AuthenticationPrincipal UserDetails principal,
                                                @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.add(principal.getUsername(), request));
    }

    @PatchMapping("/{itemId}")
    public ResponseEntity<CartItemResponse> update(@AuthenticationPrincipal UserDetails principal,
                                                   @PathVariable Long itemId,
                                                   @Valid @RequestBody CartItemUpdateRequest request) {
        return ResponseEntity.ok(cartService.updateQuantity(principal.getUsername(), itemId, request));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal UserDetails principal,
                                       @PathVariable Long itemId) {
        cartService.remove(principal.getUsername(), itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(@AuthenticationPrincipal UserDetails principal) {
        cartService.clear(principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
