package com.litiy.backend.service;

import com.litiy.backend.model.dto.ProductRequest;
import com.litiy.backend.model.dto.ProductResponse;
import com.litiy.backend.model.entity.Product;
import com.litiy.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductAdminService {

    private final ProductRepository productRepository;
    private final MediaService mediaService;

    @Transactional(readOnly = true)
    public List<ProductResponse> listAll() {
        return productRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    public ProductResponse create(ProductRequest req) {
        Product product = Product.builder()
                .title(req.title())
                .description(req.description())
                .price(req.price())
                .imageUrl(req.imageUrl())
                .imageKey(req.imageKey())
                .imageSrcSet(req.imageSrcSet())
                .createdAt(Instant.now())
                .build();
        return ProductResponse.from(productRepository.save(product));
    }

    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        mediaService.deleteFile(product.getImageKey());
        productRepository.delete(product);
    }
}
