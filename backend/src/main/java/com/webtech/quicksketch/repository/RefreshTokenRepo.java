package com.webtech.quicksketch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.webtech.quicksketch.model.RefreshToken;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, String>
{
    List<RefreshToken> findByUserIdOrderByExpirationAsc(Long userId);
}