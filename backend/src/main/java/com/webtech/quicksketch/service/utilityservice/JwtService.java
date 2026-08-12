package com.webtech.quicksketch.service.utilityservice;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.webtech.quicksketch.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService 
{

    @Value("${JWT_KEY}")
    private String key;

    private static final long EXPIRATION_TIME = 1000L * 60 * 15; // 15 minuti

    public String generateToken(User user) 
    {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());

        return Jwts.builder()
                .claims(claims)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
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
        return (userId.equals(((User) userDetails).getId())) && !isTokenExpired(token);}

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
}