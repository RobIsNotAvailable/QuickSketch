package com.webtech.quicksketch.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webtech.quicksketch.dto.request.CreateSketchRequest;
import com.webtech.quicksketch.dto.response.SketchFeedResponse;
import com.webtech.quicksketch.dto.response.SketchInitResponse;
import com.webtech.quicksketch.service.SketchService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sketches")
@RequiredArgsConstructor
public class SketchController
{
    private final SketchService sketchService;

    @GetMapping("/init")
    public ResponseEntity<SketchInitResponse> initSketchSession()
    {
        SketchInitResponse response = sketchService.initSketchSession();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    public ResponseEntity<SketchFeedResponse> createSketch(@RequestBody @Valid CreateSketchRequest request)
    {
        SketchFeedResponse response = sketchService.createSketch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/feed/global")
    public ResponseEntity<Page<SketchFeedResponse>> getGlobalFeed(Pageable pageable)
    {
        Page<SketchFeedResponse> feed = sketchService.getGlobalFeed(pageable);
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/feed/followed")
    public ResponseEntity<Page<SketchFeedResponse>> getFollowedFeed(Pageable pageable)
    {
        Page<SketchFeedResponse> feed = sketchService.getFollowedFeed(pageable);
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/user/{authorId}")
    public ResponseEntity<Page<SketchFeedResponse>> getUserSketches(@PathVariable Long authorId, Pageable pageable)
    {
        Page<SketchFeedResponse> sketches = sketchService.getUserSketches(authorId, pageable);
        return ResponseEntity.ok(sketches);
    }

    @GetMapping("/get/{sketchId}")
    public ResponseEntity<SketchFeedResponse> getSketchById(@PathVariable Long sketchId)
    {
        SketchFeedResponse sketch = sketchService.getSketchById(sketchId);
        return ResponseEntity.ok(sketch);
    }
}