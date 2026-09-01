package com.webtech.quicksketch.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig
{
    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception
    {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests
            (
                auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/logout").authenticated()
                .requestMatchers("/api/auth/**").permitAll()

                .requestMatchers("/api/users/follow").authenticated()
                .requestMatchers("/api/users/**").permitAll()

                .requestMatchers("/api/sketches/init").authenticated()
                .requestMatchers("/api/sketches/create").authenticated()
                .requestMatchers("/api/sketches/feed/followed").authenticated()
                .requestMatchers("/api/sketches/**").permitAll()

                .requestMatchers("/api/comments/create").authenticated()
                .requestMatchers("/api/comments/**").permitAll()

                .anyRequest().authenticated()
            )
            .sessionManagement
            (
                session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling
            (
                exception -> exception
                .authenticationEntryPoint
                (
                    (request, response, authException) ->
                    {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("Unauthorized: token expired, unrecognized or missing");
                    }
                )
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}