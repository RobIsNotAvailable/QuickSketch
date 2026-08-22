package com.webtech.quicksketch.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateSketchRequest
(
    @NotBlank(message = "Image cannot be blank")
    String imageData,

    @NotNull(message = "Word ID cannot be null")
    Long wordId
) {}