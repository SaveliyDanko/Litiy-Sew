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
@Table(name = "hero_banners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeroBanner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 512)
    private String imageUrl;

    @Column(nullable = false, length = 512)
    private String imageKey;

    @Column(nullable = false)
    @Builder.Default
    private Integer positionX = 50;

    @Column(nullable = false)
    @Builder.Default
    private Integer positionY = 50;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
