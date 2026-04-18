package com.litiy.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "cart_items",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_cart_user_product_variant",
                columnNames = {"user_id", "product_id", "height", "size"}
        ),
        indexes = @Index(name = "ix_cart_user", columnList = "user_id")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "product_id", nullable = false, length = 128)
    private String productId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false, length = 512)
    private String image;

    @Column(nullable = false, length = 32)
    private String height;

    @Column(nullable = false, length = 16)
    private String size;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;
}
