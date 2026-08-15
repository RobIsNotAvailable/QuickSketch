package com.webtech.quicksketch.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.webtech.quicksketch.model.Comment;

public interface CommentRepo extends JpaRepository<Comment, Long>
{
    int countBySketchId(Long sketchId);

    Page<Comment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Comment> findBySketchIdAndReplyToIsNullOrderByCreatedAtDesc(Long sketchId, Pageable pageable);
}
