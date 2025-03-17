const app = require('./app');
const path = require('path');
const fs = require('fs-extra');

// Define port
const PORT = process.env.PORT || 3000;

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

// Start the server
app.listen(PORT, async () => {
  await ensureDirectories();
  console.log(`Popmelt MCP Server running on port ${PORT}`);
}); 