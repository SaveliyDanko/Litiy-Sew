package com.litiy.backend.model.dto;

import com.litiy.backend.model.entity.Role;
import com.litiy.backend.model.entity.User;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phoneNumber,
        Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getRole()
        );
    }
}
