package com.webtech.quicksketch.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webtech.quicksketch.dto.LeaderboardEntryProjection;
import com.webtech.quicksketch.dto.request.LoginRequest;
import com.webtech.quicksketch.dto.request.RegisterRequest;
import com.webtech.quicksketch.dto.response.AuthResponse;
import com.webtech.quicksketch.dto.response.LeaderboardResponse;
import com.webtech.quicksketch.dto.response.UserStatsResponse;
import com.webtech.quicksketch.model.RefreshToken;
import com.webtech.quicksketch.model.User;
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
    private final SecurityUtil securityUtil;

    @Transactional
    public AuthResponse login(LoginRequest request)
    {
        User user = repo.findByEmail(request.email()).orElseThrow(() -> 
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
    public void logout(String refreshTokenValue)
    {
        tokenRepo.findByToken(refreshTokenValue).ifPresent(tokenRepo::delete);
    }

    @Transactional
    public boolean toggleFollow(Long targetUserId)
    {
        Long currentUserId = securityUtil.getCurrentUserId();

        if(currentUserId.equals(targetUserId))
        {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        if(!repo.existsById(targetUserId))
        {
            throw new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("Target user"));
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
    public UserStatsResponse getUserStats(Long targetUserId)
    {
        User user = repo.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException(StringConstants.NOT_FOUND_MESSAGE("User")));

        int totalSketches = sketchRepo.countByAuthorId(targetUserId);
        double artistWinRate = repo.calculateArtistWinRate(targetUserId);

        int totalAttempts = guessRepo.countByUserId(targetUserId);
        int wordsGuessed = guessRepo.countByUserIdAndIsCorrectTrue(targetUserId);
        int wordsFailed = guessRepo.countFailedSketchesByUserId(targetUserId);

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
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by(Sort.Direction.DESC, sortBy)
        );

        Page<LeaderboardEntryProjection> leaderboardPage = repo.getLeaderboard(sortedPageable);

        Long userId;
        LeaderboardEntryProjection userStats = null;
        if(securityUtil.isAuthenticated())
        {
            userId = securityUtil.getCurrentUserId();
            userStats = repo.getLeaderboardEntryByUserId(userId)
            .orElse(null);
        }


        return new LeaderboardResponse(userStats, leaderboardPage);
    }
}
