package com.webtech.quicksketch.dto.response;

import com.webtech.quicksketch.model.enums.GuessAccuracy;

public record GuessResponse(
    GuessAccuracy accuracy,
    int guessesLeft,
    String solution
) {}