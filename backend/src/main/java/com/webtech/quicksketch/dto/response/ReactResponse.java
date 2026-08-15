package com.webtech.quicksketch.dto.response;

import com.webtech.quicksketch.model.enums.ReactionType;

public record ReactResponse(
    ReactionType currentReaction,
    int totalLikes,
    int totalDislikes
) {}