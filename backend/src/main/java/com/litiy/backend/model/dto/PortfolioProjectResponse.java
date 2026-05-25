package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.PortfolioProject;
import com.litiy.backend.model.entity.PortfolioProjectAttachment;
import com.litiy.backend.model.entity.PortfolioProjectPhoto;

import java.time.Instant;
import java.util.List;

public record PortfolioProjectResponse(
        Long id,
        String eyebrow,
        String title,
        String meta,
        String lead,
        String paragraph1,
        String paragraph2,
        String paragraph3,
        String imageUrl,
        String imageKey,
        String imageSrcSet,
        Integer positionX,
        Integer positionY,
        Integer scale,
        Integer sortOrder,
        Boolean attachmentsEnabled,
        Instant createdAt,
        List<PortfolioProjectPhotoResponse> photos,
        List<PortfolioProjectAttachmentResponse> attachments
) {
    public static PortfolioProjectResponse from(PortfolioProject p,
                                                 List<PortfolioProjectPhoto> photos,
                                                 List<PortfolioProjectAttachment> attachments) {
        return new PortfolioProjectResponse(
                p.getId(),
                p.getEyebrow(),
                p.getTitle(),
                p.getMeta(),
                p.getLead(),
                p.getParagraph1(),
                p.getParagraph2(),
                p.getParagraph3(),
                p.getImageUrl(),
                p.getImageKey(),
                p.getImageSrcSet(),
                p.getPositionX() != null ? p.getPositionX() : 50,
                p.getPositionY() != null ? p.getPositionY() : 50,
                p.getScale() != null ? p.getScale() : 100,
                p.getSortOrder() != null ? p.getSortOrder() : 0,
                p.getAttachmentsEnabled() != null ? p.getAttachmentsEnabled() : Boolean.FALSE,
                p.getCreatedAt(),
                photos.stream().map(PortfolioProjectPhotoResponse::from).toList(),
                attachments.stream().map(PortfolioProjectAttachmentResponse::from).toList()
        );
    }

    public static PortfolioProjectResponse from(PortfolioProject p, List<PortfolioProjectPhoto> photos) {
        return from(p, photos, List.of());
    }

    public static PortfolioProjectResponse from(PortfolioProject p) {
        return from(p, List.of(), List.of());
    }
}
