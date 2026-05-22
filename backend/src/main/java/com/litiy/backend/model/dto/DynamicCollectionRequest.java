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
        @Pattern(regexp = "^(top|middle|bottom)-(left|center|right)$") String heroTitlePosition,
        @Pattern(regexp = "^(full|half|auto)$") String heroHeightMode,
        @jakarta.validation.constraints.Min(10) @jakarta.validation.constraints.Max(100) Integer heroHeightMobile,
        @jakarta.validation.constraints.Min(10) @jakarta.validation.constraints.Max(100) Integer heroHeightDesktop,
        @jakarta.validation.constraints.Min(100) @jakarta.validation.constraints.Max(1200) Integer cardHeightMobile,
        @jakarta.validation.constraints.Min(100) @jakarta.validation.constraints.Max(1200) Integer cardHeightDesktop,
        @Pattern(regexp = "^(warm|cool|neutral)$") String tone,
        @Pattern(regexp = "^(COLLECTION|SOLO|SKETCH)$") String category,
        Integer sortOrder,
        Boolean featured
) {}
