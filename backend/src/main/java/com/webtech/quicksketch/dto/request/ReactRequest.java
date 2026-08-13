package com.webtech.quicksketch.dto.request;

import com.webtech.quicksketch.model.enums.ReactionType;

import jakarta.validation.constraints.NotBlank;

public record ReactRequest(
    @NotBlank(message = "Reaction cannot be blank")
    ReactionType type,

    @NotBlank(message = "Sketch ID cannot be blank")
    Long sketchId
) {}