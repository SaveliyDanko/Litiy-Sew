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
        @Size(max = 256) String groupTitle,
        Boolean hideCardLabel,
        @Pattern(regexp = "^(bottom-left|bottom-center|center)$") String heroTitlePosition,
        @Pattern(regexp = "^(full|half|auto)$") String heroHeightMode,
        @Pattern(regexp = "^(warm|cool|neutral)$") String tone,
        @Pattern(regexp = "^(COLLECTION|SOLO|SKETCH)$") String category,
        Integer sortOrder,
        Boolean featured
) {}
