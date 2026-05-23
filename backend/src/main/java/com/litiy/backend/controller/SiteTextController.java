package com.litiy.backend.controller;

import com.litiy.backend.model.dto.SiteTextResponse;
import com.litiy.backend.service.SiteTextService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SiteTextController {

    private final SiteTextService siteTextService;

    @GetMapping("/api/site-texts")
    public ResponseEntity<List<SiteTextResponse>> listAll() {
        return ResponseEntity.ok(siteTextService.listAll());
    }

    @PutMapping("/api/admin/site-texts/{slotKey}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SiteTextResponse> upsert(
            @PathVariable String slotKey,
            @RequestBody Map<String, String> body) {
        String value = body.getOrDefault("value", "");
        return ResponseEntity.ok(siteTextService.upsert(slotKey, value));
    }
}
