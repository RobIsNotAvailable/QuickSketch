package com.webtech.quicksketch.dto.response;

import java.time.Instant;

public record CommentResponse(
    Long id,
    String text,
    Instant createdAt,
    UserSummaryResponse author,
    long sketchId,
    long replyToId
) {}