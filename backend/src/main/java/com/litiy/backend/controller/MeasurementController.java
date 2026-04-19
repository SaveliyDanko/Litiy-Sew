package com.litiy.backend.controller;

import com.litiy.backend.model.dto.MeasurementRequest;
import com.litiy.backend.model.dto.MeasurementResponse;
import com.litiy.backend.service.MeasurementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/measurements")
@RequiredArgsConstructor
public class MeasurementController {

    private final MeasurementService measurementService;

    @GetMapping
    public ResponseEntity<List<MeasurementResponse>> list(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(measurementService.list(principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<MeasurementResponse> create(@AuthenticationPrincipal UserDetails principal,
                                                      @Valid @RequestBody MeasurementRequest request) {
        return ResponseEntity.ok(measurementService.create(principal.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeasurementResponse> update(@AuthenticationPrincipal UserDetails principal,
                                                      @PathVariable Long id,
                                                      @Valid @RequestBody MeasurementRequest request) {
        return ResponseEntity.ok(measurementService.update(principal.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails principal,
                                       @PathVariable Long id) {
        measurementService.delete(principal.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
