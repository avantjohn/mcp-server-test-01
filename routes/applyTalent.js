const fs = require('fs-extra');
const path = require('path');

/**
 * Resolves a reference path in the format "category.subcategory.property"
 * to its actual value in the profile
 * 
 * @param {string} reference - The reference path (e.g., "colors.background")
 * @param {Object} profile - The profile object containing attributes
 * @returns {string|null} The resolved value or null if not found
 */
const resolveReference = (reference, profile) => {
  // If the reference is a direct value (not a reference path), return it
  if (!reference.includes('.') || reference.startsWith('#')) {
    return reference;
  }

  // Split the reference path and navigate through the profile
  const parts = reference.split('.');
  let current = profile.attributes;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (!current[part]) {
      return null;
    }
    
    current = current[part];
  }

  // Return the value property if it exists
  return current.value || null;
};

/**
 * Generates CSS for a component based on the profile
 * 
 * @param {Object} profile - The profile object
 * @param {string} componentSelector - The CSS selector for the component
 * @returns {string} The generated CSS
 */
const generateComponentCSS = (profile, componentSelector) => {
  // Extract the component name from the selector (e.g., ".card" -> "card")
  const componentName = componentSelector.replace(/^[.#]/, '');
  
  // Check if the component exists in the profile
  if (!profile.components || !profile.components[componentName]) {
    return `/* Component "${componentName}" not found in the profile */`;
  }

  const component = profile.components[componentName];
  let css = `${componentSelector} {\n`;

  // Process each property in the component
  for (const [property, value] of Object.entries(component)) {
    // Convert camelCase to kebab-case for CSS properties
    const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    // Resolve the reference to get the actual value
    const resolvedValue = resolveReference(value, profile);
    
    if (resolvedValue) {
      css += `  ${cssProperty}: ${resolvedValue};\n`;
    }
  }

  css += '}\n';
  return css;
};

/**
 * Handles the apply-talent request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const applyTalent = async (req, res) => {
  try {
    const { profile: profileSlug, component } = req.body;

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

    // Generate CSS for the component
    const css = generateComponentCSS(profileFile, component);
    
    // Save the generated CSS to a file
    const outputDir = path.join(__dirname, '..', 'generated-styles');
    await fs.ensureDir(outputDir);
    
    const outputFileName = `${profileSlug}-${component.replace(/[.#]/g, '')}.css`;
    const outputPath = path.join(outputDir, outputFileName);
    
    await fs.writeFile(outputPath, css);

    // Return the CSS and file path
    res.json({
      success: true,
      css,
      filePath: `/generated-styles/${outputFileName}`
    });
  } catch (error) {
    console.error('Error applying talent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Gets all available talent profiles
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfiles = async (req, res) => {
  try {
    const profilesDir = path.join(__dirname, '..', 'profiles');
    const profileFiles = await fs.readdir(profilesDir);
    
    const profiles = [];
    
    for (const file of profileFiles) {
      if (file.endsWith('.json')) {
        const fileContent = await fs.readJson(path.join(profilesDir, file));
        profiles.push({
          name: fileContent.name,
          author: fileContent.author,
          slug: fileContent.slug,
          description: fileContent.description
        });
      }
    }
    
    res.json({ profiles });
  } catch (error) {
    console.error('Error getting profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  applyTalent,
  getProfiles
}; 