CREATE TABLE post(
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    title UNIQUE NOT NULL,

CREATE TABLE user(
        id SERIAL PRIMARY KEY NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        email UNIQUE NOT NULL,
        username UNIQUE NOT NULL,
        password NOT NULL,
    );