package com.litiy.backend.exception;

public class AuthCodeException extends RuntimeException {

    public enum Kind {
        INVALID_CODE,
        CODE_EXPIRED,
        TOO_MANY_ATTEMPTS,
        RESEND_TOO_SOON,
        EMAIL_NOT_VERIFIED,
        EMAIL_ALREADY_VERIFIED,
        CHALLENGE_NOT_FOUND
    }

    private final Kind kind;
    private final long retryAfterSeconds;

    public AuthCodeException(Kind kind, String message) {
        this(kind, message, 0);
    }

    public AuthCodeException(Kind kind, String message, long retryAfterSeconds) {
        super(message);
        this.kind = kind;
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public Kind getKind() {
        return kind;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
