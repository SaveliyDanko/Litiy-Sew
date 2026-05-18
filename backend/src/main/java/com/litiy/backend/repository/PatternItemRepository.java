package com.litiy.backend.repository;

import com.litiy.backend.model.entity.PatternItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatternItemRepository extends JpaRepository<PatternItem, Long> {
    List<PatternItem> findAllByOrderByCreatedAtDesc();
    List<PatternItem> findByCategoryOrderByCreatedAtDesc(String category);
}
