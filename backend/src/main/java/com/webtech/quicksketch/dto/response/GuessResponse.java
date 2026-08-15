package com.webtech.quicksketch.dto.response;

public record GuessResponse(
    Boolean correct,
    int guessesLeft,
    String solution
) {}