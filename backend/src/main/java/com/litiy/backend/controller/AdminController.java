package com.litiy.backend.controller;

import com.litiy.backend.model.dto.AdminCredentialsRequest;
import com.litiy.backend.model.dto.CollectionMetaRequest;
import com.litiy.backend.model.dto.CollectionMetaResponse;
import com.litiy.backend.model.dto.HeroBannerRequest;
import com.litiy.backend.model.dto.HeroBannerResponse;
import com.litiy.backend.model.dto.PatternItemRequest;
import com.litiy.backend.model.dto.PatternItemResponse;
import com.litiy.backend.model.dto.PortfolioPhotoRequest;
import com.litiy.backend.model.dto.PortfolioPhotoResponse;
import com.litiy.backend.model.dto.PortfolioProjectAttachmentRequest;
import com.litiy.backend.model.dto.PortfolioProjectAttachmentResponse;
import com.litiy.backend.model.dto.PortfolioProjectPhotoResponse;
import com.litiy.backend.model.dto.PortfolioProjectRequest;
import com.litiy.backend.model.dto.PortfolioProjectResponse;
import com.litiy.backend.model.dto.ProductRequest;
import com.litiy.backend.model.dto.ProductResponse;
import com.litiy.backend.service.CollectionMetaService;
import com.litiy.backend.service.HeroBannerAdminService;
import com.litiy.backend.service.PatternAdminService;
import com.litiy.backend.service.PortfolioAdminService;
import com.litiy.backend.service.PortfolioProjectService;
import com.litiy.backend.service.ProductAdminService;
import com.litiy.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ProductAdminService productAdminService;
    private final PatternAdminService patternAdminService;
    private final PortfolioAdminService portfolioAdminService;
    private final PortfolioProjectService portfolioProjectService;
    private final HeroBannerAdminService heroBannerAdminService;
    private final CollectionMetaService collectionMetaService;
    private final UserService userService;

    // --- Credentials ---

    @PatchMapping("/credentials")
    public ResponseEntity<Void> updateCredentials(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody AdminCredentialsRequest req) {
        userService.updateAdminCredentials(principal.getUsername(), req.email(), req.password());
        return ResponseEntity.noContent().build();
    }

    // --- Products ---

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> listProducts() {
        return ResponseEntity.ok(productAdminService.listAll());
    }

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.status(201).body(productAdminService.create(req));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productAdminService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Patterns ---

    @GetMapping("/patterns")
    public ResponseEntity<List<PatternItemResponse>> listPatterns() {
        return ResponseEntity.ok(patternAdminService.listAll());
    }

    @PostMapping("/patterns")
    public ResponseEntity<PatternItemResponse> createPattern(@Valid @RequestBody PatternItemRequest req) {
        return ResponseEntity.status(201).body(patternAdminService.create(req));
    }

    @DeleteMapping("/patterns/{id}")
    public ResponseEntity<Void> deletePattern(@PathVariable Long id) {
        patternAdminService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Portfolio ---

    @GetMapping("/portfolio")
    public ResponseEntity<List<PortfolioPhotoResponse>> listPortfolio() {
        return ResponseEntity.ok(portfolioAdminService.listAll());
    }

    @PostMapping("/portfolio")
    public ResponseEntity<PortfolioPhotoResponse> createPortfolioPhoto(@Valid @RequestBody PortfolioPhotoRequest req) {
        return ResponseEntity.status(201).body(portfolioAdminService.create(req));
    }

    @DeleteMapping("/portfolio/{id}")
    public ResponseEntity<Void> deletePortfolioPhoto(@PathVariable Long id) {
        portfolioAdminService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/portfolio/{id}/order")
    public ResponseEntity<Void> reorderPortfolioPhoto(@PathVariable Long id,
                                                       @RequestBody Map<String, Integer> body) {
        portfolioAdminService.reorder(id, body.get("sortOrder"));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/portfolio/{id}/position")
    public ResponseEntity<PortfolioPhotoResponse> updatePortfolioPhotoPosition(@PathVariable Long id,
                                                                                @RequestBody Map<String, Integer> body) {
        int x = body.getOrDefault("positionX", 50);
        int y = body.getOrDefault("positionY", 50);
        int scale = body.getOrDefault("scale", 100);
        return ResponseEntity.ok(portfolioAdminService.updatePosition(id, x, y, scale));
    }

    // --- Portfolio Projects (Избранные проекты на странице "Обо мне") ---

    @GetMapping("/portfolio-projects")
    public ResponseEntity<List<PortfolioProjectResponse>> listPortfolioProjects() {
        return ResponseEntity.ok(portfolioProjectService.listAll());
    }

    @PostMapping("/portfolio-projects")
    public ResponseEntity<PortfolioProjectResponse> createPortfolioProject(@Valid @RequestBody PortfolioProjectRequest req) {
        return ResponseEntity.status(201).body(portfolioProjectService.create(req));
    }

    @PutMapping("/portfolio-projects/{id}")
    public ResponseEntity<PortfolioProjectResponse> updatePortfolioProject(@PathVariable Long id,
                                                                            @Valid @RequestBody PortfolioProjectRequest req) {
        return ResponseEntity.ok(portfolioProjectService.update(id, req));
    }

    @DeleteMapping("/portfolio-projects/{id}")
    public ResponseEntity<Void> deletePortfolioProject(@PathVariable Long id) {
        portfolioProjectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/portfolio-projects/{id}/order")
    public ResponseEntity<Void> reorderPortfolioProject(@PathVariable Long id,
                                                         @RequestBody Map<String, Integer> body) {
        portfolioProjectService.reorder(id, body.get("sortOrder"));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/portfolio-projects/{id}/position")
    public ResponseEntity<Void> updatePortfolioProjectPosition(@PathVariable Long id,
                                                                @RequestBody Map<String, Integer> body) {
        int x = body.getOrDefault("positionX", 50);
        int y = body.getOrDefault("positionY", 50);
        int scale = body.getOrDefault("scale", 100);
        portfolioProjectService.updatePosition(id, x, y, scale);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/portfolio-projects/{id}/photos")
    public ResponseEntity<PortfolioProjectPhotoResponse> addPortfolioProjectPhoto(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String imageUrl = body.get("imageUrl");
        String imageKey = body.get("imageKey");
        if (imageUrl == null || imageKey == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.status(201).body(
                portfolioProjectService.addPhoto(id, imageUrl, imageKey, body.get("imageSrcSet")));
    }

    @DeleteMapping("/portfolio-projects/photos/{photoId}")
    public ResponseEntity<Void> deletePortfolioProjectPhoto(@PathVariable Long photoId) {
        portfolioProjectService.deletePhoto(photoId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/portfolio-projects/photos/{photoId}/order")
    public ResponseEntity<Void> reorderPortfolioProjectPhoto(@PathVariable Long photoId,
                                                              @RequestBody Map<String, Integer> body) {
        portfolioProjectService.reorderPhoto(photoId, body.get("sortOrder"));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/portfolio-projects/photos/{photoId}/position")
    public ResponseEntity<PortfolioProjectPhotoResponse> updatePortfolioProjectPhotoPosition(
            @PathVariable Long photoId,
            @RequestBody Map<String, Integer> body) {
        int x = body.getOrDefault("positionX", 50);
        int y = body.getOrDefault("positionY", 50);
        int scale = body.getOrDefault("scale", 100);
        return ResponseEntity.ok(portfolioProjectService.updatePhotoPosition(photoId, x, y, scale));
    }

    // Optional attachments (files & external links) for portfolio cards.

    @PostMapping("/portfolio-projects/{id}/attachments")
    public ResponseEntity<PortfolioProjectAttachmentResponse> addPortfolioProjectAttachment(
            @PathVariable Long id,
            @Valid @RequestBody PortfolioProjectAttachmentRequest req) {
        return ResponseEntity.status(201).body(portfolioProjectService.addAttachment(id, req));
    }

    @DeleteMapping("/portfolio-projects/attachments/{attachmentId}")
    public ResponseEntity<Void> deletePortfolioProjectAttachment(@PathVariable Long attachmentId) {
        portfolioProjectService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/portfolio-projects/attachments/{attachmentId}/order")
    public ResponseEntity<Void> reorderPortfolioProjectAttachment(@PathVariable Long attachmentId,
                                                                   @RequestBody Map<String, Integer> body) {
        portfolioProjectService.reorderAttachment(attachmentId, body.get("sortOrder"));
        return ResponseEntity.noContent().build();
    }

    // --- Hero Banner ---

    @GetMapping("/hero")
    public ResponseEntity<HeroBannerResponse> getHero() {
        return heroBannerAdminService.getCurrent()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/hero")
    public ResponseEntity<HeroBannerResponse> replaceHero(@Valid @RequestBody HeroBannerRequest req) {
        return ResponseEntity.status(201).body(heroBannerAdminService.replace(req));
    }

    @PatchMapping("/hero/position")
    public ResponseEntity<HeroBannerResponse> updateHeroPosition(@RequestBody Map<String, Integer> body) {
        return heroBannerAdminService.updatePosition(
                body.getOrDefault("positionX", 50),
                body.getOrDefault("positionY", 50),
                body.getOrDefault("positionXMobile", 50),
                body.getOrDefault("positionYMobile", 50),
                body.getOrDefault("positionXTablet", 50),
                body.getOrDefault("positionYTablet", 50),
                body.getOrDefault("scale", 100),
                body.getOrDefault("scaleMobile", 100),
                body.getOrDefault("scaleTablet", 100)
        ).map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/hero/mobile")
    public ResponseEntity<HeroBannerResponse> replaceHeroMobile(@RequestBody Map<String, String> body) {
        String url = body.get("imageUrl");
        String key = body.get("imageKey");
        if (url == null || key == null) return ResponseEntity.badRequest().build();
        return heroBannerAdminService.replaceMobileImage(url, key, body.get("imageSrcSet"))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @DeleteMapping("/hero/mobile")
    public ResponseEntity<HeroBannerResponse> deleteHeroMobile() {
        return heroBannerAdminService.deleteMobileImage()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/hero/tablet")
    public ResponseEntity<HeroBannerResponse> replaceHeroTablet(@RequestBody Map<String, String> body) {
        String url = body.get("imageUrl");
        String key = body.get("imageKey");
        if (url == null || key == null) return ResponseEntity.badRequest().build();
        return heroBannerAdminService.replaceTabletImage(url, key, body.get("imageSrcSet"))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @DeleteMapping("/hero/tablet")
    public ResponseEntity<HeroBannerResponse> deleteHeroTablet() {
        return heroBannerAdminService.deleteTabletImage()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @DeleteMapping("/hero")
    public ResponseEntity<Void> deleteHero() {
        heroBannerAdminService.deleteCurrent();
        return ResponseEntity.noContent().build();
    }

    // --- Collection Meta ---

    @PutMapping("/collections/{slug}/meta")
    public ResponseEntity<CollectionMetaResponse> upsertCollectionMeta(
            @PathVariable String slug,
            @Valid @RequestBody CollectionMetaRequest req) {
        return ResponseEntity.ok(collectionMetaService.upsert(slug, req));
    }
}
