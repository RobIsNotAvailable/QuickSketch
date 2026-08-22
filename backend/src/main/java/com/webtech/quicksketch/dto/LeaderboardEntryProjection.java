package com.webtech.quicksketch.dto;

public interface LeaderboardEntryProjection
{
    Long getUserId();
    String getUsername();
    long getWordsGuessed();
    double getArtistWinRate();
    long getGuesserRank();
    long getArtistRank();
}