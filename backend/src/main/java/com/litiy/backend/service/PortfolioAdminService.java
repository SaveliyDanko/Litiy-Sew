package com.litiy.backend.service;

import com.litiy.backend.model.dto.PortfolioPhotoRequest;
import com.litiy.backend.model.dto.PortfolioPhotoResponse;
import com.litiy.backend.model.entity.PortfolioPhoto;
import com.litiy.backend.repository.PortfolioPhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PortfolioAdminService {

    private final PortfolioPhotoRepository portfolioPhotoRepository;
    private final MediaService mediaService;

    @Transactional(readOnly = true)
    public List<PortfolioPhotoResponse> listAll() {
        return portfolioPhotoRepository.findAllByOrderBySortOrderAscCreatedAtDesc()
                .stream()
                .map(PortfolioPhotoResponse::from)
                .toList();
    }

    public PortfolioPhotoResponse create(PortfolioPhotoRequest req) {
        PortfolioPhoto photo = PortfolioPhoto.builder()
                .photoUrl(req.photoUrl())
                .photoKey(req.photoKey())
                .photoSrcSet(req.photoSrcSet())
                .caption(req.caption())
                .sortOrder(req.sortOrder() != null ? req.sortOrder() : 0)
                .positionX(req.positionX() != null ? req.positionX() : 50)
                .positionY(req.positionY() != null ? req.positionY() : 50)
                .scale(req.scale() != null ? req.scale() : 100)
                .createdAt(Instant.now())
                .build();
        return PortfolioPhotoResponse.from(portfolioPhotoRepository.save(photo));
    }

    public void delete(Long id) {
        PortfolioPhoto photo = portfolioPhotoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PortfolioPhoto not found: " + id));
        mediaService.deleteFile(photo.getPhotoKey());
        portfolioPhotoRepository.delete(photo);
    }

    public void reorder(Long id, Integer sortOrder) {
        PortfolioPhoto photo = portfolioPhotoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PortfolioPhoto not found: " + id));
        photo.setSortOrder(sortOrder);
        portfolioPhotoRepository.save(photo);
    }

    public PortfolioPhotoResponse updatePosition(Long id, int positionX, int positionY, int scale) {
        PortfolioPhoto photo = portfolioPhotoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PortfolioPhoto not found: " + id));
        photo.setPositionX(positionX);
        photo.setPositionY(positionY);
        photo.setScale(scale);
        return PortfolioPhotoResponse.from(portfolioPhotoRepository.save(photo));
    }
}
