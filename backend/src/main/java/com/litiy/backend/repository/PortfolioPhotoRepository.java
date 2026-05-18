package com.litiy.backend.repository;

import com.litiy.backend.model.entity.PortfolioPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioPhotoRepository extends JpaRepository<PortfolioPhoto, Long> {
    List<PortfolioPhoto> findAllByOrderBySortOrderAscCreatedAtDesc();
}
