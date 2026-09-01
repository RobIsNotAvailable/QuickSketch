package com.webtech.quicksketch.dto.response;

import java.time.Instant;

import com.webtech.quicksketch.model.enums.ReactionType;

public record SketchFeedResponse(
    Long id,
    String imageData,
    Instant createdAt,
    UserSummaryResponse author,
    Boolean isCompletedByCurrentUser,
    String targetWord,
    int likes,
    int dislikes,
    ReactionType currentUserReaction,
    Boolean isUserFollowing,
    int remainingGuesses,
    int commentsCount
) {}