package com.litiy.backend.repository;

import com.litiy.backend.model.entity.PortfolioProjectAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioProjectAttachmentRepository extends JpaRepository<PortfolioProjectAttachment, Long> {
    List<PortfolioProjectAttachment> findAllByProjectIdOrderBySortOrderAscCreatedAtAsc(Long projectId);
    List<PortfolioProjectAttachment> findAllByProjectIdInOrderBySortOrderAscCreatedAtAsc(List<Long> projectIds);
    void deleteAllByProjectId(Long projectId);
}
