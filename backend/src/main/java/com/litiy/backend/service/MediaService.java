package com.litiy.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"
    );

    @Value("${app.media.upload-dir}")
    private String uploadDir;

    @Value("${app.media.public-url}")
    private String publicUrl;

    public Map<String, String> uploadFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, GIF, AVIF");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String key = UUID.randomUUID() + "/" + originalFilename;

        Path target = Paths.get(uploadDir).resolve(key);
        Files.createDirectories(target.getParent());
        file.transferTo(target);

        return Map.of("publicUrl", publicUrl + "/" + key, "key", key);
    }

    public void deleteFile(String key) {
        try {
            Path target = Paths.get(uploadDir).resolve(key);
            Files.deleteIfExists(target);
            Files.deleteIfExists(target.getParent());
        } catch (IOException ignored) {
        }
    }
}
