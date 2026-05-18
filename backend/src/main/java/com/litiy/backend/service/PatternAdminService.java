package com.litiy.backend.service;

import com.litiy.backend.model.dto.PatternItemRequest;
import com.litiy.backend.model.dto.PatternItemResponse;
import com.litiy.backend.model.entity.PatternItem;
import com.litiy.backend.repository.PatternItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PatternAdminService {

    private final PatternItemRepository patternItemRepository;
    private final MediaService mediaService;

    @Transactional(readOnly = true)
    public List<PatternItemResponse> listAll() {
        return patternItemRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PatternItemResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PatternItemResponse> listByCategory(String category) {
        return patternItemRepository.findByCategoryOrderByCreatedAtDesc(category)
                .stream()
                .map(PatternItemResponse::from)
                .toList();
    }

    public PatternItemResponse create(PatternItemRequest req) {
        PatternItem item = PatternItem.builder()
                .title(req.title())
                .category(req.category())
                .price(req.price())
                .description(req.description())
                .previewUrl(req.previewUrl())
                .previewKey(req.previewKey())
                .sizes(req.sizes())
                .heights(req.heights())
                .createdAt(Instant.now())
                .build();
        return PatternItemResponse.from(patternItemRepository.save(item));
    }

    public void delete(Long id) {
        PatternItem item = patternItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PatternItem not found: " + id));
        mediaService.deleteFile(item.getPreviewKey());
        patternItemRepository.delete(item);
    }
}
