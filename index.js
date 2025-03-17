const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const { applyTalent, getProfiles } = require('./routes/applyTalent');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'generated-styles')));

// Ensure directories exist
const ensureDirectories = async () => {
  try {
    await fs.ensureDir(path.join(__dirname, 'profiles'));
    await fs.ensureDir(path.join(__dirname, 'generated-styles'));
    console.log('Directories created successfully');
  } catch (error) {
    console.error('Error creating directories:', error);
  }
};

// Routes
app.post('/api/apply-talent', applyTalent);
app.get('/api/profiles', getProfiles);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Popmelt MCP Server is running' });
});

// Serve a simple HTML page for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Popmelt MCP Server</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          line-height: 1.6;
          color: #333;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #3d7aff;
        }
        h2 {
          font-size: 1.8rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        pre {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
        }
        code {
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        }
        .card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .button {
          display: inline-block;
          background-color: #3d7aff;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .button.secondary {
          background-color: #e8f0ff;
          color: #3d7aff;
        }
      </style>
    </head>
    <body>
      <h1>Popmelt MCP Server</h1>
      <p>Welcome to the Popmelt Model-Controlled Programming (MCP) server. This server generates dynamic design systems and UI components based on structured Taste Profiles.</p>
      
      <div class="card">
        <h2>API Endpoints</h2>
        <ul>
          <li><code>POST /api/apply-talent</code> - Apply a talent profile to a component</li>
          <li><code>GET /api/profiles</code> - Get all available talent profiles</li>
          <li><code>GET /health</code> - Health check endpoint</li>
        </ul>
      </div>
      
      <div class="card">
        <h2>Example Usage</h2>
        <p>To apply a talent profile to a component, send a POST request to <code>/api/apply-talent</code> with the following JSON body:</p>
        <pre><code>{
  "profile": "olivia-gray",
  "component": ".card"
}</code></pre>
        <p>The server will generate CSS for the component based on the talent profile and return it in the response.</p>
      </div>
      
      <div>
        <a href="/api/profiles" class="button">View Available Profiles</a>
        <a href="https://github.com/your-repo/popmelt-mcp-server" class="button secondary">GitHub Repository</a>
      </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, async () => {
  await ensureDirectories();
  console.log(`Popmelt MCP Server running on port ${PORT}`);
}); 