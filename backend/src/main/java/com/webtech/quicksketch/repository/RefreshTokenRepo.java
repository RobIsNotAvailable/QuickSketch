package com.webtech.quicksketch.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.webtech.quicksketch.model.RefreshToken;

import org.springframework.transaction.annotation.Transactional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long>
{
    Optional<RefreshToken> findByToken(String token);
    
    @Modifying
    @Transactional
    Integer deleteByUserId(Long userId);
}