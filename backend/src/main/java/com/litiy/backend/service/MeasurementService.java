package com.litiy.backend.service;

import com.litiy.backend.model.dto.MeasurementRequest;
import com.litiy.backend.model.dto.MeasurementResponse;
import com.litiy.backend.model.entity.Measurement;
import com.litiy.backend.model.entity.User;
import com.litiy.backend.repository.MeasurementRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MeasurementService {

    private final MeasurementRepository measurementRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<MeasurementResponse> list(String username) {
        User user = userService.getByEmail(username);
        return measurementRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(MeasurementResponse::from)
                .toList();
    }

    @Transactional
    public MeasurementResponse create(String username, MeasurementRequest request) {
        User user = userService.getByEmail(username);
        Instant now = Instant.now();
        Measurement measurement = Measurement.builder()
                .user(user)
                .name(request.name().trim())
                .comment(normalize(request.comment()))
                .height(request.height())
                .chest(request.chest())
                .waist(request.waist())
                .hips(request.hips())
                .fullnessGroup(normalize(request.fullnessGroup()))
                .createdAt(now)
                .updatedAt(now)
                .build();
        return MeasurementResponse.from(measurementRepository.save(measurement));
    }

    @Transactional
    public MeasurementResponse update(String username, Long id, MeasurementRequest request) {
        User user = userService.getByEmail(username);
        Measurement measurement = measurementRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Мерка не найдена"));
        measurement.setName(request.name().trim());
        measurement.setComment(normalize(request.comment()));
        measurement.setHeight(request.height());
        measurement.setChest(request.chest());
        measurement.setWaist(request.waist());
        measurement.setHips(request.hips());
        measurement.setFullnessGroup(normalize(request.fullnessGroup()));
        measurement.setUpdatedAt(Instant.now());
        return MeasurementResponse.from(measurement);
    }

    @Transactional
    public void delete(String username, Long id) {
        User user = userService.getByEmail(username);
        measurementRepository.deleteByIdAndUserId(id, user.getId());
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
