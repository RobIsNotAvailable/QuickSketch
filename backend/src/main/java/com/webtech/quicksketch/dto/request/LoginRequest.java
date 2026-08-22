package com.webtech.quicksketch.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank (message = "Email/username field required")
    String key,

    @NotBlank (message = "Password field required")
    String password
) 
{
    public String key()
    {
        if(key.contains("@"))
            return key.trim().toLowerCase();
        return key;
    }
}
