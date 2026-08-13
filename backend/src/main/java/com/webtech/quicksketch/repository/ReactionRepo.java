package com.webtech.quicksketch.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webtech.quicksketch.model.Reaction;
import com.webtech.quicksketch.model.enums.ReactionType;

public interface ReactionRepo extends JpaRepository<Reaction, Long>
{
    Optional<Reaction> findByUserIdAndSketchId(Long userId, Long sketchId);

    Long countBySketchIdAndType(Long sketchId, ReactionType type);
}
