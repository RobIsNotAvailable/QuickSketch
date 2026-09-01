package com.webtech.quicksketch.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webtech.quicksketch.dto.request.GuessRequest;
import com.webtech.quicksketch.dto.response.GuessResponse;
import com.webtech.quicksketch.model.Guess;
import com.webtech.quicksketch.model.Sketch;
import com.webtech.quicksketch.model.User;
import com.webtech.quicksketch.model.enums.GuessAccuracy;
import com.webtech.quicksketch.repository.GuessRepo;
import com.webtech.quicksketch.repository.SketchRepo;
import com.webtech.quicksketch.repository.UserRepo;
import com.webtech.quicksketch.util.SecurityUtil;
import com.webtech.quicksketch.util.StringConstants;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuessService
{
    private final GuessRepo repo;
    private final UserRepo userRepo;
    private final SketchRepo sketchRepo;

    private static final int MAX_GUESSES = 10;

    @Transactional
    public GuessResponse guess(GuessRequest request)
    {
        Long userId = SecurityUtil.getCurrentUserId().orElseThrow(() ->
            new SecurityException("User not authenticated"));

        User user = userRepo.getReferenceById(userId);

        Sketch sketch = sketchRepo.findById(request.sketchId()).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND("Sketch")));

        if(sketchRepo.hasUserCompletedSketch(userId, sketch.getId())) 
        {
            throw new IllegalStateException("User has completed the sketch and cannot guess further");
        }

        Guess guess = new Guess(request.text(), user, sketch);
        String targetText = guess.getSketch().getWord().getText();
        GuessAccuracy accuracy = calculateAccuracy(guess.getText(), targetText);
        guess.setAccuracy(accuracy);

        repo.save(guess);

        int guessCount = repo.countByUserIdAndSketchId(userId, sketch.getId());
        
        if(accuracy == GuessAccuracy.CORRECT || guessCount >= MAX_GUESSES)
        {
            sketchRepo.markAsCompleted((accuracy == GuessAccuracy.CORRECT), userId, sketch.getId());
        }
        else
        {
            targetText = null;
        }

        return new GuessResponse(accuracy, MAX_GUESSES - guessCount, targetText);
    }

    @Transactional
    public GuessResponse giveUp(Long sketchId)
    {
        Long userId = SecurityUtil.getCurrentUserId().orElseThrow(() ->
            new SecurityException("User not authenticated"));
        
        Sketch sketch = sketchRepo.findById(sketchId).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND("Sketch")));

        if(sketchRepo.hasUserCompletedSketch(userId, sketchId))
        {
            throw new IllegalStateException("User has completed the sketch already and cannot give up");
        }

        sketchRepo.markAsCompleted(false, userId, sketchId);

        return new GuessResponse(GuessAccuracy.WRONG, 0, sketch.getWord().getText());
    }

    private GuessAccuracy calculateAccuracy(String guess, String target)
    {
        String cleanGuess = guess.trim().toLowerCase();
        String cleanTarget = target.trim().toLowerCase();

        if (cleanGuess.equals(cleanTarget))
        {
            return GuessAccuracy.CORRECT;
        }

        int distance = calculateDamerauLevenshteinDistance(cleanGuess, cleanTarget);
        int allowedErrors = cleanTarget.length() > 7 ? 2 : 1;

        if (distance <= allowedErrors)
        {
            return GuessAccuracy.CLOSE;
        }

        return GuessAccuracy.WRONG;
    }

    private int calculateDamerauLevenshteinDistance(String s1, String s2)
    {
        int len1 = s1.length();
        int len2 = s2.length();
        int[][] dp = new int[len1 + 1][len2 + 1];

        for (int i = 0; i <= len1; i++)
        {
            dp[i][0] = i;
        }

        for (int j = 0; j <= len2; j++)
        {
            dp[0][j] = j;
        }

        for (int i = 1; i <= len1; i++)
        {
            for (int j = 1; j <= len2; j++)
            {
                int cost = (s1.charAt(i - 1) == s2.charAt(j - 1)) ? 0 : 1;

                int minCost = Math.min
                (
                    dp[i - 1][j - 1] + cost,
                    Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1)
                );

                if (i > 1 && j > 1 && s1.charAt(i - 1) == s2.charAt(j - 2) && s1.charAt(i - 2) == s2.charAt(j - 1))
                {
                    minCost = Math.min(minCost, dp[i - 2][j - 2] + cost);
                }

                dp[i][j] = minCost;
            }
        }

        return dp[len1][len2];
    }
}
