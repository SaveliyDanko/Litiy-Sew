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
@Table(name = "dynamic_collections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DynamicCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 128)
    private String slug;

    @Column(nullable = false, length = 256)
    private String title;

    @Column(length = 512)
    private String subtitle;

    @Column(length = 256)
    private String eyebrow;

    @Column(length = 1024)
    private String description;

    @Column(length = 1024)
    private String detailIntro;

    @Column(length = 1024)
    private String detailFocus;

    @Column(length = 256)
    private String groupTitle;

    @Column
    @Builder.Default
    private Boolean hideCardLabel = false;

    /** 'bottom-left' | 'bottom-center' | 'center' */
    @Column(length = 32)
    @Builder.Default
    private String heroTitlePosition = "bottom-left";

    /** 'full' | 'half' | 'auto' */
    @Column(length = 16)
    @Builder.Default
    private String heroHeightMode = "full";

    /** Card media height in px for mobile (null = CSS default) */
    @Column
    private Integer cardHeightMobile;

    /** Card media height in px for desktop (null = CSS default) */
    @Column
    private Integer cardHeightDesktop;

    /** 'warm' | 'cool' | 'neutral' */
    @Column(length = 16)
    @Builder.Default
    private String tone = "neutral";

    /** 'COLLECTION' | 'SOLO' | 'SKETCH' */
    @Column(length = 16)
    @Builder.Default
    private String category = "COLLECTION";

    @Column(nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
