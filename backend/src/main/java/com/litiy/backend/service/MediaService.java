package com.litiy.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class MediaService {

    @Value("${app.media.upload-dir}")
    private String uploadDir;

    @Value("${app.media.public-url}")
    private String publicUrl;

    public Map<String, String> uploadFile(MultipartFile file) throws IOException {
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
