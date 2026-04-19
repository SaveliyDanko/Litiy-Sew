package com.litiy.backend.service;

import com.litiy.backend.model.entity.Role;
import com.litiy.backend.model.entity.User;
import com.litiy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService implements org.springframework.security.core.userdetails.UserDetailsService {

    private static final int PROFILE_FIELD_MAX_LENGTH = 100;
    private static final int PHONE_NUMBER_MAX_LENGTH = 32;
    private static final String PHONE_NUMBER_REGEX = "^\\+?[1-9]\\d{7,14}$";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    @Transactional
    public User register(String email, String rawPassword) {
        String normalized = normalize(email);
        if (userRepository.existsByEmail(normalized)) {
            throw new IllegalArgumentException("Email is already registered");
        }
        User user = User.builder()
                .email(normalized)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .emailVerified(false)
                .role(Role.USER)
                .createdAt(Instant.now())
                .build();
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Transactional
    public User updateFirstName(String email, String firstName) {
        User user = getByEmail(email);
        user.setFirstName(normalizeRequiredProfileField(firstName, "First name"));
        return userRepository.save(user);
    }

    @Transactional
    public User updateLastName(String email, String lastName) {
        User user = getByEmail(email);
        user.setLastName(normalizeRequiredProfileField(lastName, "Last name"));
        return userRepository.save(user);
    }

    @Transactional
    public User updatePhoneNumber(String email, String phoneNumber) {
        User user = getByEmail(email);
        user.setPhoneNumber(normalizeRequiredPhoneNumber(phoneNumber));
        return userRepository.save(user);
    }

    @Transactional
    public User updateProfile(String email, String firstName, String lastName, String phoneNumber) {
        User user = getByEmail(email);
        boolean hasChanges = false;

        if (firstName != null) {
            user.setFirstName(normalizeRequiredProfileField(firstName, "First name"));
            hasChanges = true;
        }
        if (lastName != null) {
            user.setLastName(normalizeRequiredProfileField(lastName, "Last name"));
            hasChanges = true;
        }
        if (phoneNumber != null) {
            user.setPhoneNumber(normalizeRequiredPhoneNumber(phoneNumber));
            hasChanges = true;
        }

        if (!hasChanges) {
            throw new IllegalArgumentException("At least one profile field must be provided");
        }

        return userRepository.save(user);
    }

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRequiredProfileField(String value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        if (normalized.length() > PROFILE_FIELD_MAX_LENGTH) {
            throw new IllegalArgumentException(fieldName + " must be at most " + PROFILE_FIELD_MAX_LENGTH + " characters");
        }
        return normalized;
    }

    private String normalizeRequiredPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String normalized = phoneNumber.trim().replaceAll("[\\s()\\-]", "");
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("Phone number must not be blank");
        }
        if (normalized.length() > PHONE_NUMBER_MAX_LENGTH) {
            throw new IllegalArgumentException("Phone number must be at most " + PHONE_NUMBER_MAX_LENGTH + " characters");
        }
        if (!normalized.matches(PHONE_NUMBER_REGEX)) {
            throw new IllegalArgumentException("Phone number must be a valid international phone number");
        }
        return normalized;
    }
}
