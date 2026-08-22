package com.webtech.quicksketch.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GuessRequest(
    @NotBlank(message = "Guess cannot be blank")
    String text,

    @NotNull(message = "Sketch ID cannot be null")
    Long sketchId
) {}