package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.SiteText;

public record SiteTextResponse(
        Long id,
        String slotKey,
        String value
) {
    public static SiteTextResponse from(SiteText t) {
        return new SiteTextResponse(t.getId(), t.getSlotKey(), t.getValue());
    }
}
