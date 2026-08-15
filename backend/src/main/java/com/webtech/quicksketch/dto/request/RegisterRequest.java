package com.webtech.quicksketch.dto.request;

import com.webtech.quicksketch.util.StringConstants;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
    @NotBlank (message = "Email field required")
    @Pattern
    (
        regexp = StringConstants.EMAIL_REGEX,
        message = StringConstants.INVALID_EMAIL_MESSAGE
    )
    String email,

    @NotBlank (message = "Username field required")
    String username,


    @NotBlank (message = "Password field required")
    @Pattern
    (
        regexp = StringConstants.VALIDATION_PATTERN,
        message = StringConstants.PASSWORD_MESSAGE
    )
    String password
) 
{ public String email() { return email.trim().toLowerCase(); }}