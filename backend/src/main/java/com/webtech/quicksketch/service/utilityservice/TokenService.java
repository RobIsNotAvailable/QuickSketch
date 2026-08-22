package com.webtech.quicksketch.service.utilityservice;

import java.time.Instant;
import static java.time.temporal.ChronoUnit.MILLIS;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webtech.quicksketch.model.RefreshToken;
import com.webtech.quicksketch.model.User;
import com.webtech.quicksketch.repository.RefreshTokenRepo;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenService
{
    @Value("${JWT_KEY}")
    private String key;

    private final RefreshTokenRepo refreshTokenRepo;

    private static final int JWT_EXPIRATION_TIME = 1000 * 60 * 15; // 15 minuti
    private static final int REFRESH_EXPIRATION_TIME = 60 * 60 * 24 * 30; // 30 giorni

    public String generateAccessToken(User user)
    {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());

        return Jwts.builder()
                .claims(claims)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_TIME))
                .signWith(getSignInKey())
                .compact();
    }

    public Long extractUserId(String token)
    {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver)
    {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails userDetails)
    {
        final Long userId = extractUserId(token);
        return (userId.equals(((User) userDetails).getId())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token)
    {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token)
    {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token)
    {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey()
    {
        byte[] keyBytes = Decoders.BASE64.decode(key);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Transactional
    public RefreshToken generateRefreshToken(User user)
    {
        refreshTokenRepo.deleteByUserId(user.getId());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiration(Instant.now().plus(REFRESH_EXPIRATION_TIME, MILLIS));

        return refreshTokenRepo.save(refreshToken);
    }
}