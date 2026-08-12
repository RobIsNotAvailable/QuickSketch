package com.webtech.quicksketch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.webtech.quicksketch.model.Sketch;

import jakarta.transaction.Transactional;

public interface SketchRepo extends JpaRepository<Sketch, Long>
{
    @Query(value = 
        """
            SELECT CASE WHEN 
                EXISTS (SELECT 1 FROM sketches WHERE id = :sketchId AND user_id = :userId)
                OR
                EXISTS (SELECT 1 FROM user_sketches WHERE user_id = :userId AND sketch_id = :sketchId)
            THEN true ELSE false END
        """, nativeQuery = true)
    boolean hasUserCompletedSketch(@Param("userId") Long userId, @Param("sketchId") Long sketchId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO user_sketches (guessed, user_id, sketch_id) VALUES (:guessed, :userId, :sketchId) ON CONFLICT DO NOTHING", nativeQuery = true)
    void markAsCompleted(@Param("guessed") Boolean guessed, @Param("userId") Long userId, @Param("sketchId") Long sketchId);
}
