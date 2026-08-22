package com.webtech.quicksketch.util;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.webtech.quicksketch.model.User;

@Component
public class SecurityUtil
{
    public static Optional<Long> getCurrentUserId()
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authentication != null && authentication.getPrincipal() instanceof User user)
        {
            return Optional.of(user.getId());
        }

        return Optional.empty();
    }
}
