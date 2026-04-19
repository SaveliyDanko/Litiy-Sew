package com.litiy.backend.service;

import com.litiy.backend.exception.AuthCodeException;
import com.litiy.backend.exception.AuthCodeException.Kind;
import com.litiy.backend.model.entity.User;
import com.litiy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthChallengeService {

    private static final String REG_CODE_KEY = "auth:verify:email:%s";
    private static final String REG_COOLDOWN_KEY = "auth:verify:email:cooldown:%s";

    private final VerificationCodeService codeService;
    private final MailService mailService;
    private final UserRepository userRepository;

    public Duration sendRegistrationCode(String email) {
        String normalized = normalize(email);
        String code = codeService.issueCode(regCodeKey(normalized), regCooldownKey(normalized));
        mailService.sendRegistrationCode(normalized, code, codeService.getTtl());
        return codeService.getTtl();
    }

    @Transactional
    public User verifyRegistration(String email, String code) {
        String normalized = normalize(email);
        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new AuthCodeException(Kind.CODE_EXPIRED, "Код истёк или не был выдан"));
        if (user.isEmailVerified()) {
            throw new AuthCodeException(Kind.EMAIL_ALREADY_VERIFIED, "Email уже подтверждён");
        }
        codeService.verify(regCodeKey(normalized), code);
        user.setEmailVerified(true);
        return user;
    }

    public Duration resendRegistrationCode(String email) {
        String normalized = normalize(email);
        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new AuthCodeException(Kind.CODE_EXPIRED, "Пользователь не найден"));
        if (user.isEmailVerified()) {
            throw new AuthCodeException(Kind.EMAIL_ALREADY_VERIFIED, "Email уже подтверждён");
        }
        return sendRegistrationCode(normalized);
    }

    public String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String regCodeKey(String email) {
        return String.format(REG_CODE_KEY, email);
    }

    private String regCooldownKey(String email) {
        return String.format(REG_COOLDOWN_KEY, email);
    }
}
