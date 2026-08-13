package com.webtech.quicksketch.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webtech.quicksketch.model.Guess;

public interface GuessRepo extends JpaRepository<Guess, Long>
{
    Integer countByUserIdAndSketchId(Long userId, Long sketchId);
}
