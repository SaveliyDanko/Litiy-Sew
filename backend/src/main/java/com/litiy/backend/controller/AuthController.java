package com.litiy.backend.controller;

import com.litiy.backend.exception.AuthCodeException;
import com.litiy.backend.exception.AuthCodeException.Kind;
import com.litiy.backend.model.dto.LoginRequest;
import com.litiy.backend.model.dto.RegisterRequest;
import com.litiy.backend.model.dto.RegisterResponse;
import com.litiy.backend.model.dto.ResendCodeRequest;
import com.litiy.backend.model.dto.UserResponse;
import com.litiy.backend.model.dto.VerifyEmailRequest;
import com.litiy.backend.model.entity.User;
import com.litiy.backend.service.AuthChallengeService;
import com.litiy.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthChallengeService authChallengeService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request.email(), request.password());
        Duration ttl = authChallengeService.sendRegistrationCode(user.getEmail());
        return ResponseEntity.ok(new RegisterResponse(
                user.getId(),
                user.getEmail(),
                "email_verification_required",
                ttl.toSeconds()
        ));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<UserResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        User user = authChallengeService.verifyRegistration(request.email(), request.code());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PostMapping("/resend-code")
    public ResponseEntity<RegisterResponse> resendCode(@Valid @RequestBody ResendCodeRequest request) {
        Duration ttl = authChallengeService.resendRegistrationCode(request.email());
        return ResponseEntity.ok(new RegisterResponse(
                null,
                authChallengeService.normalize(request.email()),
                "email_verification_required",
                ttl.toSeconds()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest,
                                              HttpServletResponse httpResponse) {
        Authentication authToken = new UsernamePasswordAuthenticationToken(
                request.email(), request.password());
        authenticationManager.authenticate(authToken);

        User user = userService.getByEmail(request.email());
        if (!user.isEmailVerified()) {
            throw new AuthCodeException(Kind.EMAIL_NOT_VERIFIED, "Email не подтверждён");
        }

        UserDetails userDetails = userService.loadUserByUsername(user.getEmail());
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
