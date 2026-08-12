package com.webtech.quicksketch.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webtech.quicksketch.model.Reaction;

public interface ReactionRepo extends JpaRepository<Reaction, Long> {}
