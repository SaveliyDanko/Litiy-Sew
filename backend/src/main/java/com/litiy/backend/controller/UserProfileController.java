package com.litiy.backend.controller;

import com.litiy.backend.model.dto.UpdateFirstNameRequest;
import com.litiy.backend.model.dto.UpdateLastNameRequest;
import com.litiy.backend.model.dto.UpdatePhoneNumberRequest;
import com.litiy.backend.model.dto.UpdateUserProfileRequest;
import com.litiy.backend.model.dto.UserResponse;
import com.litiy.backend.model.entity.User;
import com.litiy.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;

    @PatchMapping("/first-name")
    public ResponseEntity<UserResponse> updateFirstName(Authentication authentication,
                                                        @Valid @RequestBody UpdateFirstNameRequest request) {
        User user = userService.updateFirstName(authentication.getName(), request.firstName());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PatchMapping("/last-name")
    public ResponseEntity<UserResponse> updateLastName(Authentication authentication,
                                                       @Valid @RequestBody UpdateLastNameRequest request) {
        User user = userService.updateLastName(authentication.getName(), request.lastName());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PatchMapping("/phone-number")
    public ResponseEntity<UserResponse> updatePhoneNumber(Authentication authentication,
                                                          @Valid @RequestBody UpdatePhoneNumberRequest request) {
        User user = userService.updatePhoneNumber(authentication.getName(), request.phoneNumber());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(Authentication authentication,
                                                      @Valid @RequestBody UpdateUserProfileRequest request) {
        User user = userService.updateProfile(
                authentication.getName(),
                request.firstName(),
                request.lastName(),
                request.phoneNumber()
        );
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
