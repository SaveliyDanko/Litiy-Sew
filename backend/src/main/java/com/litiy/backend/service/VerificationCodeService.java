package com.litiy.backend.service;

import com.litiy.backend.exception.AuthCodeException;
import com.litiy.backend.exception.AuthCodeException.Kind;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VerificationCodeService {

    private static final String FIELD_HASH = "hash";
    private static final String FIELD_ATTEMPTS = "attempts";

    private final StringRedisTemplate redis;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.auth.code.length:6}")
    private int codeLength;

    @Value("${app.auth.code.ttl:10m}")
    private Duration ttl;

    @Value("${app.auth.code.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.auth.code.resend-cooldown:60s}")
    private Duration resendCooldown;

    public Duration getTtl() {
        return ttl;
    }

    public Duration getResendCooldown() {
        return resendCooldown;
    }

    public String issueCode(String codeKey, String cooldownKey) {
        assertNotOnCooldown(cooldownKey);
        String code = generateCode();
        HashOperations<String, String, String> ops = redis.opsForHash();
        ops.put(codeKey, FIELD_HASH, passwordEncoder.encode(code));
        ops.put(codeKey, FIELD_ATTEMPTS, "0");
        redis.expire(codeKey, ttl);
        redis.opsForValue().set(cooldownKey, "1", resendCooldown);
        return code;
    }

    public void verify(String codeKey, String submittedCode) {
        HashOperations<String, String, String> ops = redis.opsForHash();
        Map<String, String> entries = ops.entries(codeKey);
        if (entries == null || entries.isEmpty() || !entries.containsKey(FIELD_HASH)) {
            throw new AuthCodeException(Kind.CODE_EXPIRED, "Код истёк или не был выдан");
        }

        int attempts = parseAttempts(entries.get(FIELD_ATTEMPTS));
        if (attempts >= maxAttempts) {
            redis.delete(codeKey);
            throw new AuthCodeException(Kind.TOO_MANY_ATTEMPTS, "Превышено число попыток ввода кода");
        }

        String hash = entries.get(FIELD_HASH);
        if (!passwordEncoder.matches(submittedCode, hash)) {
            long newAttempts = ops.increment(codeKey, FIELD_ATTEMPTS, 1L);
            if (newAttempts >= maxAttempts) {
                redis.delete(codeKey);
                throw new AuthCodeException(Kind.TOO_MANY_ATTEMPTS, "Превышено число попыток ввода кода");
            }
            throw new AuthCodeException(Kind.INVALID_CODE, "Неверный код подтверждения");
        }

        redis.delete(codeKey);
    }

    private void assertNotOnCooldown(String cooldownKey) {
        Long ttlSeconds = redis.getExpire(cooldownKey);
        Boolean exists = redis.hasKey(cooldownKey);
        if (Boolean.TRUE.equals(exists) && ttlSeconds != null && ttlSeconds > 0) {
            throw new AuthCodeException(
                    Kind.RESEND_TOO_SOON,
                    "Повторная отправка кода доступна позже",
                    ttlSeconds
            );
        }
    }

    private int parseAttempts(String raw) {
        if (raw == null) {
            return 0;
        }
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder(codeLength);
        for (int i = 0; i < codeLength; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
