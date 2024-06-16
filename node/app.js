const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: 'mysql',
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD || 'password',
  database: 'rate_limiter',
  waitForConnections: true,
  connectionLimit: 10,  // Adjust this based on your needs
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Endpoint to fetch rate limit count
app.get('/rate-limit', (req, res) => {
  const token = req.get('token');

  // Delete expired rate limits before fetching the count
  pool.query('DELETE FROM rate_limits WHERE expire_at < NOW()', (err) => {
    if (err) {
      console.error('MySQL delete error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    pool.query('SELECT count FROM rate_limits WHERE token = ?', [token], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      const count = results.length ? results[0].count : 0;
      console.log(`GET request: Rate limit count for token ${token} is ${count}`);
      res.send(count.toString());
    });
  });
});

// Endpoint to update rate limit count
app.post('/rate-limit', (req, res) => {
  const token = req.get('token');
  const newCount = parseInt(req.get('x-rate-limit-count'), 10);
  const expireTime = 60; // Expiry time in seconds

  // Delete expired rate limits before updating the count
  pool.query('DELETE FROM rate_limits WHERE expire_at < NOW()', (err) => {
    if (err) {
      console.error('MySQL delete error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    pool.query('SELECT count FROM rate_limits WHERE token = ?', [token], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      if (results.length) {
        pool.query('UPDATE rate_limits SET count = ?, expire_at = NOW() + INTERVAL ? SECOND WHERE token = ?', [newCount, expireTime, token], (err) => {
          if (err) {
            console.error('MySQL update error:', err);
            res.status(500).send('Internal Server Error');
            return;
          }
          console.log(`POST request: Rate limit incremented for token ${token}`);
          res.send('OK');
        });
      } else {
        pool.query('INSERT INTO rate_limits (token, count, expire_at) VALUES (?, ?, NOW() + INTERVAL ? SECOND)', [token, newCount, expireTime], (err) => {
          if (err) {
            console.error('MySQL insert error:', err);
            res.status(500).send('Internal Server Error');
            return;
          }
          console.log(`POST request: New rate limit record inserted for token ${token}`);
          res.send('OK');
        });
      }
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
