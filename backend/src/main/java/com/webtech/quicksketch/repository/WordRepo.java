package com.webtech.quicksketch.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.webtech.quicksketch.model.Word;

public interface WordRepo extends JpaRepository<Word, Long>
{
    @Query(value = "SELECT * FROM words ORDER BY RANDOM() LIMIT :count", nativeQuery = true)
    List<Word> findRandomWords(@Param("count") int count);
}
