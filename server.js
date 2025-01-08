const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle JSON payloads
app.use(express.json());

// API routes can be added here

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
