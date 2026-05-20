package com.litiy.backend.repository;

import com.litiy.backend.model.entity.DynamicCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DynamicCollectionRepository extends JpaRepository<DynamicCollection, Long> {
    List<DynamicCollection> findAllByOrderBySortOrderAscCreatedAtAsc();
    Optional<DynamicCollection> findBySlug(String slug);
    boolean existsBySlug(String slug);
    long count();

    @Modifying
    @Query("UPDATE DynamicCollection c SET c.featured = false WHERE c.id <> :excludeId")
    void clearFeaturedExcept(@Param("excludeId") Long excludeId);
}
