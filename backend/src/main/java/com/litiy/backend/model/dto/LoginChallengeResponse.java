package com.litiy.backend.model.dto;

public record LoginChallengeResponse(
        String challengeId,
        String email,
        long expiresInSeconds
) {
}
