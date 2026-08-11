CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_email CHECK
    (
        email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

CREATE TABLE words
(
    id SERIAL PRIMARY KEY,
    text VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE sketches
(
    id SERIAL PRIMARY KEY,
    image_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id INT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
);

CREATE TABLE guesses
(
    id SERIAL PRIMARY KEY,
    guess VARCHAR(100) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sketch_id INT NOT NULL REFERENCES sketches(id) ON DELETE CASCADE
);

CREATE TABLE reactions
(
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('LIKE', 'DISLIKE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sketch_id INT NOT NULL REFERENCES sketches(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_sketch_reaction UNIQUE (user_id, sketch_id)
);

CREATE TABLE comments
(
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sketch_id INT NOT NULL REFERENCES sketches(id) ON DELETE CASCADE
);