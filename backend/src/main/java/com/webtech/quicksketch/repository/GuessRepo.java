package com.webtech.quicksketch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.webtech.quicksketch.model.Guess;

public interface GuessRepo extends JpaRepository<Guess, Long>
{
    int countByUserIdAndSketchId(Long userId, Long sketchId);

    int countByUserId(Long userId);

    int countByUserIdAndIsCorrectTrue(Long userId);

    @Query
    (value = """
        SELECT COUNT(*) FROM user_sketches us
        WHERE g.user_id = :userId AND g.is_correct = false
    """, nativeQuery = true)
    int countFailedSketchesByUserId(Long userId);
}
