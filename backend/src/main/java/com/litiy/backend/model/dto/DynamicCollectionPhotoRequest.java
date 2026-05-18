package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DynamicCollectionPhotoRequest(
        @NotBlank @Size(max = 512) String imageUrl,
        @NotBlank @Size(max = 512) String imageKey,
        @NotBlank @Pattern(regexp = "^(CARD|HERO|GALLERY)$") String photoType,
        Integer positionX,
        Integer positionY,
        Integer sortOrder
) {}
