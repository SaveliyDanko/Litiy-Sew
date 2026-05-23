package com.litiy.backend.controller;

import com.litiy.backend.model.dto.DynamicCollectionPhotoRequest;
import com.litiy.backend.model.dto.DynamicCollectionPhotoResponse;
import com.litiy.backend.model.dto.DynamicCollectionRequest;
import com.litiy.backend.model.dto.DynamicCollectionResponse;
import com.litiy.backend.service.DynamicCollectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class DynamicCollectionController {

    private final DynamicCollectionService service;

    // ── Public endpoints ─────────────────────────────────────────────────────

    @GetMapping("/api/collections")
    public ResponseEntity<List<DynamicCollectionResponse>> listCollections() {
        return ResponseEntity.ok(service.listAll());
    }

    @GetMapping("/api/collections/{slug}")
    public ResponseEntity<DynamicCollectionResponse> getCollection(@PathVariable String slug) {
        return ResponseEntity.ok(service.getBySlug(slug));
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    @PostMapping("/api/admin/collections")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DynamicCollectionResponse> createCollection(@Valid @RequestBody DynamicCollectionRequest req) {
        return ResponseEntity.status(201).body(service.create(req));
    }

    @PutMapping("/api/admin/collections/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DynamicCollectionResponse> updateCollection(
            @PathVariable Long id,
            @Valid @RequestBody DynamicCollectionRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @PatchMapping("/api/admin/collections/{id}/order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reorderCollection(@PathVariable Long id,
                                                   @RequestBody Map<String, Integer> body) {
        service.reorder(id, body.get("sortOrder"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/admin/collections/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCollection(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Photo admin endpoints ─────────────────────────────────────────────────

    @PostMapping("/api/admin/collections/{collectionId}/photos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DynamicCollectionPhotoResponse> addPhoto(
            @PathVariable Long collectionId,
            @Valid @RequestBody DynamicCollectionPhotoRequest req) {
        return ResponseEntity.status(201).body(service.addPhoto(collectionId, req));
    }

    @PatchMapping("/api/admin/collections/photos/{photoId}/position")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DynamicCollectionPhotoResponse> updatePhotoPosition(
            @PathVariable Long photoId,
            @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(service.updatePhotoPosition(photoId, body));
    }

    @PatchMapping("/api/admin/collections/photos/{photoId}/order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reorderPhoto(@PathVariable Long photoId,
                                              @RequestBody Map<String, Integer> body) {
        service.reorderPhoto(photoId, body.get("sortOrder"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/admin/collections/photos/{photoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long photoId) {
        service.deletePhoto(photoId);
        return ResponseEntity.noContent().build();
    }
}
