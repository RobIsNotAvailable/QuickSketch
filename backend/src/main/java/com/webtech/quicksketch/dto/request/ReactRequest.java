package com.webtech.quicksketch.dto.request;

import com.webtech.quicksketch.model.enums.ReactionType;

import jakarta.validation.constraints.NotNull;


public record ReactRequest(
    @NotNull(message = "Reaction cannot be null")
    ReactionType type,

    @NotNull(message = "Sketch ID cannot be blank")
    Long sketchId
) {}