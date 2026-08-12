package com.webtech.quicksketch.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webtech.quicksketch.model.Word;

public interface WordRepo extends JpaRepository<Word, Long> {}
