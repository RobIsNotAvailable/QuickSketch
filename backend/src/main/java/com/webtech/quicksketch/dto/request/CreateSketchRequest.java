package com.webtech.quicksketch.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateSketchRequest
(
    @NotBlank(message = "Image cannot be blank")
    String imageData,

    @NotBlank(message = "Word ID cannot be blank")
    Long wordId
) {}