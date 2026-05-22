package com.litiy.backend.repository;

import com.litiy.backend.model.entity.PortfolioProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioProjectRepository extends JpaRepository<PortfolioProject, Long> {
    List<PortfolioProject> findAllByOrderBySortOrderAscCreatedAtAsc();
}
