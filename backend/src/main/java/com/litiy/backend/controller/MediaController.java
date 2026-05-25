package com.litiy.backend.controller;

import com.litiy.backend.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    /**
     * POST /api/media/upload  (multipart/form-data, field "file")
     * Response: { "publicUrl": "...", "key": "..." }
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(mediaService.uploadFile(file));
    }

    /**
     * POST /api/media/upload-raw  (multipart/form-data, field "file")
     * Admin-only (gated in SecurityConfig). Accepts any file type, stores as-is.
     * Response: { "publicUrl": ..., "key": ..., "fileSize": ..., "contentType": ..., "originalName": ... }
     */
    @PostMapping("/upload-raw")
    public ResponseEntity<Map<String, Object>> uploadRaw(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(mediaService.uploadRawFile(file));
    }

    /**
     * DELETE /api/media?key=uuid/filename.jpg
     */
    @DeleteMapping
    public ResponseEntity<Void> delete(@RequestParam String key) {
        mediaService.deleteFile(key);
        return ResponseEntity.noContent().build();
    }
}
