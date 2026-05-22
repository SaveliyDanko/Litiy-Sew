package com.litiy.backend.service;

import com.litiy.backend.model.dto.SiteImageRequest;
import com.litiy.backend.model.dto.SiteImageResponse;
import com.litiy.backend.model.entity.SiteImage;
import com.litiy.backend.repository.SiteImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SiteImageService {

    private final SiteImageRepository repo;
    private final MediaService mediaService;

    @Transactional(readOnly = true)
    public List<SiteImageResponse> listAll() {
        return repo.findAllByOrderBySlotKeyAsc()
                .stream().map(SiteImageResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Optional<SiteImageResponse> getBySlot(String slotKey) {
        return repo.findBySlotKey(slotKey).map(SiteImageResponse::from);
    }

    public SiteImageResponse upsert(SiteImageRequest req) {
        SiteImage existing = repo.findBySlotKey(req.slotKey()).orElse(null);
        if (existing != null) {
            // delete old file only if image changed
            if (!existing.getImageKey().equals(req.imageKey())) {
                mediaService.deleteFile(existing.getImageKey());
            }
            existing.setImageUrl(req.imageUrl());
            existing.setImageKey(req.imageKey());
            existing.setImageSrcSet(req.imageSrcSet());
            existing.setPositionX(req.positionX() != null ? req.positionX() : existing.getPositionX());
            existing.setPositionY(req.positionY() != null ? req.positionY() : existing.getPositionY());
            existing.setScale(req.scale() != null ? req.scale() : existing.getScale());
            existing.setContainerHeight(req.containerHeight() != null ? req.containerHeight() : existing.getContainerHeight());
            existing.setContainerHeightMobile(req.containerHeightMobile() != null ? req.containerHeightMobile() : existing.getContainerHeightMobile());
            existing.setUpdatedAt(Instant.now());
            return SiteImageResponse.from(repo.save(existing));
        }
        SiteImage created = SiteImage.builder()
                .slotKey(req.slotKey())
                .imageUrl(req.imageUrl())
                .imageKey(req.imageKey())
                .imageSrcSet(req.imageSrcSet())
                .positionX(req.positionX() != null ? req.positionX() : 50)
                .positionY(req.positionY() != null ? req.positionY() : 50)
                .scale(req.scale() != null ? req.scale() : 100)
                .containerHeight(req.containerHeight() != null ? req.containerHeight() : 0)
                .containerHeightMobile(req.containerHeightMobile() != null ? req.containerHeightMobile() : 0)
                .updatedAt(Instant.now())
                .build();
        return SiteImageResponse.from(repo.save(created));
    }

    public Optional<SiteImageResponse> updatePosition(String slotKey, int positionX, int positionY, int scale, int containerHeight, int containerHeightMobile) {
        return repo.findBySlotKey(slotKey).map(img -> {
            img.setPositionX(positionX);
            img.setPositionY(positionY);
            img.setScale(scale);
            img.setContainerHeight(containerHeight);
            img.setContainerHeightMobile(containerHeightMobile);
            img.setUpdatedAt(Instant.now());
            return SiteImageResponse.from(repo.save(img));
        });
    }

    public void delete(String slotKey) {
        repo.findBySlotKey(slotKey).ifPresent(img -> {
            mediaService.deleteFile(img.getImageKey());
            repo.delete(img);
        });
    }
}
