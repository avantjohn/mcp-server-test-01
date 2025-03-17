const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const { 
  applyTalent, 
  getProfiles, 
  generateFullDesignSystem 
} = require('./routes/applyTalent');
const {
  createProfile,
  updateProfile,
  deleteProfile,
  getProfile
} = require('./routes/profileManagement');
const {
  createTemplateProfile,
  getComponentTemplates
} = require('./routes/componentTemplates');
const {
  getContext,
  getProfileContext,
  getComponentPreview
} = require('./routes/contextProvider');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/generated-styles', express.static(path.join(__dirname, 'generated-styles')));

// Routes
app.post('/api/apply-talent', applyTalent);
app.get('/api/profiles', getProfiles);
app.post('/api/generate-design-system', generateFullDesignSystem);

// Add component generation specific endpoint
app.post('/api/generate-component', async (req, res) => {
  try {
    const { profile, component } = req.body;
    
    console.log('API Request:', { profile, component });
    
    if (!profile || !component) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile and component parameters are required' 
      });
    }
    
    // Let's use full design system generation as a simpler approach
    return generateFullDesignSystem(req, res);
    
  } catch (error) {
    console.error('Error generating component:', error.message);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error generating component CSS'
    });
  }
});

// Profile Management Routes
app.post('/api/profiles', createProfile);
app.get('/api/profiles/:slug', getProfile);
app.put('/api/profiles/:slug', updateProfile);
app.delete('/api/profiles/:slug', deleteProfile);

// Component Template Routes
app.get('/api/templates', getComponentTemplates);
app.post('/api/templates/create-profile', createTemplateProfile);

// Context Provider Routes
app.get('/api/context', getContext);
app.get('/api/context/profile/:profile', getProfileContext);
app.get('/api/context/preview/:profile/:component', getComponentPreview);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Popmelt MCP Server is running' });
});

// Serve frontend for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ensure directories exist during startup
const ensureDirectories = async () => {
  try {
    await fs.ensureDir(path.join(__dirname, 'profiles'));
    await fs.ensureDir(path.join(__dirname, 'generated-styles'));
    await fs.ensureDir(path.join(__dirname, 'public'));
  } catch (error) {
    console.error('Error creating directories:', error);
  }
};

// Call ensure directories on module load for tests
ensureDirectories();

module.exports = app; 