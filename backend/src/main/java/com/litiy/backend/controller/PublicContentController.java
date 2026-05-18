package com.litiy.backend.controller;

import com.litiy.backend.model.dto.HeroBannerResponse;
import com.litiy.backend.model.dto.PatternItemResponse;
import com.litiy.backend.model.dto.PortfolioPhotoResponse;
import com.litiy.backend.model.dto.ProductResponse;
import com.litiy.backend.service.HeroBannerAdminService;
import com.litiy.backend.service.PatternAdminService;
import com.litiy.backend.service.PortfolioAdminService;
import com.litiy.backend.service.ProductAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PublicContentController {

    private final ProductAdminService productAdminService;
    private final PatternAdminService patternAdminService;
    private final PortfolioAdminService portfolioAdminService;
    private final HeroBannerAdminService heroBannerAdminService;

    @GetMapping("/api/products")
    public ResponseEntity<List<ProductResponse>> getProducts() {
        return ResponseEntity.ok(productAdminService.listAll());
    }

    @GetMapping("/api/patterns")
    public ResponseEntity<List<PatternItemResponse>> getPatterns() {
        return ResponseEntity.ok(patternAdminService.listAll());
    }

    @GetMapping("/api/portfolio")
    public ResponseEntity<List<PortfolioPhotoResponse>> getPortfolio() {
        return ResponseEntity.ok(portfolioAdminService.listAll());
    }

    @GetMapping("/api/hero")
    public ResponseEntity<HeroBannerResponse> getHero() {
        return heroBannerAdminService.getCurrent()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
