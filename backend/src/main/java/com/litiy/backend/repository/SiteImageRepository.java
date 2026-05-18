package com.litiy.backend.repository;

import com.litiy.backend.model.entity.SiteImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SiteImageRepository extends JpaRepository<SiteImage, Long> {
    Optional<SiteImage> findBySlotKey(String slotKey);
    List<SiteImage> findAllByOrderBySlotKeyAsc();
}
