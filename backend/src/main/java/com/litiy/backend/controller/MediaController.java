package com.litiy.backend.controller;

import com.litiy.backend.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    /**
     * POST /api/media/presign
     * Body: { "filename": "photo.jpg", "contentType": "image/jpeg" }
     * Response: { "uploadUrl": "...", "publicUrl": "...", "key": "..." }
     */
    @PostMapping("/presign")
    public ResponseEntity<Map<String, String>> presign(@RequestBody Map<String, String> body) {
        String filename = body.get("filename");
        String contentType = body.get("contentType");
        return ResponseEntity.ok(mediaService.generatePresignedUploadUrl(filename, contentType));
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
