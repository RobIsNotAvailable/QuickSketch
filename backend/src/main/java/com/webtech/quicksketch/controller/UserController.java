package com.webtech.quicksketch.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webtech.quicksketch.dto.response.LeaderboardResponse;
import com.webtech.quicksketch.dto.response.UserProfileResponse;
import com.webtech.quicksketch.dto.response.UserResponse;
import com.webtech.quicksketch.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController
{
    private final UserService userService;

    @PostMapping("/{targetUserId}/follow")
    public ResponseEntity<Boolean> toggleFollow(@PathVariable Long targetUserId)
    {
        boolean isFollowing = userService.toggleFollow(targetUserId);
        return ResponseEntity.ok(isFollowing);
    }

    @GetMapping("{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId)
    {
        UserProfileResponse stats = userService.getUserProfile(userId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<LeaderboardResponse> getLeaderboard
    (
        @RequestParam(defaultValue = "guesserRank") String sortBy,
        Pageable pageable
    )
    {
        LeaderboardResponse leaderboard = userService.getLeaderboard(sortBy, pageable);
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<Page<UserResponse>> getFollowers(@PathVariable Long userId, Pageable pageable)
    {
        Page<UserResponse> followers = userService.getFollowers(userId, pageable);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{userId}/followed")
    public ResponseEntity<Page<UserResponse>> getFollowed(@PathVariable Long userId, Pageable pageable)
    {
        Page<UserResponse> followed = userService.getFollowed(userId, pageable);
        return ResponseEntity.ok(followed);
    }
}