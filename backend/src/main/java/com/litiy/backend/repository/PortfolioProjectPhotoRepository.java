package com.litiy.backend.repository;

import com.litiy.backend.model.entity.PortfolioProjectPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioProjectPhotoRepository extends JpaRepository<PortfolioProjectPhoto, Long> {
    List<PortfolioProjectPhoto> findAllByProjectIdOrderBySortOrderAscCreatedAtAsc(Long projectId);
    List<PortfolioProjectPhoto> findAllByProjectIdInOrderBySortOrderAscCreatedAtAsc(List<Long> projectIds);
    void deleteAllByProjectId(Long projectId);
}
