package com.litiy.backend.service;

import com.litiy.backend.exception.MailDeliveryException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
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

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Value("${app.mail.verification-subject:Код подтверждения}")
    private String verificationSubject;

    @Value("${app.mail.login-subject:Код для входа}")
    private String loginSubject;

    @Value("${app.mail.console-fallback-enabled:false}")
    private boolean consoleFallbackEnabled;

    @PostConstruct
    void check() {
        if (!StringUtils.hasText(from)) {
            log.warn("app.mail.from is empty — письма не будут уходить с корректным From");
        }
        if (!hasSmtpCredentials()) {
            if (consoleFallbackEnabled) {
                log.warn("SMTP не настроен — письма будут печататься в лог вместо реальной отправки");
            } else {
                log.warn("SMTP не настроен — укажите MAIL_USERNAME и MAIL_PASSWORD, иначе email-коды не будут отправляться");
            }
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
        if (!hasSmtpCredentials()) {
            if (consoleFallbackEnabled) {
                log.warn("""
                        SMTP не настроен, письмо не отправлено.
                        To: {}
                        Subject: {}
                        Body:
                        {}
                        """, to, subject, body);
                return;
            }
            throw new MailDeliveryException(
                    "Почта не настроена. Укажите MAIL_USERNAME и MAIL_PASSWORD " +
                            "или включите APP_MAIL_CONSOLE_FALLBACK_ENABLED=true для локальной разработки."
            );
        }

        SimpleMailMessage message = new SimpleMailMessage();
        if (StringUtils.hasText(from)) {
            message.setFrom(from);
        }
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        try {
            mailSender.send(message);
            log.info("Отправлено письмо на {} (subject={})", to, subject);
        } catch (MailAuthenticationException ex) {
            log.error("SMTP-аутентификация не удалась при отправке письма на {}", to, ex);
            throw new MailDeliveryException(
                    "Не удалось отправить письмо: проверьте MAIL_USERNAME, MAIL_PASSWORD и App Password почтового ящика.",
                    ex
            );
        } catch (MailException ex) {
            log.error("Не удалось отправить письмо на {}", to, ex);
            throw new MailDeliveryException(
                    "Не удалось отправить письмо. Проверьте настройки SMTP и доступность почтового сервера.",
                    ex
            );
        }
    }

    private boolean hasSmtpCredentials() {
        return StringUtils.hasText(username) && StringUtils.hasText(password);
    }
}
