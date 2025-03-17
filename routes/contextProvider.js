const fs = require('fs-extra');
const path = require('path');

/**
 * Provides context about available profiles and components to the LLM
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getContext = async (req, res) => {
  try {
    const profilesDir = path.join(__dirname, '..', 'profiles');
    const profileFiles = await fs.readdir(profilesDir);
    
    const contexts = [];
    
    // Build context from all profiles
    for (const file of profileFiles) {
      if (file.endsWith('.json')) {
        const fileContent = await fs.readJson(path.join(profilesDir, file));
        
        // Extract components defined in this profile
        const components = Object.keys(fileContent.components || {});
        
        // Extract attribute categories
        const attributeCategories = Object.keys(fileContent.attributes || {});
        
        // Create a summary of color palette
        const colorPalette = fileContent.attributes.colors ? 
          Object.entries(fileContent.attributes.colors).map(([name, color]) => ({
            name,
            value: color.value,
            weight: color.weight
          })) : [];
        
        // Create structured context for this profile
        contexts.push({
          type: "design_profile",
          id: fileContent.slug,
          metadata: {
            name: fileContent.name,
            author: fileContent.author,
            description: fileContent.description,
            version: fileContent.version
          },
          components: components.map(comp => ({
            name: comp,
            properties: Object.keys(fileContent.components[comp])
          })),
          attributeCategories,
          colorPalette
        });
      }
    }
    
    res.json({ contexts });
  } catch (error) {
    console.error('Error getting context:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Provides detailed context about a specific profile to the LLM
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfileContext = async (req, res) => {
  try {
    const { profile: profileSlug } = req.params;
    
    if (!profileSlug) {
      return res.status(400).json({ error: 'Missing profile parameter' });
    }
    
    // Find the profile file
    const profilesDir = path.join(__dirname, '..', 'profiles');
    const profileFiles = await fs.readdir(profilesDir);
    
    let profileFile = null;
    for (const file of profileFiles) {
      if (file.endsWith('.json')) {
        const fileContent = await fs.readJson(path.join(profilesDir, file));
        if (fileContent.slug === profileSlug) {
          profileFile = fileContent;
          break;
        }
      }
    }
    
    if (!profileFile) {
      return res.status(404).json({ error: `Profile "${profileSlug}" not found` });
    }
    
    // Return structured context about this profile
    res.json({
      context: {
        type: "design_profile_detail",
        id: profileFile.slug,
        metadata: {
          name: profileFile.name,
          author: profileFile.author,
          description: profileFile.description,
          version: profileFile.version
        },
        attributes: profileFile.attributes,
        components: profileFile.components
      }
    });
  } catch (error) {
    console.error('Error getting profile context:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Gets a component preview with a specific profile
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getComponentPreview = async (req, res) => {
  try {
    const { profile: profileSlug, component } = req.params;
    
    if (!profileSlug || !component) {
      return res.status(400).json({ 
        error: 'Missing required parameters: profile and component are required' 
      });
    }
    
    // Find the profile file
    const profilesDir = path.join(__dirname, '..', 'profiles');
    const profileFiles = await fs.readdir(profilesDir);
    
    let profileFile = null;
    for (const file of profileFiles) {
      if (file.endsWith('.json')) {
        const fileContent = await fs.readJson(path.join(profilesDir, file));
        if (fileContent.slug === profileSlug) {
          profileFile = fileContent;
          break;
        }
      }
    }
    
    if (!profileFile) {
      return res.status(404).json({ error: `Profile "${profileSlug}" not found` });
    }
    
    // Generate appropriate HTML and CSS for the component
    const componentName = component.replace(/^[.#]/, '');
    if (!profileFile.components[componentName]) {
      return res.status(404).json({ error: `Component "${componentName}" not found in profile` });
    }
    
    // Import the CSS generation function from applyTalent
    const { generateComponentCSS } = require('./applyTalent');
    
    // Generate the CSS
    const css = generateComponentCSS(profileFile, component);
    
    // Generate appropriate HTML based on the component
    let html = '';
    
    if (componentName === 'card') {
      html = `
        <div class="card">
          <h2>Card Title</h2>
          <p>This is a sample card component styled with the "${profileFile.name}" profile.</p>
          <button class="button primary">Primary Action</button>
          <button class="button secondary">Secondary Action</button>
        </div>
      `;
    } else if (componentName === 'button') {
      html = `
        <button class="button primary">Primary Button</button>
        <button class="button secondary">Secondary Button</button>
      `;
    } else if (componentName.includes('heading')) {
      html = `
        <h1 class="${componentName}">Heading Level 1</h1>
        <h2 class="${componentName}">Heading Level 2</h2>
      `;
    } else if (componentName.includes('text')) {
      html = `
        <p class="${componentName}">This is a sample text styled with the "${profileFile.name}" profile.</p>
      `;
    } else if (componentName === 'input') {
      html = `
        <div class="input-wrapper">
          <label for="sampleInput">Sample Input</label>
          <input type="text" id="sampleInput" class="input" placeholder="Enter text here...">
        </div>
      `;
    } else if (componentName === 'nav') {
      html = `
        <nav class="nav">
          <div class="nav-brand">Brand Logo</div>
          <ul class="nav-menu">
            <li class="nav-item"><a href="#" class="nav-link">Home</a></li>
            <li class="nav-item"><a href="#" class="nav-link">Features</a></li>
            <li class="nav-item"><a href="#" class="nav-link">Pricing</a></li>
            <li class="nav-item"><a href="#" class="nav-link">About</a></li>
          </ul>
        </nav>
      `;
    } else if (componentName === 'badge') {
      html = `
        <div class="badge-container">
          <span class="badge">New</span>
          <span class="badge">Featured</span>
          <span class="badge">Sale</span>
        </div>
      `;
    } else if (componentName === 'modal') {
      html = `
        <div class="modal-demo">
          <div class="modal-overlay">
            <div class="modal">
              <button class="modal-close-button">×</button>
              <h2 class="modal-title">Modal Title</h2>
              <div class="modal-content">
                <p>This is a sample modal component styled with the "${profileFile.name}" profile.</p>
              </div>
              <div class="modal-footer">
                <button class="button primary">Accept</button>
                <button class="button secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (componentName === 'alert') {
      html = `
        <div class="alert-container">
          <div class="alert success">
            <strong>Success!</strong> Operation completed successfully.
          </div>
          <div class="alert error">
            <strong>Error!</strong> Something went wrong.
          </div>
          <div class="alert warning">
            <strong>Warning!</strong> Proceed with caution.
          </div>
          <div class="alert info">
            <strong>Info:</strong> This is an informational message.
          </div>
        </div>
      `;
    } else if (componentName === 'table') {
      html = `
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>john@example.com</td>
              <td>Developer</td>
              <td>Active</td>
            </tr>
            <tr>
              <td>Jane Smith</td>
              <td>jane@example.com</td>
              <td>Designer</td>
              <td>Active</td>
            </tr>
            <tr>
              <td>Mike Johnson</td>
              <td>mike@example.com</td>
              <td>Manager</td>
              <td>Inactive</td>
            </tr>
          </tbody>
        </table>
      `;
    } else {
      html = `<div class="${componentName}">Sample ${componentName} component</div>`;
    }
    
    // Return the preview information
    res.json({
      preview: {
        component: componentName,
        profile: profileFile.name,
        html,
        css
      }
    });
  } catch (error) {
    console.error('Error getting component preview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getContext,
  getProfileContext,
  getComponentPreview
}; 