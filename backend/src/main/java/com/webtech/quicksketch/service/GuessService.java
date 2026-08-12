package com.webtech.quicksketch.service;

import org.springframework.stereotype.Service;

import com.webtech.quicksketch.dto.request.GuessRequest;
import com.webtech.quicksketch.model.Guess;
import com.webtech.quicksketch.model.Sketch;
import com.webtech.quicksketch.model.User;
import com.webtech.quicksketch.repository.GuessRepo;
import com.webtech.quicksketch.repository.SketchRepo;
import com.webtech.quicksketch.repository.UserRepo;
import com.webtech.quicksketch.util.SecurityUtil;
import com.webtech.quicksketch.util.StringConstants;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuessService
{
    private final GuessRepo repo;
    private final UserRepo userRepo;
    private final SketchRepo sketchRepo;
    private final SecurityUtil securityUtil;

    @Transactional
    public void guess(GuessRequest request)
    {
        Long userId = securityUtil.getCurrentUserId();

        User user = userRepo.findById(userId).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("User")));

        Sketch sketch = sketchRepo.findById(request.sketchId()).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Sketch")));

        if (sketchRepo.hasUserCompletedSketch(userId, sketch.getId())) 
        {
            throw new IllegalArgumentException("User has completed the sketch and cannot guess further.");
        }

        Guess guess = new Guess(request.text(), user, sketch);
        guess.setIsCorrect(isCorrect(guess));

        repo.save(guess);

        if(guess.getIsCorrect())
        {
            sketchRepo.markAsCompleted(true, userId, sketch.getId());
        }
        else if (repo.countByUserIdAndSketchId(userId, sketch.getId()) >= 10)
        {
            sketchRepo.markAsCompleted(false, userId, sketch.getId());
        }
    }

    private boolean isCorrect(Guess guess)
    {
        String targetText = guess.getSketch().getWord().getText();
        return guess.getText().equalsIgnoreCase(targetText);
    }
}
