package com.webtech.quicksketch.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.webtech.quicksketch.dto.request.CommentRequest;
import com.webtech.quicksketch.dto.response.CommentResponse;
import com.webtech.quicksketch.dto.response.UserSummaryResponse;
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
    public CommentResponse comment(CommentRequest request)
    {
        User user = userRepo.getReferenceById(securityUtil.getCurrentUserId());

        Sketch sketch = sketchRepo.findById(request.sketchId()).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Sketch")));

        if(!sketchRepo.hasUserCompletedSketch(user.getId(), sketch.getId())) 
        {
            throw new IllegalArgumentException("User has not completed the sketch and cannot comment.");
        }

        Comment replyTo = 
                Optional.ofNullable(request.replyToId())
                .map(id -> repo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Comment"))))
                .orElse(null);

        if(replyTo != null && !replyTo.getSketch().equals(sketch))
        {
            throw new IllegalArgumentException("New comment and parent comment must belong to the same sketch.");
        }
        Comment comment = new Comment(request.comment(), user, sketch, replyTo);
        repo.save(comment);

        return mapToResponse(comment);
    }

    private CommentResponse mapToResponse(Comment comment)
    {
        return new CommentResponse(comment.getText(), comment.getCreatedAt(), new UserSummaryResponse(comment.getUser().getId(), comment.getUser().getUsername()), comment.getSketch().getId(), comment.getReplyTo() != null ? comment.getReplyTo().getId() : null);
    }
}
