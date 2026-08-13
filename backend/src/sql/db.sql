/**********  nuke  ************/
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO public;

/**********  db  ************/

CREATE TABLE users
(
    id BIGSERIAL PRIMARY KEY,
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
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE sketches
(
    id BIGSERIAL PRIMARY KEY,
    image_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE
);

CREATE TABLE guesses
(
    id BIGSERIAL PRIMARY KEY,
    guess VARCHAR(100) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sketch_id BIGINT NOT NULL REFERENCES sketches(id) ON DELETE CASCADE
);

CREATE TABLE reactions
(
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('LIKE', 'DISLIKE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sketch_id BIGINT NOT NULL REFERENCES sketches(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_sketch_reaction UNIQUE (user_id, sketch_id)
);

CREATE TABLE comments
(
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sketch_id BIGINT NOT NULL REFERENCES sketches(id) ON DELETE CASCADE,
    reply_to_id BIGINT REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE refresh_tokens
(
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expiration TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_sketches
(
    guessed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sketch_id BIGINT NOT NULL REFERENCES sketches(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, sketch_id)
);

CREATE TABLE user_follows
(
    follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (follower_id, followed_id)
);


CREATE OR REPLACE FUNCTION check_reply_integrity()
RETURNS TRIGGER AS $$
DECLARE
    parent_sketch_id BIGINT;
    parent_reply_to_id BIGINT;
BEGIN
    IF NEW.reply_to_id IS NOT NULL THEN
        SELECT sketch_id, reply_to_id 
        INTO parent_sketch_id, parent_reply_to_id
        FROM comments 
        WHERE id = NEW.reply_to_id;

        IF parent_sketch_id <> NEW.sketch_id THEN
            RAISE EXCEPTION 'New comment and parent comment must belong to the same sketch.';
        END IF;

        IF parent_reply_to_id IS NOT NULL THEN
            RAISE EXCEPTION 'Nested replies are not allowed. You can only reply to a top-level comment.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_reply_integrity
BEFORE INSERT OR UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION check_reply_integrity();