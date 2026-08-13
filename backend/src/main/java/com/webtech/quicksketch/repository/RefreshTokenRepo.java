package com.webtech.quicksketch.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.webtech.quicksketch.model.RefreshToken;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long>
{
    Optional<RefreshToken> findByToken(String token);
    
    @Modifying
    Integer deleteByUserId(Long userId);
}