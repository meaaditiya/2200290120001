// File: proxy-server/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 3001;

// Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());

// Handle all API requests
app.all('/api/*', async (req, res) => {
  try {
    // Construct the target URL
    const targetPath = req.url.replace('/api', '');
    const targetUrl = `http://20.244.56.144${targetPath}`;
    
    // Forward the request with the same method, headers and body
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if present
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
      },
    });
    
    // Send the response back to the client
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});