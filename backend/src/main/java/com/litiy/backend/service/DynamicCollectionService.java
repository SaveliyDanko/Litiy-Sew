package com.litiy.backend.service;

import com.litiy.backend.model.dto.DynamicCollectionPhotoRequest;
import com.litiy.backend.model.dto.DynamicCollectionPhotoResponse;
import com.litiy.backend.model.dto.DynamicCollectionRequest;
import com.litiy.backend.model.dto.DynamicCollectionResponse;
import com.litiy.backend.model.entity.DynamicCollection;
import com.litiy.backend.model.entity.DynamicCollectionPhoto;
import com.litiy.backend.repository.DynamicCollectionPhotoRepository;
import com.litiy.backend.repository.DynamicCollectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class DynamicCollectionService {

    private static final int MAX_COLLECTIONS = 25;
    private static final int MAX_PHOTOS_PER_COLLECTION = 25;

    private final DynamicCollectionRepository collectionRepo;
    private final DynamicCollectionPhotoRepository photoRepo;
    private final MediaService mediaService;

    // ── Collections ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DynamicCollectionResponse> listAll() {
        return collectionRepo.findAllByOrderBySortOrderAscCreatedAtAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DynamicCollectionResponse getBySlug(String slug) {
        DynamicCollection c = collectionRepo.findBySlug(slug)
                .orElseThrow(() -> new NoSuchElementException("Collection not found: " + slug));
        return toResponse(c);
    }

    public DynamicCollectionResponse create(DynamicCollectionRequest req) {
        if (collectionRepo.count() >= MAX_COLLECTIONS) {
            throw new IllegalStateException("Лимит коллекций: максимум " + MAX_COLLECTIONS);
        }
        if (collectionRepo.existsBySlug(req.slug())) {
            throw new IllegalArgumentException("Коллекция с таким slug уже существует: " + req.slug());
        }
        DynamicCollection c = DynamicCollection.builder()
                .slug(req.slug())
                .title(req.title())
                .subtitle(req.subtitle())
                .eyebrow(req.eyebrow())
                .description(req.description())
                .detailIntro(req.detailIntro())
                .detailFocus(req.detailFocus())
                .tone(req.tone() != null ? req.tone() : "neutral")
                .category(req.category() != null ? req.category() : "COLLECTION")
                .sortOrder(req.sortOrder() != null ? req.sortOrder() : 0)
                .featured(Boolean.TRUE.equals(req.featured()))
                .build();
        return toResponse(collectionRepo.save(c));
    }

    public DynamicCollectionResponse update(Long id, DynamicCollectionRequest req) {
        DynamicCollection c = collectionRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Collection not found: " + id));
        // Allow slug change only if it doesn't conflict with another collection
        if (!c.getSlug().equals(req.slug()) && collectionRepo.existsBySlug(req.slug())) {
            throw new IllegalArgumentException("Коллекция с таким slug уже существует: " + req.slug());
        }
        c.setSlug(req.slug());
        c.setTitle(req.title());
        c.setSubtitle(req.subtitle());
        c.setEyebrow(req.eyebrow());
        c.setDescription(req.description());
        c.setDetailIntro(req.detailIntro());
        c.setDetailFocus(req.detailFocus());
        if (req.tone() != null) c.setTone(req.tone());
        if (req.category() != null) c.setCategory(req.category());
        if (req.sortOrder() != null) c.setSortOrder(req.sortOrder());
        if (req.featured() != null) c.setFeatured(req.featured());
        return toResponse(collectionRepo.save(c));
    }

    public void delete(Long id) {
        DynamicCollection c = collectionRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Collection not found: " + id));
        // Delete all photos from storage and DB
        photoRepo.findAllByCollectionIdOrderBySortOrderAscCreatedAtAsc(id).forEach(p -> {
            try { mediaService.deleteFile(p.getImageKey()); } catch (Exception ignored) {}
        });
        photoRepo.deleteAllByCollectionId(id);
        collectionRepo.delete(c);
    }

    // ── Photos ────────────────────────────────────────────────────────────────

    public DynamicCollectionPhotoResponse addPhoto(Long collectionId, DynamicCollectionPhotoRequest req) {
        if (!collectionRepo.existsById(collectionId)) {
            throw new NoSuchElementException("Collection not found: " + collectionId);
        }
        if (photoRepo.countByCollectionId(collectionId) >= MAX_PHOTOS_PER_COLLECTION) {
            throw new IllegalStateException("Лимит фотографий: максимум " + MAX_PHOTOS_PER_COLLECTION + " на коллекцию");
        }
        DynamicCollectionPhoto photo = DynamicCollectionPhoto.builder()
                .collectionId(collectionId)
                .photoType(req.photoType())
                .imageUrl(req.imageUrl())
                .imageKey(req.imageKey())
                .positionX(req.positionX() != null ? req.positionX() : 50)
                .positionY(req.positionY() != null ? req.positionY() : 50)
                .sortOrder(req.sortOrder() != null ? req.sortOrder() : 0)
                .build();
        return DynamicCollectionPhotoResponse.from(photoRepo.save(photo));
    }

    public DynamicCollectionPhotoResponse updatePhotoPosition(Long photoId, int positionX, int positionY, int scale) {
        DynamicCollectionPhoto photo = photoRepo.findById(photoId)
                .orElseThrow(() -> new NoSuchElementException("Photo not found: " + photoId));
        photo.setPositionX(positionX);
        photo.setPositionY(positionY);
        photo.setScale(scale);
        return DynamicCollectionPhotoResponse.from(photoRepo.save(photo));
    }

    public void deletePhoto(Long photoId) {
        DynamicCollectionPhoto photo = photoRepo.findById(photoId)
                .orElseThrow(() -> new NoSuchElementException("Photo not found: " + photoId));
        try { mediaService.deleteFile(photo.getImageKey()); } catch (Exception ignored) {}
        photoRepo.delete(photo);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private DynamicCollectionResponse toResponse(DynamicCollection c) {
        List<DynamicCollectionPhotoResponse> photos =
                photoRepo.findAllByCollectionIdOrderBySortOrderAscCreatedAtAsc(c.getId())
                        .stream().map(DynamicCollectionPhotoResponse::from).toList();
        return DynamicCollectionResponse.from(c, photos);
    }
}
