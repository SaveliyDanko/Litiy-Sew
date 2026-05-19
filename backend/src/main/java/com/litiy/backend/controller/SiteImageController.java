package com.litiy.backend.controller;

import com.litiy.backend.model.dto.SiteImageRequest;
import com.litiy.backend.model.dto.SiteImageResponse;
import com.litiy.backend.service.SiteImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SiteImageController {

    private final SiteImageService siteImageService;

    // ── Public ────────────────────────────────────────────────────────────────

    @GetMapping("/api/site-images")
    public ResponseEntity<List<SiteImageResponse>> listAll() {
        return ResponseEntity.ok(siteImageService.listAll());
    }

    @GetMapping("/api/site-images/{slotKey}")
    public ResponseEntity<SiteImageResponse> getBySlot(@PathVariable String slotKey) {
        return siteImageService.getBySlot(slotKey)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    @PostMapping("/api/admin/site-images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SiteImageResponse> upsert(@Valid @RequestBody SiteImageRequest req) {
        return ResponseEntity.ok(siteImageService.upsert(req));
    }

    @PatchMapping("/api/admin/site-images/{slotKey}/position")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SiteImageResponse> updatePosition(
            @PathVariable String slotKey,
            @RequestBody Map<String, Integer> body) {
        return siteImageService.updatePosition(
                slotKey,
                body.getOrDefault("positionX", 50),
                body.getOrDefault("positionY", 50),
                body.getOrDefault("scale", 100)
        ).map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @DeleteMapping("/api/admin/site-images/{slotKey}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String slotKey) {
        siteImageService.delete(slotKey);
        return ResponseEntity.noContent().build();
    }
}
