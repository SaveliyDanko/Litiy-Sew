package com.litiy.backend.service;

import com.litiy.backend.model.dto.SiteTextResponse;
import com.litiy.backend.model.entity.SiteText;
import com.litiy.backend.repository.SiteTextRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SiteTextService {

    private final SiteTextRepository repo;

    @Transactional(readOnly = true)
    public List<SiteTextResponse> listAll() {
        return repo.findAllByOrderBySlotKeyAsc().stream().map(SiteTextResponse::from).toList();
    }

    public SiteTextResponse upsert(String slotKey, String value) {
        SiteText existing = repo.findBySlotKey(slotKey).orElse(null);
        if (existing != null) {
            existing.setValue(value);
            existing.setUpdatedAt(Instant.now());
            return SiteTextResponse.from(repo.save(existing));
        }
        return SiteTextResponse.from(repo.save(
                SiteText.builder()
                        .slotKey(slotKey)
                        .value(value)
                        .updatedAt(Instant.now())
                        .build()
        ));
    }
}
