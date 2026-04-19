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

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
