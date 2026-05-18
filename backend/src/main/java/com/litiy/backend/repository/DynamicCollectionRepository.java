package com.litiy.backend.repository;

import com.litiy.backend.model.entity.DynamicCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DynamicCollectionRepository extends JpaRepository<DynamicCollection, Long> {
    List<DynamicCollection> findAllByOrderBySortOrderAscCreatedAtAsc();
    Optional<DynamicCollection> findBySlug(String slug);
    boolean existsBySlug(String slug);
    long count();
}
