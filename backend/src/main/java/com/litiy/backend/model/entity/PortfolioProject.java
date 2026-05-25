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
@Table(name = "portfolio_projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 128)
    private String eyebrow;

    @Column(nullable = false, length = 256)
    private String title;

    @Column(length = 256)
    private String meta;

    @Column(columnDefinition = "TEXT")
    private String lead;

    @Column(columnDefinition = "TEXT")
    private String paragraph1;

    @Column(columnDefinition = "TEXT")
    private String paragraph2;

    @Column(columnDefinition = "TEXT")
    private String paragraph3;

    @Column(length = 512)
    private String imageUrl;

    @Column(length = 512)
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

    @Column(name = "attachments_enabled", nullable = false)
    @Builder.Default
    private Boolean attachmentsEnabled = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
