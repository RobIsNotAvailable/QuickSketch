package com.webtech.quicksketch.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommentRequest(
    @NotBlank(message = "Comment cannot be blank")
    String comment,

    @NotNull(message = "Sketch ID cannot be null")
    Long sketchId,

    Long replyToId
) {}