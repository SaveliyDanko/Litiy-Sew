package com.litiy.backend.service;

import com.litiy.backend.model.dto.HeroBannerRequest;
import com.litiy.backend.model.dto.HeroBannerResponse;
import com.litiy.backend.model.entity.HeroBanner;
import com.litiy.backend.repository.HeroBannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class HeroBannerAdminService {

    private final HeroBannerRepository heroBannerRepository;
    private final MediaService mediaService;

    @Transactional(readOnly = true)
    public Optional<HeroBannerResponse> getCurrent() {
        return heroBannerRepository.findTopByOrderByCreatedAtDesc()
                .map(HeroBannerResponse::from);
    }

    public HeroBannerResponse replace(HeroBannerRequest req) {
        heroBannerRepository.findTopByOrderByCreatedAtDesc().ifPresent(existing -> {
            mediaService.deleteFile(existing.getImageKey());
            heroBannerRepository.delete(existing);
        });
        HeroBanner banner = HeroBanner.builder()
                .imageUrl(req.imageUrl())
                .imageKey(req.imageKey())
                .positionX(req.positionX() != null ? req.positionX() : 50)
                .positionY(req.positionY() != null ? req.positionY() : 50)
                .positionXMobile(req.positionXMobile() != null ? req.positionXMobile() : 50)
                .positionYMobile(req.positionYMobile() != null ? req.positionYMobile() : 50)
                .createdAt(Instant.now())
                .build();
        return HeroBannerResponse.from(heroBannerRepository.save(banner));
    }

    public Optional<HeroBannerResponse> updatePosition(int positionX, int positionY, int positionXMobile, int positionYMobile) {
        return heroBannerRepository.findTopByOrderByCreatedAtDesc().map(banner -> {
            banner.setPositionX(positionX);
            banner.setPositionY(positionY);
            banner.setPositionXMobile(positionXMobile);
            banner.setPositionYMobile(positionYMobile);
            return HeroBannerResponse.from(heroBannerRepository.save(banner));
        });
    }

    public void deleteCurrent() {
        heroBannerRepository.findTopByOrderByCreatedAtDesc().ifPresent(existing -> {
            mediaService.deleteFile(existing.getImageKey());
            heroBannerRepository.delete(existing);
        });
    }
}
