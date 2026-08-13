package com.webtech.quicksketch.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.webtech.quicksketch.dto.request.ReactRequest;
import com.webtech.quicksketch.dto.response.ReactResponse;
import com.webtech.quicksketch.model.Reaction;
import com.webtech.quicksketch.model.Sketch;
import com.webtech.quicksketch.model.User;
import com.webtech.quicksketch.model.enums.ReactionType;
import com.webtech.quicksketch.repository.ReactionRepo;
import com.webtech.quicksketch.repository.SketchRepo;
import com.webtech.quicksketch.repository.UserRepo;
import com.webtech.quicksketch.util.SecurityUtil;
import com.webtech.quicksketch.util.StringConstants;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReactionService
{
    private final ReactionRepo repo;
    private final UserRepo userRepo;
    private final SketchRepo sketchRepo;
    private final SecurityUtil securityUtil;

    @Transactional
    public ReactResponse react(ReactRequest request)
    {
        Long userId = securityUtil.getCurrentUserId();
        Long sketchId = request.sketchId();

        User user = userRepo.findById(userId).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("User")));
        
        Sketch sketch = sketchRepo.findById(sketchId).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Sketch")));

        Optional<Reaction> existing = repo.findByUserIdAndSketchId(userId, sketchId);
        ReactionType requestType = request.type();
        ReactionType newType = null;

        if(existing.isEmpty())
        {
            repo.save(new Reaction(requestType, user, sketch));
            newType = requestType;
        }
        else
        {
            Reaction old = existing.get();

            if(requestType == old.getType())
            {
                repo.delete(old);
            }
            else
            {
                old.setType(requestType);
                repo.save(old);
                newType = requestType;
            }
        }

        Long likes = repo.countBySketchIdAndType(sketchId, ReactionType.LIKE);
        Long dislikes = repo.countBySketchIdAndType(sketchId, ReactionType.DISLIKE);

        return new ReactResponse(newType, likes, dislikes);
    }
}
