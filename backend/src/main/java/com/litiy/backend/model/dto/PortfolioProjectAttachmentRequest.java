package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PortfolioProjectAttachmentRequest(
        @NotBlank
        @Pattern(regexp = "FILE|LINK", message = "kind must be FILE or LINK")
        String kind,
        @Size(max = 256) String label,
        @NotBlank @Size(max = 1024) String url,
        @Size(max = 512) String fileKey,
        Long fileSize,
        @Size(max = 128) String contentType
) {}
