package com.litiy.backend.repository;

import com.litiy.backend.model.entity.SiteText;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SiteTextRepository extends JpaRepository<SiteText, Long> {
    Optional<SiteText> findBySlotKey(String slotKey);
    List<SiteText> findAllByOrderBySlotKeyAsc();
}
