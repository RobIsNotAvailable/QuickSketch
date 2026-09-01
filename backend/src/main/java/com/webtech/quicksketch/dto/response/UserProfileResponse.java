package com.webtech.quicksketch.dto.response;

public record UserProfileResponse(
    String username,
    Boolean isFollowed,

    int totalSketchesCreated,
    double artistWinRate,

    int totalAttempts,
    int wordsGuessed,
    int wordsFailed
) {}