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

    @Query(value = """
        SELECT COALESCE(
            (SUM(CASE WHEN us.guessed = TRUE THEN 1 ELSE 0 END) * 100.0) / 
            NULLIF(COUNT(us.sketch_id), 0), 
            0.0
        )
        FROM user_sketches us
        JOIN sketches s ON us.sketch_id = s.id
        WHERE s.author_id = :authorId
    """, nativeQuery = true)
    Double calculateArtistWinRate(@Param("authorId") Long authorId);

    @Query
    (value = """
        WITH leaderboard AS
        (
            SELECT 
                u.id AS userId,
                u.username AS username,
                (SELECT COUNT(DISTINCT us.sketch_id) FROM user_sketches us WHERE us.user_id = u.id AND us.guessed = TRUE) AS wordsGuessed,
                COALESCE(
                    (
                        SELECT (SUM(CASE WHEN us_art.guessed = TRUE THEN 1 ELSE 0 END) * 100.0) / COUNT(us_art.sketch_id)
                        FROM sketches s_art 
                        JOIN user_sketches us_art ON us_art.sketch_id = s_art.id 
                        WHERE s_art.author_id = u.id
                    ), 0.0
                ) AS artistWinRate,
                RANK() OVER (ORDER BY (SELECT COUNT(DISTINCT us.sketch_id) FROM user_sketches us WHERE us.user_id = u.id AND us.guessed = TRUE) DESC) AS guesserRank,
                RANK() OVER (ORDER BY COALESCE((SELECT (SUM(CASE WHEN us_art.guessed = TRUE THEN 1 ELSE 0 END) * 100.0) / COUNT(us_art.sketch_id) FROM sketches s_art JOIN user_sketches us_art ON us_art.sketch_id = s_art.id WHERE s_art.author_id = u.id), 0.0) DESC) AS artistRank
            FROM users u
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
                (SELECT COUNT(DISTINCT us.sketch_id) FROM user_sketches us WHERE us.user_id = u.id AND us.guessed = TRUE) AS "wordsGuessed",
                COALESCE(
                    (
                        SELECT (SUM(CASE WHEN us_art.guessed = TRUE THEN 1 ELSE 0 END) * 100.0) / COUNT(us_art.sketch_id)
                        FROM sketches s_art 
                        JOIN user_sketches us_art ON us_art.sketch_id = s_art.id 
                        WHERE s_art.author_id = u.id
                    ), 0.0
                ) AS artistWinRate,
                RANK() OVER (ORDER BY (SELECT COUNT(DISTINCT us.sketch_id) FROM user_sketches us WHERE us.user_id = u.id AND us.guessed = TRUE) DESC) AS guesserRank,
                RANK() OVER (ORDER BY COALESCE((SELECT (SUM(CASE WHEN us_art.guessed = TRUE THEN 1 ELSE 0 END) * 100.0) / COUNT(us_art.sketch_id) FROM sketches s_art JOIN user_sketches us_art ON us_art.sketch_id = s_art.id WHERE s_art.author_id = u.id), 0.0) DESC) AS artistRank
            FROM users u
        )
        SELECT * FROM leaderboard WHERE userId = :userId
    """, nativeQuery = true)
    Optional<LeaderboardEntryProjection> getLeaderboardEntryByUserId(@Param("userId") Long userId);

    @Query
    (value = """
        SELECT u.* FROM users u
        JOIN follows f ON u.id = f.followed_id
        WHERE f.follower_id = :userId
    """, nativeQuery = true)
    Page<User> getFollowed(@Param("userId") Long userId, Pageable pageable);

    @Query
    (value = """
        SELECT u.* FROM users u
        JOIN follows f ON u.id = f.follower_id
        WHERE f.followed_id = :userId
    """, nativeQuery = true)
    Page<User> getFollowers(@Param("userId") Long userId, Pageable pageable);
}