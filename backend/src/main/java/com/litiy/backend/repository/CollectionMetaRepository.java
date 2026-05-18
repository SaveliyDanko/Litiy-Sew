package com.litiy.backend.repository;

import com.litiy.backend.model.entity.CollectionMeta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CollectionMetaRepository extends JpaRepository<CollectionMeta, Long> {
    Optional<CollectionMeta> findBySlug(String slug);
    List<CollectionMeta> findAll();
}
