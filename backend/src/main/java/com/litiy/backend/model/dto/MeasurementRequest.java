package com.litiy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record MeasurementRequest(
        @NotBlank @Size(max = 80) String name,
        @Size(max = 500) String comment,
        @PositiveOrZero Integer height,
        @PositiveOrZero Integer chest,
        @PositiveOrZero Integer waist,
        @PositiveOrZero Integer hips,
        @Pattern(regexp = "^[0-5]-я$", message = "Недопустимая полнотная группа") String fullnessGroup
) {}
