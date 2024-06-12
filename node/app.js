// app.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Define a simple GET endpoint
app.get('/', (req, res) => {
  res.send('Hello from Express Server!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
