package com.litiy.backend.model.dto;

import java.util.List;

/**
 * Aggregated public content for the home & about pages — fetched in a single
 * HTTP round-trip instead of 5 separate requests. Each field is the same shape
 * the legacy per-endpoint API returns, so the frontend can populate its
 * `cachedFetch` store directly from this payload.
 */
public record BootstrapResponse(
        HeroBannerResponse hero,                          // may be null (no banner uploaded)
        List<DynamicCollectionResponse> collections,
        List<SiteImageResponse> siteImages,
        List<SiteTextResponse> siteTexts,
        List<PortfolioPhotoResponse> portfolioPhotos,
        List<PortfolioProjectResponse> portfolioProjects
) {}
