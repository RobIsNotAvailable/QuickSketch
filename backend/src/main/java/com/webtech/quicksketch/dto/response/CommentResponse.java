package com.webtech.quicksketch.dto.response;

import java.time.Instant;

public record CommentResponse(
    String text,
    Instant createdAt,
    UserSummaryResponse author,
    Long sketchId,
    Long replyToId
) {}