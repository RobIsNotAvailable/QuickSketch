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

import com.webtech.quicksketch.dto.request.CommentRequest;
import com.webtech.quicksketch.dto.response.CommentResponse;
import com.webtech.quicksketch.service.CommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController
{
    private final CommentService commentService;

    @PostMapping("/create")
    public ResponseEntity<CommentResponse> createComment(@RequestBody @Valid CommentRequest request)
    {
        CommentResponse response = commentService.comment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/sketch/{sketchId}")
    public ResponseEntity<Page<CommentResponse>> getSketchComments(@PathVariable Long sketchId, Pageable pageable)
    {
        Page<CommentResponse> comments = commentService.getSketchComments(sketchId, pageable);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/replies/{commentId}")
    public ResponseEntity<Page<CommentResponse>> getCommentReplies(@PathVariable Long commentId, Pageable pageable)
    {
        Page<CommentResponse> comments = commentService.getCommentReplies(commentId, pageable);
        return ResponseEntity.ok(comments);
    } 

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<CommentResponse>> getUserComments(@PathVariable Long userId, Pageable pageable)
    {
        Page<CommentResponse> comments = commentService.getUserComments(userId, pageable);
        return ResponseEntity.ok(comments);
    }
}