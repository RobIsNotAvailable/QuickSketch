package com.webtech.quicksketch.dto.response;

public record UserStatsResponse(
    String username,

    int totalSketchesCreated,
    double artistWinRate,

    int totalAttempts,
    int wordsGuessed,
    int wordsFailed
) {}