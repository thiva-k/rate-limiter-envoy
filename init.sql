CREATE DATABASE IF NOT EXISTS rate_limiter;

USE rate_limiter;

CREATE TABLE IF NOT EXISTS rate_limits (
  ip VARCHAR(45) PRIMARY KEY,
  count INT NOT NULL,
  expire_at TIMESTAMP NOT NULL
);
