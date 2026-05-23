package com.litiy.backend.service;

import com.litiy.backend.model.dto.PortfolioProjectPhotoResponse;
import com.litiy.backend.model.dto.PortfolioProjectRequest;
import com.litiy.backend.model.dto.PortfolioProjectResponse;
import com.litiy.backend.model.entity.PortfolioProject;
import com.litiy.backend.model.entity.PortfolioProjectPhoto;
import com.litiy.backend.repository.PortfolioProjectPhotoRepository;
import com.litiy.backend.repository.PortfolioProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class PortfolioProjectService {

    private final PortfolioProjectRepository repo;
    private final PortfolioProjectPhotoRepository photoRepo;
    private final MediaService mediaService;

    @Transactional(readOnly = true)
    public List<PortfolioProjectResponse> listAll() {
        List<PortfolioProject> projects = repo.findAllByOrderBySortOrderAscCreatedAtAsc();
        if (projects.isEmpty()) return List.of();
        List<Long> ids = projects.stream().map(PortfolioProject::getId).toList();
        List<PortfolioProjectPhoto> allPhotos = photoRepo.findAllByProjectIdInOrderBySortOrderAscCreatedAtAsc(ids);
        Map<Long, List<PortfolioProjectPhoto>> photosByProject = allPhotos.stream()
                .collect(java.util.stream.Collectors.groupingBy(PortfolioProjectPhoto::getProjectId));
        return projects.stream()
                .map(p -> PortfolioProjectResponse.from(p, photosByProject.getOrDefault(p.getId(), List.of())))
                .toList();
    }

    public PortfolioProjectResponse create(PortfolioProjectRequest req) {
        PortfolioProject p = PortfolioProject.builder()
                .eyebrow(req.eyebrow())
                .title(req.title())
                .meta(req.meta())
                .lead(req.lead())
                .paragraph1(req.paragraph1())
                .paragraph2(req.paragraph2())
                .paragraph3(req.paragraph3())
                .imageUrl(req.imageUrl())
                .imageKey(req.imageKey())
                .imageSrcSet(req.imageSrcSet())
                .positionX(req.positionX() != null ? req.positionX() : 50)
                .positionY(req.positionY() != null ? req.positionY() : 50)
                .scale(req.scale() != null ? req.scale() : 100)
                .sortOrder(req.sortOrder() != null ? req.sortOrder() : 0)
                .createdAt(Instant.now())
                .build();
        PortfolioProject saved = repo.save(p);
        return PortfolioProjectResponse.from(saved, List.of());
    }

    public PortfolioProjectResponse update(Long id, PortfolioProjectRequest req) {
        PortfolioProject p = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PortfolioProject not found: " + id));
        p.setEyebrow(req.eyebrow());
        p.setTitle(req.title());
        p.setMeta(req.meta());
        p.setLead(req.lead());
        p.setParagraph1(req.paragraph1());
        p.setParagraph2(req.paragraph2());
        p.setParagraph3(req.paragraph3());
        if (req.imageUrl() != null) p.setImageUrl(req.imageUrl());
        if (req.imageKey() != null) p.setImageKey(req.imageKey());
        if (req.imageSrcSet() != null) p.setImageSrcSet(req.imageSrcSet());
        if (req.positionX() != null) p.setPositionX(req.positionX());
        if (req.positionY() != null) p.setPositionY(req.positionY());
        if (req.scale() != null) p.setScale(req.scale());
        if (req.sortOrder() != null) p.setSortOrder(req.sortOrder());
        PortfolioProject saved = repo.save(p);
        List<PortfolioProjectPhoto> photos = photoRepo.findAllByProjectIdOrderBySortOrderAscCreatedAtAsc(id);
        return PortfolioProjectResponse.from(saved, photos);
    }

    public void updatePosition(Long id, int positionX, int positionY, int scale) {
        PortfolioProject p = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PortfolioProject not found: " + id));
        p.setPositionX(positionX);
        p.setPositionY(positionY);
        p.setScale(scale);
        repo.save(p);
    }

    public void reorder(Long id, int sortOrder) {
        PortfolioProject p = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PortfolioProject not found: " + id));
        p.setSortOrder(sortOrder);
        repo.save(p);
    }

    public void delete(Long id) {
        PortfolioProject p = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PortfolioProject not found: " + id));
        if (p.getImageKey() != null) mediaService.deleteFile(p.getImageKey());
        List<PortfolioProjectPhoto> photos = photoRepo.findAllByProjectIdOrderBySortOrderAscCreatedAtAsc(id);
        for (PortfolioProjectPhoto photo : photos) {
            mediaService.deleteFile(photo.getImageKey());
        }
        photoRepo.deleteAllByProjectId(id);
        repo.delete(p);
    }

    // ── Photo management ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PortfolioProjectPhotoResponse> listPhotos(Long projectId) {
        return photoRepo.findAllByProjectIdOrderBySortOrderAscCreatedAtAsc(projectId)
                .stream()
                .map(PortfolioProjectPhotoResponse::from)
                .toList();
    }

    public PortfolioProjectPhotoResponse addPhoto(Long projectId, String imageUrl, String imageKey, String imageSrcSet) {
        if (!repo.existsById(projectId)) {
            throw new IllegalArgumentException("PortfolioProject not found: " + projectId);
        }
        List<PortfolioProjectPhoto> existing = photoRepo.findAllByProjectIdOrderBySortOrderAscCreatedAtAsc(projectId);
        int nextOrder = existing.isEmpty() ? 0 : existing.stream().mapToInt(p -> p.getSortOrder() != null ? p.getSortOrder() : 0).max().orElse(-1) + 1;
        PortfolioProjectPhoto photo = PortfolioProjectPhoto.builder()
                .projectId(projectId)
                .imageUrl(imageUrl)
                .imageKey(imageKey)
                .imageSrcSet(imageSrcSet)
                .sortOrder(nextOrder)
                .build();
        return PortfolioProjectPhotoResponse.from(photoRepo.save(photo));
    }

    public void deletePhoto(Long photoId) {
        PortfolioProjectPhoto photo = photoRepo.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("PortfolioProjectPhoto not found: " + photoId));
        mediaService.deleteFile(photo.getImageKey());
        photoRepo.delete(photo);
    }

    public void reorderPhoto(Long photoId, int sortOrder) {
        PortfolioProjectPhoto photo = photoRepo.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("PortfolioProjectPhoto not found: " + photoId));
        photo.setSortOrder(sortOrder);
        photoRepo.save(photo);
    }

    public PortfolioProjectPhotoResponse updatePhotoPosition(Long photoId, int positionX, int positionY, int scale) {
        PortfolioProjectPhoto photo = photoRepo.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("PortfolioProjectPhoto not found: " + photoId));
        photo.setPositionX(positionX);
        photo.setPositionY(positionY);
        photo.setScale(scale);
        return PortfolioProjectPhotoResponse.from(photoRepo.save(photo));
    }
}
