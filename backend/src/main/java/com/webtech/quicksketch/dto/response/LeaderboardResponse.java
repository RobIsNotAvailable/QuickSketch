package com.webtech.quicksketch.dto.response;

import org.springframework.data.domain.Page;

import com.webtech.quicksketch.dto.LeaderboardEntryProjection;

public record LeaderboardResponse
(
    LeaderboardEntryProjection currentUserStats,
    Page<LeaderboardEntryProjection> leaderboard
) {}
