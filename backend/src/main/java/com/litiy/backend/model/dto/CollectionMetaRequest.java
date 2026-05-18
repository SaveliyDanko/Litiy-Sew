package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;

public record CollectionMetaRequest(
        @NotBlank String title,
        String subtitle
) {}
