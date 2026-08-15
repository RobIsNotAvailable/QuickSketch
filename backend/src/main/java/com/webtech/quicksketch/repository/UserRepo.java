package com.webtech.quicksketch.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.webtech.quicksketch.model.User;

public interface UserRepo extends JpaRepository<User, Long>
{
    Optional<User> findByEmail(String email);

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
}
