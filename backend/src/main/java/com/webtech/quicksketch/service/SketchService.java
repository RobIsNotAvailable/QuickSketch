package com.webtech.quicksketch.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.webtech.quicksketch.dto.WordDto;
import com.webtech.quicksketch.dto.request.CreateSketchRequest;
import com.webtech.quicksketch.dto.response.SketchFeedResponse;
import com.webtech.quicksketch.dto.response.SketchInitResponse;
import com.webtech.quicksketch.dto.response.UserSummaryResponse;
import com.webtech.quicksketch.model.Reaction;
import com.webtech.quicksketch.model.Sketch;
import com.webtech.quicksketch.model.User;
import com.webtech.quicksketch.model.Word;
import com.webtech.quicksketch.model.enums.ReactionType;
import com.webtech.quicksketch.repository.CommentRepo;
import com.webtech.quicksketch.repository.GuessRepo;
import com.webtech.quicksketch.repository.ReactionRepo;
import com.webtech.quicksketch.repository.SketchRepo;
import com.webtech.quicksketch.repository.UserRepo;
import com.webtech.quicksketch.repository.WordRepo;
import com.webtech.quicksketch.util.SecurityUtil;
import com.webtech.quicksketch.util.StringConstants;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SketchService
{
    private final SketchRepo repo;
    private final UserRepo userRepo;
    private final WordRepo wordRepo;
    private final ReactionRepo reactionRepo;
    private final GuessRepo guessRepo;
    private final CommentRepo commentRepo;
    private final SecurityUtil securityUtil;

    private static final int TIME_LIMIT_SECONDS = 120;
    private static final int PROPOSED_WORDS = 3;
    private static final int MAX_GUESSES = 10;

    @Transactional(readOnly = true)
    public SketchInitResponse initSketchSession()
    {
        List<Word> randomWords = wordRepo.findRandomWords(PROPOSED_WORDS);

        List<WordDto> words = randomWords.stream()
                .map(w -> new WordDto(w.getId(), w.getText()))
                .toList();

        return new SketchInitResponse(words, TIME_LIMIT_SECONDS);
    }

    @Transactional
    public SketchFeedResponse createSketch(CreateSketchRequest request)
    {
        Long userId = securityUtil.getCurrentUserId();
        User user = userRepo.getReferenceById(userId);

        Word word = wordRepo.findById(request.wordId()).orElseThrow(() -> 
            new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Word")));

        Sketch sketch = new Sketch(request.imageData(), user, word);
        repo.save(sketch);

        return mapToFeedResponse(sketch, userId);
    }

    @Transactional(readOnly = true)
    public Page<SketchFeedResponse> getGlobalFeed(Pageable pageable)
    {
        Long userId = securityUtil.getCurrentUserId();

        return repo.findAllByOrderByCreatedAtDesc(pageable)
                .map(sketch -> mapToFeedResponse(sketch, userId));
    }

    @Transactional(readOnly = true)
    public Page<SketchFeedResponse> getFollowedFeed(Pageable pageable)
    {
        Long userId = securityUtil.getCurrentUserId();

        return repo.findFollowedFeed(userId, pageable)
                .map(sketch -> mapToFeedResponse(sketch, userId));
    }

    @Transactional(readOnly = true)
    public Page<SketchFeedResponse> getUserSketches(Long authorId, Pageable pageable)
    {
        if(!userRepo.existsById(authorId))
        {
            throw new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("User"));
        }

        Long userId = securityUtil.getCurrentUserId();

        return repo.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable)
                .map(sketch -> mapToFeedResponse(sketch, userId));
    }

    @Transactional(readOnly = true)
    public SketchFeedResponse getSketchById(Long sketchId)
    {
        Long userId = securityUtil.getCurrentUserId();

        Sketch sketch = repo.findById(sketchId)
                .orElseThrow(() -> new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Sketch")));

        return mapToFeedResponse(sketch, userId);
    }

    private SketchFeedResponse mapToFeedResponse(Sketch sketch, Long userId)
    {
        Long sketchId = sketch.getId();

        boolean isCompleted = repo.hasUserCompletedSketch(userId, sketchId);

        long likes = reactionRepo.countBySketchIdAndType(sketchId, ReactionType.LIKE);
        long dislikes = reactionRepo.countBySketchIdAndType(sketchId, ReactionType.DISLIKE);

        ReactionType userReaction = reactionRepo.findByUserIdAndSketchId(userId, sketchId)
                .map(Reaction::getType)
                .orElse(null);

        int remainingGuesses = MAX_GUESSES - guessRepo.countByUserIdAndSketchId(userId, sketchId);

        String targetWord = isCompleted ? sketch.getWord().getText() : null;

        long commentsCount = commentRepo.countBySketchId(sketchId);

        return new SketchFeedResponse(
            sketchId,
            sketch.getImageData(),
            sketch.getCreatedAt(),
            new UserSummaryResponse(sketch.getAuthor().getId(), sketch.getAuthor().getUsername()),
            isCompleted,
            targetWord,
            likes,
            dislikes,
            userReaction,
            remainingGuesses,
            commentsCount
        );
    }
}