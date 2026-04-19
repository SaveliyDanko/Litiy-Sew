package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.Measurement;

public record MeasurementResponse(
        Long id,
        String name,
        String comment,
        Integer height,
        Integer chest,
        Integer waist,
        Integer hips,
        String fullnessGroup
) {
    public static MeasurementResponse from(Measurement m) {
        return new MeasurementResponse(
                m.getId(),
                m.getName(),
                m.getComment(),
                m.getHeight(),
                m.getChest(),
                m.getWaist(),
                m.getHips(),
                m.getFullnessGroup()
        );
    }
}
