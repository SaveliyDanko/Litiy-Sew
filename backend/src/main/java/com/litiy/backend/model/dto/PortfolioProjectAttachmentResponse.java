package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.PortfolioProjectAttachment;

public record PortfolioProjectAttachmentResponse(
        Long id,
        Long projectId,
        String kind,
        String label,
        String url,
        String fileKey,
        Long fileSize,
        String contentType,
        int sortOrder,
        String createdAt
) {
    public static PortfolioProjectAttachmentResponse from(PortfolioProjectAttachment a) {
        return new PortfolioProjectAttachmentResponse(
                a.getId(),
                a.getProjectId(),
                a.getKind(),
                a.getLabel(),
                a.getUrl(),
                a.getFileKey(),
                a.getFileSize(),
                a.getContentType(),
                a.getSortOrder() != null ? a.getSortOrder() : 0,
                a.getCreatedAt().toString()
        );
    }
}
