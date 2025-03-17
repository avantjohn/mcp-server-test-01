const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

/**
 * Validates a profile object to ensure it has the required structure
 * 
 * @param {Object} profile - The profile to validate
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
const validateProfile = (profile) => {
  const errors = [];
  
  // Check required fields
  if (!profile.name) errors.push('Profile name is required');
  if (!profile.author) errors.push('Profile author is required');
  if (!profile.slug) errors.push('Profile slug is required');
  
  // Check slug format - alphanumeric with dashes only
  if (profile.slug && !/^[a-z0-9-]+$/.test(profile.slug)) {
    errors.push('Profile slug must contain only lowercase letters, numbers, and dashes');
  }
  
  // Check attributes structure
  if (!profile.attributes) {
    errors.push('Profile must have attributes object');
  } else {
    // Check for required attribute categories
    const requiredCategories = ['colors', 'typography', 'spacing'];
    requiredCategories.forEach(category => {
      if (!profile.attributes[category]) {
        errors.push(`Profile must have ${category} attributes`);
      }
    });
  }
  
  // Check components
  if (!profile.components || Object.keys(profile.components).length === 0) {
    errors.push('Profile must have at least one component');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Creates a new profile
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createProfile = async (req, res) => {
  try {
    const profile = req.body;
    
    // Validate the profile
    const validation = validateProfile(profile);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
    
    // Check if profile with the same slug already exists
    const profilesDir = path.join(__dirname, '..', 'profiles');
    const profileFiles = await fs.readdir(profilesDir);
    
    for (const file of profileFiles) {
      if (file.endsWith('.json')) {
        const fileContent = await fs.readJson(path.join(profilesDir, file));
        if (fileContent.slug === profile.slug) {
          return res.status(409).json({
            success: false,
            error: `Profile with slug "${profile.slug}" already exists`
          });
        }
      }
    }
    
    // Generate a filename based on the slug and a timestamp
    const timestamp = Date.now();
    const filename = `${profile.slug}-${timestamp}.json`;
    const filePath = path.join(profilesDir, filename);
    
    // Add metadata - created date and ID
    profile.created = new Date().toISOString();
    profile.id = crypto.randomUUID();
    profile.version = profile.version || '1.0.0';
    
    // Save the profile
    await fs.writeJson(filePath, profile, { spaces: 2 });
    
    res.status(201).json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        author: profile.author,
        slug: profile.slug,
        description: profile.description,
        version: profile.version,
        created: profile.created
      }
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Updates an existing profile
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const { slug } = req.params;
    const updatedProfile = req.body;
    
    // Ensure the slug in the URL matches the slug in the body
    if (updatedProfile.slug && updatedProfile.slug !== slug) {
      return res.status(400).json({
        success: false,
        error: 'The slug in the URL must match the slug in the profile'
      });
    }
    
    // Find the profile file
    const profilesDir = path.join(__dirname, '..', 'profiles');
    const profileFiles = await fs.readdir(profilesDir);
    
    let profileFile = null;
    let profileFilePath = null;
    
    for (const file of profileFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(profilesDir, file);
        const fileContent = await fs.readJson(filePath);
        if (fileContent.slug === slug) {
          profileFile = fileContent;
          profileFilePath = filePath;
          break;
        }
      }
    }
    
    if (!profileFile) {
      return res.status(404).json({
        success: false,
        error: `Profile with slug "${slug}" not found`
      });
    }
    
    // Merge the existing profile with the updates
    const mergedProfile = {
      ...profileFile,
      ...updatedProfile,
      updated: new Date().toISOString()
    };
    
    // Validate the merged profile
    const validation = validateProfile(mergedProfile);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
    
    // Save the updated profile
    await fs.writeJson(profileFilePath, mergedProfile, { spaces: 2 });
    
    res.json({
      success: true,
      profile: {
        id: mergedProfile.id,
        name: mergedProfile.name,
        author: mergedProfile.author,
        slug: mergedProfile.slug,
        description: mergedProfile.description,
        version: mergedProfile.version,
        created: mergedProfile.created,
        updated: mergedProfile.updated
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Deletes a profile
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteProfile = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find the profile file
    const profilesDir = path.join(__dirname, '..', 'profiles');
    const profileFiles = await fs.readdir(profilesDir);
    
    let profileFilePath = null;
    
    for (const file of profileFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(profilesDir, file);
        const fileContent = await fs.readJson(filePath);
        if (fileContent.slug === slug) {
          profileFilePath = filePath;
          break;
        }
      }
    }
    
    if (!profileFilePath) {
      return res.status(404).json({
        success: false,
        error: `Profile with slug "${slug}" not found`
      });
    }
    
    // Delete the profile file
    await fs.remove(profileFilePath);
    
    // Delete any associated generated CSS files
    const generatedStylesDir = path.join(__dirname, '..', 'generated-styles');
    const cssFiles = await fs.readdir(generatedStylesDir);
    
    for (const file of cssFiles) {
      if (file.startsWith(`${slug}-`)) {
        await fs.remove(path.join(generatedStylesDir, file));
      }
    }
    
    res.json({
      success: true,
      message: `Profile "${slug}" successfully deleted`
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Gets a single profile by slug
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find the profile file
    const profilesDir = path.join(__dirname, '..', 'profiles');
    const profileFiles = await fs.readdir(profilesDir);
    
    let profile = null;
    
    for (const file of profileFiles) {
      if (file.endsWith('.json')) {
        const fileContent = await fs.readJson(path.join(profilesDir, file));
        if (fileContent.slug === slug) {
          profile = fileContent;
          break;
        }
      }
    }
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Profile with slug "${slug}" not found`
      });
    }
    
    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = {
  createProfile,
  updateProfile,
  deleteProfile,
  getProfile,
  validateProfile
}; 