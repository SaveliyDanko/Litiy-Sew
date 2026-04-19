package com.litiy.backend.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String from;

    @Value("${app.mail.verification-subject:Код подтверждения}")
    private String verificationSubject;

    @Value("${app.mail.login-subject:Код для входа}")
    private String loginSubject;

    @PostConstruct
    void check() {
        if (!StringUtils.hasText(from)) {
            log.warn("app.mail.from is empty — письма не будут уходить с корректным From");
        }
    }

    public void sendRegistrationCode(String to, String code, Duration ttl) {
        String body = """
                Здравствуйте!

                Ваш код подтверждения регистрации: %s
                Код действует %d минут.

                Если вы не регистрировались — просто проигнорируйте это письмо.
                """.formatted(code, ttl.toMinutes());
        send(to, verificationSubject, body);
    }

    public void sendLoginCode(String to, String code, Duration ttl) {
        String body = """
                Здравствуйте!

                Код для входа в аккаунт: %s
                Код действует %d минут.

                Если вы не пытались войти — рекомендуем сменить пароль.
                """.formatted(code, ttl.toMinutes());
        send(to, loginSubject, body);
    }

    private void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (StringUtils.hasText(from)) {
            message.setFrom(from);
        }
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
        log.info("Отправлено письмо на {} (subject={})", to, subject);
    }
}
