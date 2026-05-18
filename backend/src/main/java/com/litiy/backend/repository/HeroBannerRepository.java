package com.litiy.backend.repository;

import com.litiy.backend.model.entity.HeroBanner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HeroBannerRepository extends JpaRepository<HeroBanner, Long> {
    Optional<HeroBanner> findTopByOrderByCreatedAtDesc();
}
