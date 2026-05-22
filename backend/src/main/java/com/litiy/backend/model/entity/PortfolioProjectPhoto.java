package com.litiy.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "portfolio_project_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioProjectPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false, length = 512)
    private String imageUrl;

    @Column(nullable = false, length = 512)
    private String imageKey;

    @Column(columnDefinition = "TEXT")
    private String imageSrcSet;

    @Column(nullable = false)
    @Builder.Default
    private Integer positionX = 50;

    @Column(nullable = false)
    @Builder.Default
    private Integer positionY = 50;

    @Column(nullable = false)
    @Builder.Default
    private Integer scale = 100;

    @Column(nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
