package com.webtech.quicksketch.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CommentRequest(
    @NotBlank(message = "Comment cannot be blank")
    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    String comment,

    @NotNull(message = "Sketch ID cannot be null")
    Long sketchId,

    Long replyToId
) {}