package com.litiy.backend.repository;

import com.litiy.backend.model.entity.DynamicCollectionPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DynamicCollectionPhotoRepository extends JpaRepository<DynamicCollectionPhoto, Long> {
    List<DynamicCollectionPhoto> findAllByCollectionIdOrderBySortOrderAscCreatedAtAsc(Long collectionId);
    long countByCollectionId(Long collectionId);
    void deleteAllByCollectionId(Long collectionId);
}
