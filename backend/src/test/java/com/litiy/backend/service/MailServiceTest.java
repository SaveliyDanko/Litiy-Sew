package com.litiy.backend.service;

import com.litiy.backend.exception.MailDeliveryException;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class MailServiceTest {

    @Test
    void logsCodeInsteadOfSendingWhenFallbackEnabledAndSmtpMissing() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        MailService service = new MailService(mailSender);
        ReflectionTestUtils.setField(service, "consoleFallbackEnabled", true);
        ReflectionTestUtils.setField(service, "verificationSubject", "Код подтверждения");

        assertDoesNotThrow(() -> service.sendRegistrationCode("alice@example.com", "123456", Duration.ofMinutes(10)));
        verifyNoInteractions(mailSender);
    }

    @Test
    void throwsClearErrorWhenSmtpMissingAndFallbackDisabled() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        MailService service = new MailService(mailSender);
        ReflectionTestUtils.setField(service, "consoleFallbackEnabled", false);
        ReflectionTestUtils.setField(service, "verificationSubject", "Код подтверждения");

        assertThrows(MailDeliveryException.class,
                () -> service.sendRegistrationCode("alice@example.com", "123456", Duration.ofMinutes(10)));
        verifyNoInteractions(mailSender);
    }

    @Test
    void wrapsAuthenticationErrorsIntoMailDeliveryException() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        doThrow(new MailAuthenticationException("bad credentials")).when(mailSender).send(org.mockito.ArgumentMatchers.any(org.springframework.mail.SimpleMailMessage.class));

        MailService service = new MailService(mailSender);
        ReflectionTestUtils.setField(service, "username", "alice@example.com");
        ReflectionTestUtils.setField(service, "password", "app-password");
        ReflectionTestUtils.setField(service, "verificationSubject", "Код подтверждения");

        assertThrows(MailDeliveryException.class,
                () -> service.sendRegistrationCode("alice@example.com", "123456", Duration.ofMinutes(10)));
        verify(mailSender).send(org.mockito.ArgumentMatchers.any(org.springframework.mail.SimpleMailMessage.class));
    }
}
