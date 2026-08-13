package com.webtech.quicksketch.dto.response;

public record GuessResponse(
    Boolean correct,
    Integer guessesLeft,
    String solution
) {}