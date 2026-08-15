package com.webtech.quicksketch.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank (message = "Email field required")
    String email,

    @NotBlank (message = "Password field required")
    String password
) 
{ public String email() { return email.trim().toLowerCase(); }}
