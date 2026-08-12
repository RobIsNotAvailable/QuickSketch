package com.webtech.quicksketch.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PostCommentRequest(
    @NotBlank(message = "Comment cannot be blank")
    String comment,

    @NotBlank(message = "Sketch ID cannot be blank")
    Long sketchId,

    Long replyToId
) {}