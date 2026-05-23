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
@Table(name = "site_texts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteText {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 128)
    private String slotKey;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String value = "";

    @Column(nullable = false)
    private Instant updatedAt;
}
