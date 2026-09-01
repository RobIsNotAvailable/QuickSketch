package com.webtech.quicksketch.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/guesses")
@RequiredArgsConstructor
@RestController
public class KeepAliveController
{
    @GetMapping("/bombo")
    public String bombo()
    {
        return "clat";
    }
}