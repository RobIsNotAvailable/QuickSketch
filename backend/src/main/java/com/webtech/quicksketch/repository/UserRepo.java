package com.webtech.quicksketch.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.webtech.quicksketch.model.User;

public interface UserRepo extends JpaRepository<User, Long> {}
