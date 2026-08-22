package com.webtech.quicksketch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.webtech.quicksketch.model.Guess;
import com.webtech.quicksketch.model.enums.GuessAccuracy;

public interface GuessRepo extends JpaRepository<Guess, Long>
{
    int countByUserIdAndSketchId(Long userId, Long sketchId);

    int countByUserId(Long userId);

    int countByUserIdAndAccuracy(Long userId, GuessAccuracy accuracy);

    @Query
    (value = """
        SELECT COUNT(*) FROM user_sketches us
        WHERE us.user_id = :userId AND us.guessed = false
    """, nativeQuery = true)
    int countFailedSketchesByUserId(Long userId);
}
