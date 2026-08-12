package com.webtech.quicksketch.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webtech.quicksketch.model.Comment;

public interface CommentRepo extends JpaRepository<Comment, Long> {}
