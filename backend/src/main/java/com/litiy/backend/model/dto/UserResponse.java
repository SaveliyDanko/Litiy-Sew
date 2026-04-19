package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.Role;
import com.litiy.backend.model.entity.User;

public record UserResponse(
        Long id,
        String email,
        Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getRole());
    }
}
