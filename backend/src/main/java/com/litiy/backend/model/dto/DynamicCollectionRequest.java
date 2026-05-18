package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DynamicCollectionRequest(
        @NotBlank @Size(max = 128) @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must be lowercase letters, digits and hyphens only")
        String slug,
        @NotBlank @Size(max = 256)
        String title,
        @Size(max = 512) String subtitle,
        @Size(max = 256) String eyebrow,
        @Size(max = 1024) String description,
        @Size(max = 1024) String detailIntro,
        @Size(max = 1024) String detailFocus,
        @Pattern(regexp = "^(warm|cool|neutral)$") String tone,
        Integer sortOrder,
        Boolean featured
) {}
