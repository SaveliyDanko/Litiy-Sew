package com.litiy.backend.repository;

import com.litiy.backend.model.entity.Measurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeasurementRepository extends JpaRepository<Measurement, Long> {
    List<Measurement> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Measurement> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
