package com.webtech.quicksketch.service;

import org.springframework.stereotype.Service;

import com.webtech.quicksketch.dto.request.GuessRequest;
import com.webtech.quicksketch.dto.response.GuessResponse;
import com.webtech.quicksketch.model.Guess;
import com.webtech.quicksketch.model.Sketch;
import com.webtech.quicksketch.model.User;
import com.webtech.quicksketch.repository.GuessRepo;
import com.webtech.quicksketch.repository.SketchRepo;
import com.webtech.quicksketch.repository.UserRepo;
import com.webtech.quicksketch.util.SecurityUtil;
import com.webtech.quicksketch.util.StringConstants;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuessService
{
    private final GuessRepo repo;
    private final UserRepo userRepo;
    private final SketchRepo sketchRepo;
    private final SecurityUtil securityUtil;

    private static final int MAX_GUESSES = 10;

    @Transactional
    public GuessResponse guess(GuessRequest request)
    {
        Long userId = securityUtil.getCurrentUserId();

        User user = userRepo.getReferenceById(securityUtil.getCurrentUserId());

        Sketch sketch = sketchRepo.findById(request.sketchId()).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Sketch")));

        if(sketchRepo.hasUserCompletedSketch(userId, sketch.getId())) 
        {
            throw new IllegalArgumentException("User has completed the sketch and cannot guess further.");
        }

        Guess guess = new Guess(request.text(), user, sketch);
        String targetText = guess.getSketch().getWord().getText();
        Boolean isCorrect = guess.getText().equalsIgnoreCase(targetText);
        guess.setIsCorrect(isCorrect);

        repo.save(guess);

        int guessCount = repo.countByUserIdAndSketchId(userId, sketch.getId());
        
        if(isCorrect || guessCount >= MAX_GUESSES)
        {
            sketchRepo.markAsCompleted(isCorrect, userId, sketch.getId());
        }
        else
        {
            targetText = null;
        }

        return new GuessResponse(isCorrect, MAX_GUESSES - guessCount, targetText);
    }

    @Transactional
    public GuessResponse giveUp(Long sketchId)
    {
        Long userId = securityUtil.getCurrentUserId();
        
        Sketch sketch = sketchRepo.findById(sketchId).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Sketch")));

        if(sketchRepo.hasUserCompletedSketch(userId, sketchId))
        {
            throw new IllegalArgumentException("User has completed the sketch already and cannot give up.");
        }

        sketchRepo.markAsCompleted(false, userId, sketchId);

        return new GuessResponse(false, 0, sketch.getWord().getText());
    }
}
