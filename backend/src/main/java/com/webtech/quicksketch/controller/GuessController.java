package com.webtech.quicksketch.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webtech.quicksketch.dto.request.GuessRequest;
import com.webtech.quicksketch.dto.response.GuessResponse;
import com.webtech.quicksketch.service.GuessService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/guesses")
@RequiredArgsConstructor
public class GuessController
{
    private final GuessService guessService;

    @PostMapping("/guess")
    public ResponseEntity<GuessResponse> guess(@RequestBody @Valid GuessRequest request)
    {
        GuessResponse response = guessService.guess(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/give-up/{sketchId}")
    public ResponseEntity<GuessResponse> giveUp(@PathVariable Long sketchId)
    {
        GuessResponse response = guessService.giveUp(sketchId);
        return ResponseEntity.ok(response);
    }
}