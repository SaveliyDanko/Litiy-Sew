package com.litiy.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fe -> fe.getField(),
                        fe -> fe.getDefaultMessage() == null ? "invalid" : fe.getDefaultMessage(),
                        (a, b) -> a
                ));
        return ResponseEntity.badRequest().body(Map.of(
                "error", "validation_failed",
                "fields", fields
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArg(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "bad_request",
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler({ BadCredentialsException.class, UsernameNotFoundException.class })
    public ResponseEntity<Map<String, Object>> handleAuth(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "invalid_credentials",
                "message", "Неверный email или пароль"
        ));
    }

    @ExceptionHandler(AuthCodeException.class)
    public ResponseEntity<Map<String, Object>> handleAuthCode(AuthCodeException ex) {
        HttpStatus status = switch (ex.getKind()) {
            case EMAIL_NOT_VERIFIED -> HttpStatus.FORBIDDEN;
            case TOO_MANY_ATTEMPTS, RESEND_TOO_SOON -> HttpStatus.TOO_MANY_REQUESTS;
            case CHALLENGE_NOT_FOUND, CODE_EXPIRED -> HttpStatus.GONE;
            case INVALID_CODE -> HttpStatus.BAD_REQUEST;
            case EMAIL_ALREADY_VERIFIED -> HttpStatus.CONFLICT;
        };

        Map<String, Object> body = new HashMap<>();
        body.put("error", ex.getKind().name().toLowerCase(Locale.ROOT));
        body.put("message", ex.getMessage());
        if (ex.getRetryAfterSeconds() > 0) {
            body.put("retryAfterSeconds", ex.getRetryAfterSeconds());
        }
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(status);
        if (ex.getRetryAfterSeconds() > 0) {
            builder.header("Retry-After", String.valueOf(ex.getRetryAfterSeconds()));
        }
        return builder.body(body);
    }
}
