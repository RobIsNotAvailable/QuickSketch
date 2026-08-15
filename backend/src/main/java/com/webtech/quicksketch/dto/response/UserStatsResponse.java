package com.webtech.quicksketch.dto.response;

public record UserStatsResponse(
    String username,

    long totalSketchesCreated,
    double artistWinRate,

    long totalAttempts,
    long wordsGuessed,
    long wordsFailed,
    double guesserWinRate
) {}