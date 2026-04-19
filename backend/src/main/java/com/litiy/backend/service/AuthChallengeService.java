package com.litiy.backend.service;

import com.litiy.backend.exception.AuthCodeException;
import com.litiy.backend.exception.AuthCodeException.Kind;
import com.litiy.backend.model.entity.User;
import com.litiy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthChallengeService {

    private static final String REG_CODE_KEY = "auth:verify:email:%s";
    private static final String REG_COOLDOWN_KEY = "auth:verify:email:cooldown:%s";
    private static final String LOGIN_CHALLENGE_KEY = "auth:login:challenge:%s";
    private static final String LOGIN_CHALLENGE_EMAIL_KEY = "auth:login:challenge:%s:email";
    private static final String LOGIN_COOLDOWN_KEY = "auth:login:cooldown:%s";

    private final VerificationCodeService codeService;
    private final MailService mailService;
    private final UserRepository userRepository;
    private final StringRedisTemplate redis;

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

    public LoginChallenge startLoginChallenge(String email) {
        String normalized = normalize(email);
        String challengeId = UUID.randomUUID().toString();
        String cooldownKey = loginCooldownKey(normalized);
        String code = codeService.issueCode(loginChallengeKey(challengeId), cooldownKey);
        redis.opsForValue().set(
                loginChallengeEmailKey(challengeId),
                normalized,
                codeService.getTtl()
        );
        mailService.sendLoginCode(normalized, code, codeService.getTtl());
        return new LoginChallenge(challengeId, normalized, codeService.getTtl());
    }

    public String verifyLoginChallenge(String challengeId, String code) {
        String email = redis.opsForValue().get(loginChallengeEmailKey(challengeId));
        if (email == null) {
            throw new AuthCodeException(Kind.CHALLENGE_NOT_FOUND, "Сессия входа истекла, попробуйте снова");
        }
        try {
            codeService.verify(loginChallengeKey(challengeId), code);
        } catch (AuthCodeException ex) {
            if (ex.getKind() == Kind.TOO_MANY_ATTEMPTS || ex.getKind() == Kind.CODE_EXPIRED) {
                redis.delete(loginChallengeEmailKey(challengeId));
            }
            throw ex;
        }
        redis.delete(loginChallengeEmailKey(challengeId));
        return email;
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

    private String loginChallengeKey(String challengeId) {
        return String.format(LOGIN_CHALLENGE_KEY, challengeId);
    }

    private String loginChallengeEmailKey(String challengeId) {
        return String.format(LOGIN_CHALLENGE_EMAIL_KEY, challengeId);
    }

    private String loginCooldownKey(String email) {
        return String.format(LOGIN_COOLDOWN_KEY, email);
    }

    public record LoginChallenge(String challengeId, String email, Duration ttl) {
    }
}
