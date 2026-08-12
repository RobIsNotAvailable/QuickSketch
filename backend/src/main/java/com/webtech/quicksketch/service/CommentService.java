package com.webtech.quicksketch.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.webtech.quicksketch.dto.request.PostCommentRequest;
import com.webtech.quicksketch.model.Comment;
import com.webtech.quicksketch.model.Sketch;
import com.webtech.quicksketch.model.User;
import com.webtech.quicksketch.repository.CommentRepo;
import com.webtech.quicksketch.repository.SketchRepo;
import com.webtech.quicksketch.repository.UserRepo;
import com.webtech.quicksketch.util.SecurityUtil;
import com.webtech.quicksketch.util.StringConstants;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService
{
    private final CommentRepo repo;
    private final UserRepo userRepo;
    private final SketchRepo sketchRepo;
    private final SecurityUtil securityUtil;

    @Transactional
    public void postComment(PostCommentRequest request)
    {
        User user = userRepo.findById(securityUtil.getCurrentUserId()).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("User")));

        Sketch sketch = sketchRepo.findById(request.sketchId()).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Sketch")));

        if (!sketchRepo.hasUserCompletedSketch(user.getId(), sketch.getId())) 
        {
            throw new IllegalArgumentException("User has not completed the sketch and cannot comment.");
        }

        Comment replyTo = 
                Optional.ofNullable(request.replyToId())
                .map(id -> repo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Comment"))))
                .orElse(null);

        if (replyTo != null && !replyTo.getSketch().equals(sketch))
        {
            throw new IllegalArgumentException("New comment and parent comment must belong to the same sketch.");
        }
        Comment comment = new Comment(request.comment(), user, sketch, replyTo);
        repo.save(comment);
    }
}
