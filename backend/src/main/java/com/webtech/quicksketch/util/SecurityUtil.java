package com.webtech.quicksketch.util;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil
{
    public Long getCurrentUserId()
    {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public Boolean isAuthenticated()
    {
        return SecurityContextHolder.getContext().getAuthentication().isAuthenticated();
    }
}
