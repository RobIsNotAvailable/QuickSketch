package com.webtech.quicksketch.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webtech.quicksketch.dto.LeaderboardEntryProjection;
import com.webtech.quicksketch.dto.request.LoginRequest;
import com.webtech.quicksketch.dto.request.RefreshTokenRequest;
import com.webtech.quicksketch.dto.request.RegisterRequest;
import com.webtech.quicksketch.dto.response.AuthResponse;
import com.webtech.quicksketch.dto.response.LeaderboardResponse;
import com.webtech.quicksketch.dto.response.UserStatsResponse;
import com.webtech.quicksketch.model.RefreshToken;
import com.webtech.quicksketch.model.User;
import com.webtech.quicksketch.model.enums.GuessAccuracy;
import com.webtech.quicksketch.repository.GuessRepo;
import com.webtech.quicksketch.repository.RefreshTokenRepo;
import com.webtech.quicksketch.repository.SketchRepo;
import com.webtech.quicksketch.repository.UserRepo;
import com.webtech.quicksketch.service.utilityservice.TokenService;
import com.webtech.quicksketch.util.SecurityUtil;
import com.webtech.quicksketch.util.StringConstants;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService
{
    private final UserRepo repo;
    private final PasswordEncoder encoder;
    private final TokenService tokenService;
    private final RefreshTokenRepo tokenRepo;
    private final SketchRepo sketchRepo;
    private final GuessRepo guessRepo;

    @Transactional
    public AuthResponse login(LoginRequest request)
    {
        User user = repo.findByEmailOrUsername(request.key(), request.key()).orElseThrow(() -> 
            new SecurityException(StringConstants.INVALID_CREDENTIALS_MESSAGE));

        if (!encoder.matches(request.password(), user.getPassword()))
            throw new SecurityException(StringConstants.INVALID_CREDENTIALS_MESSAGE);

        String accessToken = tokenService.generateAccessToken(user);
        
        tokenRepo.deleteByUserId(user.getId());
        RefreshToken refreshToken = tokenService.generateRefreshToken(user);
        tokenRepo.save(refreshToken);


        return new AuthResponse(accessToken, refreshToken.getToken());
    }


    @Transactional
    public AuthResponse register(RegisterRequest request)
    {
        if(repo.existsByEmail(request.email()))
        {
            throw new IllegalArgumentException("Email already in use");
        }

        if(repo.existsByUsername(request.username()))
        {
            throw new IllegalArgumentException("Username already taken");
        }

        User user = new User(request.username(), request.email(), encoder.encode(request.password()));

        repo.save(user);

        String accessToken = tokenService.generateAccessToken(user);
        RefreshToken refreshToken = tokenService.generateRefreshToken(user);

        tokenRepo.save(refreshToken);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    @Transactional
    public void logout()
    {
        Long userId = SecurityUtil.getCurrentUserId().orElseThrow(() ->
            new SecurityException("User not authenticated"));
        tokenRepo.deleteByUserId(userId);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request)
    {
        RefreshToken token = tokenRepo.findByToken(request.refreshToken()).orElseThrow(() ->
                new SecurityException(StringConstants.NOT_FOUND("Token")));

        if(token.isExpired())
        {
            throw new SecurityException("Session is expired. Please login again");        
        }

        User user = token.getUser();
        String newAccessToken = tokenService.generateAccessToken(user);
        RefreshToken newRefreshToken = tokenService.generateRefreshToken(user);

        tokenRepo.save(newRefreshToken);
        return new AuthResponse(newAccessToken, newRefreshToken.getToken());
    }

    @Transactional
    public boolean toggleFollow(Long targetUserId)
    {
        Long currentUserId = SecurityUtil.getCurrentUserId().orElseThrow(() ->
            new SecurityException("User not authenticated"));

        if(currentUserId.equals(targetUserId))
        {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        if(!repo.existsById(targetUserId))
        {
            throw new IllegalArgumentException(StringConstants.NOT_FOUND("Target user"));
        }

        if(repo.isFollowing(currentUserId, targetUserId))
        {
            repo.unfollowUser(currentUserId, targetUserId);
            return false;
        }
        else
        {
            repo.followUser(currentUserId, targetUserId);
            return true;
        }
    }

    @Transactional(readOnly = true)
    public UserStatsResponse getUserStats(Long userId)
    {
        User user = repo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(StringConstants.NOT_FOUND("User")));

        int totalSketches = sketchRepo.countByAuthorId(userId);
        double artistWinRate = repo.calculateArtistWinRate(userId);

        int totalAttempts = guessRepo.countByUserId(userId);
        int wordsGuessed = guessRepo.countByUserIdAndAccuracy(userId, GuessAccuracy.CORRECT);
        int wordsFailed = guessRepo.countFailedSketchesByUserId(userId);

        return new UserStatsResponse(
            user.getUsername(),
            totalSketches,
            Math.round(artistWinRate * 100.0) / 100.0,
            totalAttempts,
            wordsGuessed,
            wordsFailed
        );
    }

    @Transactional(readOnly = true)
    public LeaderboardResponse getLeaderboard(String sortBy, Pageable pageable)
    {
        Page<LeaderboardEntryProjection> leaderboardPage = repo.getLeaderboard(sortBy, pageable);

        Long userId = SecurityUtil.getCurrentUserId().orElse(null);
        LeaderboardEntryProjection userStats = null;

        if(userId != null)
        {
            userStats = repo.getLeaderboardEntryByUserId(userId)
            .orElse(null);
        }


        return new LeaderboardResponse(userStats, leaderboardPage);
    }
}
