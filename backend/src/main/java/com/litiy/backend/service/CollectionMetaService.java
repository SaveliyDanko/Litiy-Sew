package com.litiy.backend.service;

import com.litiy.backend.model.dto.CollectionMetaRequest;
import com.litiy.backend.model.dto.CollectionMetaResponse;
import com.litiy.backend.model.entity.CollectionMeta;
import com.litiy.backend.repository.CollectionMetaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CollectionMetaService {

    private final CollectionMetaRepository repo;

    @Transactional(readOnly = true)
    public List<CollectionMetaResponse> listAll() {
        return repo.findAll().stream().map(CollectionMetaResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, CollectionMetaResponse> mapBySlug() {
        return repo.findAll().stream()
                .collect(Collectors.toMap(CollectionMeta::getSlug, CollectionMetaResponse::from));
    }

    public CollectionMetaResponse upsert(String slug, CollectionMetaRequest req) {
        CollectionMeta meta = repo.findBySlug(slug).orElseGet(() ->
                CollectionMeta.builder().slug(slug).title(req.title()).subtitle(req.subtitle()).build()
        );
        meta.setTitle(req.title());
        meta.setSubtitle(req.subtitle());
        return CollectionMetaResponse.from(repo.save(meta));
    }
}
