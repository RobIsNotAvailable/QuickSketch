package com.webtech.quicksketch.dto.request;

import jakarta.validation.constraints.NotBlank;

public record GuessRequest(
    @NotBlank(message = "Guess cannot be blank")
    String text,

    @NotBlank(message = "Sketch ID cannot be blank")
    Long sketchId
) {}