package com.litiy.backend.service;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"
    );

    private static final int[] WIDTHS = {400, 800, 1280, 1920};

    @Value("${app.media.upload-dir}")
    private String uploadDir;

    @Value("${app.media.public-url}")
    private String publicUrl;

    /**
     * Uploads a file, converts it to WebP, and generates resized variants.
     *
     * @return map with keys:
     *   "publicUrl" — full-size WebP URL,
     *   "key"       — storage key for full-size,
     *   "srcset"    — space-separated srcset string, e.g. "https://.../400.webp 400w, ..."
     */
    public Map<String, String> uploadFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, GIF, AVIF");
        }

        String baseKey = UUID.randomUUID().toString();
        Path dir = Paths.get(uploadDir).resolve(baseKey);
        Files.createDirectories(dir);

        BufferedImage original;
        try {
            original = ImageIO.read(file.getInputStream());
        } catch (Exception e) {
            deleteDir(dir);
            throw new IOException("Не удалось прочитать изображение", e);
        }
        if (original == null) {
            deleteDir(dir);
            throw new IllegalArgumentException("Не удалось декодировать изображение");
        }

        int origWidth = original.getWidth();

        // full-size WebP
        String fullName = "original.webp";
        Path fullPath = dir.resolve(fullName);
        try {
            writeWebP(original, fullPath);
        } catch (IOException e) {
            deleteDir(dir);
            throw e;
        }

        String fullKey = baseKey + "/" + fullName;
        String fullUrl = publicUrl + "/" + fullKey;

        // resized variants
        Map<Integer, String> variants = new LinkedHashMap<>();
        for (int w : WIDTHS) {
            if (w >= origWidth) continue;
            String variantName = w + ".webp";
            Path variantPath = dir.resolve(variantName);
            try {
                Thumbnails.of(original)
                        .width(w)
                        .outputFormat("webp")
                        .outputQuality(0.85)
                        .toOutputStream(Files.newOutputStream(variantPath));
            } catch (IOException e) {
                deleteDir(dir);
                throw e;
            }
            variants.put(w, publicUrl + "/" + baseKey + "/" + variantName);
        }

        // build srcset string: "url 400w, url 800w, ..."
        StringBuilder srcset = new StringBuilder();
        for (Map.Entry<Integer, String> entry : variants.entrySet()) {
            if (!srcset.isEmpty()) srcset.append(", ");
            srcset.append(entry.getValue()).append(" ").append(entry.getKey()).append("w");
        }
        if (!srcset.isEmpty()) srcset.append(", ");
        srcset.append(fullUrl).append(" ").append(origWidth).append("w");

        Map<String, String> result = new LinkedHashMap<>();
        result.put("publicUrl", fullUrl);
        result.put("key", fullKey);
        result.put("srcset", srcset.toString());
        return result;
    }

    private void writeWebP(BufferedImage image, Path target) throws IOException {
        try (OutputStream out = Files.newOutputStream(target)) {
            Thumbnails.of(image)
                    .scale(1.0)
                    .outputFormat("webp")
                    .outputQuality(0.88)
                    .toOutputStream(out);
        }
    }

    public void deleteFile(String key) {
        if (key == null || key.isBlank()) return;
        try {
            // key = "uuid/filename.webp" — delete whole uuid/ dir
            Path target = Paths.get(uploadDir).resolve(key);
            Files.deleteIfExists(target);
            deleteDir(target.getParent());
        } catch (IOException ignored) {
        }
    }

    private void deleteDir(Path dir) {
        if (dir == null) return;
        try (var stream = Files.list(dir)) {
            stream.forEach(p -> {
                try { Files.deleteIfExists(p); } catch (IOException ignored) {}
            });
            Files.deleteIfExists(dir);
        } catch (IOException ignored) {
        }
    }
}
