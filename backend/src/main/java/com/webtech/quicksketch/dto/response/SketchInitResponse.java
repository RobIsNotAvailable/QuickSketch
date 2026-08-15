package com.webtech.quicksketch.dto.response;

import java.util.List;

import com.webtech.quicksketch.dto.WordDto;

public record SketchInitResponse(
    List<WordDto> words,
    int timeLimitSeconds
) {}