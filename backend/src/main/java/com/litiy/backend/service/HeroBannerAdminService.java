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
            if (existing.getImageKeyMobile() != null) mediaService.deleteFile(existing.getImageKeyMobile());
            if (existing.getImageKeyTablet() != null) mediaService.deleteFile(existing.getImageKeyTablet());
            heroBannerRepository.delete(existing);
        });
        HeroBanner banner = HeroBanner.builder()
                .imageUrl(req.imageUrl())
                .imageKey(req.imageKey())
                .imageSrcSet(req.imageSrcSet())
                .imageUrlMobile(req.imageUrlMobile())
                .imageKeyMobile(req.imageKeyMobile())
                .imageSrcSetMobile(req.imageSrcSetMobile())
                .imageUrlTablet(req.imageUrlTablet())
                .imageKeyTablet(req.imageKeyTablet())
                .imageSrcSetTablet(req.imageSrcSetTablet())
                .positionX(req.positionX()       != null ? req.positionX()       : 50)
                .positionY(req.positionY()       != null ? req.positionY()       : 50)
                .positionXMobile(req.positionXMobile() != null ? req.positionXMobile() : 50)
                .positionYMobile(req.positionYMobile() != null ? req.positionYMobile() : 50)
                .positionXTablet(req.positionXTablet() != null ? req.positionXTablet() : 50)
                .positionYTablet(req.positionYTablet() != null ? req.positionYTablet() : 50)
                .scale(req.scale()           != null ? req.scale()           : 100)
                .scaleMobile(req.scaleMobile()     != null ? req.scaleMobile()     : 100)
                .scaleTablet(req.scaleTablet()     != null ? req.scaleTablet()     : 100)
                .createdAt(Instant.now())
                .build();
        return HeroBannerResponse.from(heroBannerRepository.save(banner));
    }

    public Optional<HeroBannerResponse> updatePosition(int positionX, int positionY, int positionXMobile, int positionYMobile, int positionXTablet, int positionYTablet, int scale, int scaleMobile, int scaleTablet) {
        return heroBannerRepository.findTopByOrderByCreatedAtDesc().map(banner -> {
            banner.setPositionX(positionX);
            banner.setPositionY(positionY);
            banner.setPositionXMobile(positionXMobile);
            banner.setPositionYMobile(positionYMobile);
            banner.setPositionXTablet(positionXTablet);
            banner.setPositionYTablet(positionYTablet);
            banner.setScale(scale);
            banner.setScaleMobile(scaleMobile);
            banner.setScaleTablet(scaleTablet);
            return HeroBannerResponse.from(heroBannerRepository.save(banner));
        });
    }

    public Optional<HeroBannerResponse> replaceMobileImage(String imageUrl, String imageKey, String srcSet) {
        return heroBannerRepository.findTopByOrderByCreatedAtDesc().map(banner -> {
            if (banner.getImageKeyMobile() != null) mediaService.deleteFile(banner.getImageKeyMobile());
            banner.setImageUrlMobile(imageUrl);
            banner.setImageKeyMobile(imageKey);
            banner.setImageSrcSetMobile(srcSet);
            return HeroBannerResponse.from(heroBannerRepository.save(banner));
        });
    }

    public Optional<HeroBannerResponse> deleteMobileImage() {
        return heroBannerRepository.findTopByOrderByCreatedAtDesc().map(banner -> {
            if (banner.getImageKeyMobile() != null) mediaService.deleteFile(banner.getImageKeyMobile());
            banner.setImageUrlMobile(null);
            banner.setImageKeyMobile(null);
            banner.setImageSrcSetMobile(null);
            return HeroBannerResponse.from(heroBannerRepository.save(banner));
        });
    }

    public Optional<HeroBannerResponse> replaceTabletImage(String imageUrl, String imageKey, String srcSet) {
        return heroBannerRepository.findTopByOrderByCreatedAtDesc().map(banner -> {
            if (banner.getImageKeyTablet() != null) mediaService.deleteFile(banner.getImageKeyTablet());
            banner.setImageUrlTablet(imageUrl);
            banner.setImageKeyTablet(imageKey);
            banner.setImageSrcSetTablet(srcSet);
            return HeroBannerResponse.from(heroBannerRepository.save(banner));
        });
    }

    public Optional<HeroBannerResponse> deleteTabletImage() {
        return heroBannerRepository.findTopByOrderByCreatedAtDesc().map(banner -> {
            if (banner.getImageKeyTablet() != null) mediaService.deleteFile(banner.getImageKeyTablet());
            banner.setImageUrlTablet(null);
            banner.setImageKeyTablet(null);
            banner.setImageSrcSetTablet(null);
            return HeroBannerResponse.from(heroBannerRepository.save(banner));
        });
    }

    public void deleteCurrent() {
        heroBannerRepository.findTopByOrderByCreatedAtDesc().ifPresent(existing -> {
            mediaService.deleteFile(existing.getImageKey());
            if (existing.getImageKeyMobile() != null) mediaService.deleteFile(existing.getImageKeyMobile());
            heroBannerRepository.delete(existing);
        });
    }
}
