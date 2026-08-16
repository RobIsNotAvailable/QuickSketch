package com.webtech.quicksketch.dto;

public interface LeaderboardEntryProjection
{
    Long getUserId();
    String getUsername();
    long getWordsGuessed();
    double getArtistSuccessRate();
    long getGuesserRank();
    long getArtistRank();
}