package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PortfolioProjectRequest(
        @Size(max = 128) String eyebrow,
        @NotBlank @Size(max = 256) String title,
        @Size(max = 256) String meta,
        String lead,
        String paragraph1,
        String paragraph2,
        @Size(max = 512) String imageUrl,
        @Size(max = 512) String imageKey,
        String imageSrcSet,
        Integer positionX,
        Integer positionY,
        Integer scale,
        Integer sortOrder
) {}
