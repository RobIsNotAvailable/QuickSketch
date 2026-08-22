package com.webtech.quicksketch.model;

import java.time.Instant;

import com.webtech.quicksketch.model.enums.GuessAccuracy;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "guesses")
@Data
@NoArgsConstructor
public class Guess
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guess", nullable = false)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(name = "accuracy", nullable = false)
    private GuessAccuracy accuracy = GuessAccuracy.WRONG;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sketch_id", nullable = false)
    private Sketch sketch;

    public Guess(String text, User user, Sketch sketch)
    {
        this.text = text;
        this.user = user;
        this.sketch = sketch;
    }
}
