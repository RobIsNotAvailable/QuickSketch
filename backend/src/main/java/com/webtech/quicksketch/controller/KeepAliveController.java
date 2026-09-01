package com.webtech.quicksketch.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/heartbeat")
@RestController
public class KeepAliveController
{
    @GetMapping("/bombo")
    public ResponseEntity<String> bombo()
    {
        return ResponseEntity.ok("clat");
    }
}