CREATE DATABASE IF NOT EXISTS rate_limiter;

USE rate_limiter;

CREATE TABLE IF NOT EXISTS rate_limits (
  token VARCHAR(100) PRIMARY KEY,
  count INT NOT NULL,
  expire_at TIMESTAMP NOT NULL
);
