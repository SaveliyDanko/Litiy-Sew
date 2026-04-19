package com.litiy.backend.model.dto;

public record RegisterResponse(
        Long userId,
        String email,
        String status,
        long expiresInSeconds
) {
}
