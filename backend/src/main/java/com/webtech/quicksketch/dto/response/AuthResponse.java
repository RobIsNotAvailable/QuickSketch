package com.webtech.quicksketch.dto.response;

public record AuthResponse(
    String jwt,
    String refresh
) {}