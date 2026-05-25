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
    /** Max width of the "original" WebP stored on disk. Beyond this we don't gain
     *  visible quality — only file size — so we downscale on upload. */
    private static final int MAX_ORIGINAL_WIDTH = 2400;
    /** WebP encoder quality for both the original and resized variants. */
    private static final float WEBP_QUALITY = 0.80f;

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
        // The "original" we keep on disk is capped at MAX_ORIGINAL_WIDTH — anything wider
        // is downscaled. srcset still advertises the (possibly capped) original width.
        int storedWidth = Math.min(origWidth, MAX_ORIGINAL_WIDTH);

        // full-size WebP (capped)
        String fullName = "original.webp";
        Path fullPath = dir.resolve(fullName);
        try {
            writeWebP(original, fullPath, storedWidth);
        } catch (IOException e) {
            deleteDir(dir);
            throw e;
        }

        String fullKey = baseKey + "/" + fullName;
        String mediaBaseUrl = normalizedPublicUrl();
        String fullUrl = mediaBaseUrl + "/" + fullKey;

        // resized variants
        Map<Integer, String> variants = new LinkedHashMap<>();
        for (int w : WIDTHS) {
            if (w >= storedWidth) continue;
            String variantName = w + ".webp";
            Path variantPath = dir.resolve(variantName);
            try {
                Thumbnails.of(original)
                        .width(w)
                        .outputFormat("webp")
                        .outputQuality(WEBP_QUALITY)
                        .toOutputStream(Files.newOutputStream(variantPath));
            } catch (IOException e) {
                deleteDir(dir);
                throw e;
            }
            variants.put(w, mediaBaseUrl + "/" + baseKey + "/" + variantName);
        }

        // build srcset string: "url 400w, url 800w, ..."
        StringBuilder srcset = new StringBuilder();
        for (Map.Entry<Integer, String> entry : variants.entrySet()) {
            if (!srcset.isEmpty()) srcset.append(", ");
            srcset.append(entry.getValue()).append(" ").append(entry.getKey()).append("w");
        }
        if (!srcset.isEmpty()) srcset.append(", ");
        srcset.append(fullUrl).append(" ").append(storedWidth).append("w");

        Map<String, String> result = new LinkedHashMap<>();
        result.put("publicUrl", fullUrl);
        result.put("key", fullKey);
        result.put("srcset", srcset.toString());
        return result;
    }

    private String normalizedPublicUrl() {
        if (publicUrl == null || publicUrl.isBlank()) return "/media";
        return publicUrl.replaceAll("/+$", "");
    }

    private void writeWebP(BufferedImage image, Path target, int targetWidth) throws IOException {
        try (OutputStream out = Files.newOutputStream(target)) {
            Thumbnails.Builder<BufferedImage> b = Thumbnails.of(image);
            if (targetWidth < image.getWidth()) {
                b.width(targetWidth);
            } else {
                b.scale(1.0);
            }
            b.outputFormat("webp")
             .outputQuality(WEBP_QUALITY)
             .toOutputStream(out);
        }
    }

    /**
     * Uploads an arbitrary file as-is (no image processing, no whitelist).
     * For portfolio attachments — any file type.
     *
     * @return map with keys "publicUrl", "key", "fileSize", "contentType", "originalName".
     */
    public Map<String, Object> uploadRawFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Файл пустой");
        }

        String safeName = sanitizeFilename(file.getOriginalFilename());
        String baseKey = UUID.randomUUID().toString();
        Path dir = Paths.get(uploadDir).resolve(baseKey);
        Files.createDirectories(dir);

        Path target = dir.resolve(safeName);
        try {
            file.transferTo(target);
        } catch (IOException e) {
            deleteDir(dir);
            throw e;
        }

        String key = baseKey + "/" + safeName;
        String mediaBaseUrl = normalizedPublicUrl();
        String publicUrlOut = mediaBaseUrl + "/" + key;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("publicUrl", publicUrlOut);
        result.put("key", key);
        result.put("fileSize", file.getSize());
        result.put("contentType", file.getContentType());
        result.put("originalName", safeName);
        return result;
    }

    /** Strip directory separators and non-printable chars; cap to 200 chars; ensure non-empty. */
    private String sanitizeFilename(String name) {
        if (name == null || name.isBlank()) return "file";
        String base = name.replace("\\", "/");
        int slash = base.lastIndexOf('/');
        if (slash >= 0) base = base.substring(slash + 1);
        base = base.replaceAll("[\\p{Cntrl}]", "");
        base = base.replaceAll("[^\\w.\\-]+", "_");
        if (base.isBlank() || base.equals(".") || base.equals("..")) base = "file";
        if (base.length() > 200) base = base.substring(0, 200);
        return base;
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
