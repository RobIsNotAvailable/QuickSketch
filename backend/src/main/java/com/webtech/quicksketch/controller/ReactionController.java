package com.webtech.quicksketch.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webtech.quicksketch.dto.request.ReactRequest;
import com.webtech.quicksketch.dto.response.ReactResponse;
import com.webtech.quicksketch.service.ReactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reactions")
@RequiredArgsConstructor
public class ReactionController
{
    private final ReactionService reactionService;

    @PostMapping("/react")
    public ResponseEntity<ReactResponse> react(@RequestBody @Valid ReactRequest request)
    {
        ReactResponse response = reactionService.react(request);
        return ResponseEntity.ok(response);
    }
}