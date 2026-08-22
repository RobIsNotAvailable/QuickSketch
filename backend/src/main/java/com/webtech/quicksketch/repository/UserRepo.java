package com.webtech.quicksketch.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.webtech.quicksketch.dto.LeaderboardEntryProjection;
import com.webtech.quicksketch.model.User;

public interface UserRepo extends JpaRepository<User, Long>
{
    Optional<User> findByEmailOrUsername(String email, String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query(value = "SELECT COUNT(*) > 0 FROM follows WHERE follower_id = :followerId AND followed_id = :followedId", nativeQuery = true)
    boolean isFollowing(@Param("followerId") Long followerId, @Param("followedId") Long followedId);

    @Modifying
    @Query(value = "INSERT INTO follows (follower_id, followed_id) VALUES (:followerId, :followedId)", nativeQuery = true)
    void followUser(@Param("followerId") Long followerId, @Param("followedId") Long followedId);

    @Modifying
    @Query(value = "DELETE FROM follows WHERE follower_id = :followerId AND followed_id = :followedId", nativeQuery = true)
    void unfollowUser(@Param("followerId") Long followerId, @Param("followedId") Long followedId);

    @Query
    ("""
        SELECT COALESCE
        (
            (COUNT(DISTINCT CASE WHEN g.accuracy = com.webtech.quicksketch.model.enums.GuessAccuracy.CORRECT THEN 1 END) * 100.0) / 
            NULLIF(COUNT(DISTINCT (g.user.id, g.sketch.id)), 0), 
            0.0
        )
        FROM Guess g
        WHERE g.sketch.author.id = :authorId
    """)
    Double calculateArtistWinRate(@Param("authorId") Long authorId);

    @Query
    (value = """
        WITH leaderboard AS
        (
            SELECT 
                u.id AS userId,
                u.username AS username,
                COUNT(DISTINCT CASE WHEN g.accuracy = 'CORRECT' THEN 1 END) AS wordsGuessed,
                COALESCE
                (
                    (COUNT(DISTINCT CASE WHEN g_art.accuracy = 'CORRECT' THEN 1 END) * 100.0) / 
                    NULLIF(COUNT(DISTINCT CASE WHEN g_art.user_id IS NOT NULL AND g_art.sketch_id IS NOT NULL THEN ROW(g_art.user_id, g_art.sketch_id) END), 0),
                    0.0
                ) AS artistWinRate,
                RANK() OVER
                (
                    ORDER BY COUNT(DISTINCT CASE WHEN g.accuracy = 'CORRECT' THEN 1 END) DESC
                ) AS guesserRank,
                RANK() OVER
                (
                    ORDER BY COALESCE
                    (
                        (COUNT(DISTINCT CASE WHEN g_art.accuracy = 'CORRECT' THEN 1 END) * 100.0) / 
                        NULLIF(COUNT(DISTINCT CASE WHEN g_art.user_id IS NOT NULL AND g_art.sketch_id IS NOT NULL THEN ROW(g_art.user_id, g_art.sketch_id) END), 0),
                        0.0
                    ) DESC
                ) AS artistRank
            FROM users u
            LEFT JOIN guesses g ON g.user_id = u.id
            LEFT JOIN sketches s ON s.author_id = u.id
            LEFT JOIN guesses g_art ON g_art.sketch_id = s.id
            GROUP BY u.id, u.username
        )
        SELECT * FROM leaderboard
        ORDER BY 
            CASE WHEN :sortBy = 'guesserRank' THEN guesserRank END ASC,
            CASE WHEN :sortBy = 'artistRank' THEN artistRank END ASC
        """, 
        countQuery = "SELECT COUNT(*) FROM users",
        nativeQuery = true
    )
    Page<LeaderboardEntryProjection> getLeaderboard(@Param("sortBy") String sortBy, Pageable pageable);

    @Query
    (value = """
        WITH leaderboard AS
        (
            SELECT 
                u.id AS userId,
                u.username AS username,
                COUNT(DISTINCT CASE WHEN g.accuracy = 'CORRECT' THEN 1 END) AS "wordsGuessed",
                COALESCE
                (
                    (COUNT(DISTINCT CASE WHEN g_art.accuracy = 'CORRECT' THEN 1 END) * 100.0) / 
                    NULLIF(COUNT(DISTINCT CASE WHEN g_art.user_id IS NOT NULL AND g_art.sketch_id IS NOT NULL THEN ROW(g_art.user_id, g_art.sketch_id) END), 0),
                    0.0
                ) AS artistWinRate,
                RANK() OVER
                (
                    ORDER BY COUNT(DISTINCT CASE WHEN g.accuracy = 'CORRECT' THEN 1 END) DESC
                ) AS guesserRank,
                RANK() OVER
                (
                    ORDER BY COALESCE
                    (
                        (COUNT(DISTINCT CASE WHEN g_art.accuracy = 'CORRECT' THEN 1 END) * 100.0) / 
                        NULLIF(COUNT(DISTINCT CASE WHEN g_art.user_id IS NOT NULL AND g_art.sketch_id IS NOT NULL THEN ROW(g_art.user_id, g_art.sketch_id) END), 0),
                        0.0
                    ) DESC
                ) AS artistRank
            FROM users u
            LEFT JOIN guesses g ON g.user_id = u.id
            LEFT JOIN sketches s ON s.author_id = u.id
            LEFT JOIN guesses g_art ON g_art.sketch_id = s.id
            GROUP BY u.id, u.username
        )
        SELECT * FROM leaderboard WHERE userId = :userId
    """, nativeQuery = true)
    Optional<LeaderboardEntryProjection> getLeaderboardEntryByUserId(@Param("userId") Long userId);
}

