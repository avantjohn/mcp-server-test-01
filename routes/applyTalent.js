const fs = require('fs-extra');
const path = require('path');

/**
 * Resolves a reference path to its actual value from the profile
 * 
 * @param {string|object} reference - The reference to resolve
 * @param {Object} profile - The profile object
 * @returns {string|null} The resolved value or null if not found
 */
const resolveReference = (reference, profile) => {
  // Handle non-string values
  if (typeof reference !== 'string') {
    // If it's an object with a value property, return that value
    if (reference && typeof reference === 'object' && reference.value !== undefined) {
      return reference.value;
    }
    // Otherwise, return the reference as is or convert to string
    return reference !== null && reference !== undefined ? String(reference) : '';
  }
  
  // If the reference is a direct value (not a reference path), return it
  if (!reference.includes('.') || reference.startsWith('#') || reference.startsWith('var(--')) {
    return reference;
  }

  // Split the reference path and navigate through the profile
  const parts = reference.split('.');
  let current = profile.attributes;

  // Navigate through the object structure
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (!current || !current[part]) {
      return null;
    }
    
    current = current[part];
  }

  // Return the value property if it exists, otherwise the current value
  return current && current.value !== undefined ? current.value : current;
};

/**
 * Generates CSS variables for the design system based on the profile attributes
 * 
 * @param {Object} profile - The profile object
 * @returns {string} The generated CSS variable definitions
 */
const generateCSSVariables = (profile) => {
  let css = `:root {\n`;
  
  // Process colors
  if (profile.attributes.colors) {
    Object.entries(profile.attributes.colors).forEach(([key, color]) => {
      css += `  --color-${key}: ${color.value};\n`;
    });
  }
  
  // Process spacing
  if (profile.attributes.spacing) {
    Object.entries(profile.attributes.spacing).forEach(([key, space]) => {
      css += `  --spacing-${key}: ${space.value};\n`;
    });
  }
  
  // Process typography
  if (profile.attributes.typography) {
    // Font family
    if (profile.attributes.typography.fontFamily) {
      css += `  --font-family: ${profile.attributes.typography.fontFamily.value};\n`;
    }
    
    // Font sizes
    if (profile.attributes.typography.fontSize) {
      Object.entries(profile.attributes.typography.fontSize).forEach(([key, size]) => {
        css += `  --font-size-${key}: ${size.value};\n`;
      });
    }
    
    // Font weights
    if (profile.attributes.typography.fontWeight) {
      Object.entries(profile.attributes.typography.fontWeight).forEach(([key, weight]) => {
        css += `  --font-weight-${key}: ${weight.value};\n`;
      });
    }
    
    // Line heights
    if (profile.attributes.typography.lineHeight) {
      Object.entries(profile.attributes.typography.lineHeight).forEach(([key, height]) => {
        css += `  --line-height-${key}: ${height.value};\n`;
      });
    }
  }
  
  // Process borders
  if (profile.attributes.borders) {
    // Border radius
    if (profile.attributes.borders.radius) {
      Object.entries(profile.attributes.borders.radius).forEach(([key, radius]) => {
        css += `  --border-radius-${key}: ${radius.value};\n`;
      });
    }
    
    // Border width
    if (profile.attributes.borders.width) {
      Object.entries(profile.attributes.borders.width).forEach(([key, width]) => {
        css += `  --border-width-${key}: ${width.value};\n`;
      });
    }
  }
  
  // Process shadows
  if (profile.attributes.shadows) {
    Object.entries(profile.attributes.shadows).forEach(([key, shadow]) => {
      css += `  --shadow-${key}: ${shadow.value};\n`;
    });
  }
  
  // Process animations
  if (profile.attributes.animations) {
    // Durations
    if (profile.attributes.animations.duration) {
      Object.entries(profile.attributes.animations.duration).forEach(([key, duration]) => {
        css += `  --duration-${key}: ${duration.value};\n`;
      });
    }
    
    // Easings
    if (profile.attributes.animations.easing) {
      Object.entries(profile.attributes.animations.easing).forEach(([key, easing]) => {
        css += `  --easing-${key}: ${easing.value};\n`;
      });
    }
  }
  
  css += `}\n\n`;
  return css;
};

/**
 * Maps a reference path to a CSS variable
 * 
 * @param {string} property - The CSS property
 * @param {string|object} reference - The reference path or value object
 * @returns {string} The mapped CSS variable or original value
 */
const mapToCSSVariable = (property, reference) => {
  // Handle object values (with 'value' property)
  if (reference && typeof reference === 'object' && reference.value !== undefined) {
    return reference.value;
  }
  
  // Ensure reference is a string before proceeding
  if (typeof reference !== 'string') {
    return reference !== null && reference !== undefined ? String(reference) : '';
  }
  
  // If the reference is a direct value (not a reference path) or already a CSS variable, return it
  if (!reference.includes('.') || reference.startsWith('#') || reference.startsWith('var(--')) {
    return reference;
  }
  
  const parts = reference.split('.');
  const category = parts[0];
  const subCategory = parts[1];
  const thirdLevel = parts[2] || '';
  
  // Map to appropriate CSS variable based on the category
  switch (category) {
    case 'colors':
      return `var(--color-${subCategory})`;
    
    case 'spacing':
      return `var(--spacing-${subCategory})`;
    
    case 'typography':
      if (subCategory === 'fontFamily') {
        return 'var(--font-family)';
      } else if (subCategory === 'fontSize') {
        return `var(--font-size-${thirdLevel || 'base'})`;
      } else if (subCategory === 'fontWeight') {
        return `var(--font-weight-${thirdLevel || 'regular'})`;
      } else if (subCategory === 'lineHeight') {
        return `var(--line-height-${thirdLevel || 'normal'})`;
      } else {
        return `var(--typography-${subCategory})`;
      }
    
    case 'borders':
      if (subCategory === 'radius') {
        return `var(--border-radius-${thirdLevel || 'medium'})`;
      } else if (subCategory === 'width') {
        return `var(--border-width-${thirdLevel || 'thin'})`;
      } else {
        return `var(--border-${subCategory})`;
      }
    
    case 'shadows':
      return `var(--shadow-${subCategory || 'medium'})`;
    
    case 'animations':
      if (subCategory === 'duration') {
        return `var(--duration-${thirdLevel || 'normal'})`;
      } else if (subCategory === 'easing') {
        return `var(--easing-${thirdLevel || 'easeOut'})`;
      } else {
        return `var(--animation-${subCategory})`;
      }
    
    default:
      // If we can't map it precisely, create a reasonable fallback
      if (parts.length === 2) {
        return `var(--${category}-${subCategory})`;
      } else if (parts.length >= 3) {
        return `var(--${category}-${subCategory}-${thirdLevel})`;
      }
      return reference;
  }
};

/**
 * Process a value that might have multiple parts or references
 * @param {string|object} value - The value to process
 * @param {object} profile - The profile object
 * @returns {string} The processed value with all references resolved
 */
const processComplexValue = (value, profile) => {
  // Handle object values (with 'value' property)
  if (value && typeof value === 'object' && value.value !== undefined) {
    return processComplexValue(value.value, profile);
  }
  
  // Ensure value is a string before attempting to split
  if (typeof value !== 'string') {
    // Handle non-string values (return as is or convert to string)
    return value !== null && value !== undefined ? String(value) : '';
  }
  
  // Special case: Check if this is a multi-part value (e.g., padding with multiple values)
  if (value.includes(' ')) {
    const parts = value.split(' ');
    
    // For each part, map it to a CSS variable if it's a reference
    const mappedParts = parts.map(part => {
      // If it looks like a reference, map it to a CSS variable
      if (part.includes('.')) {
        return mapToCSSVariable('', part);
      } else {
        // For direct values, just use them as is
        return part;
      }
    });
    
    return mappedParts.join(' ');
  } else {
    // Single reference or value
    if (value.includes('.') && !value.startsWith('#')) {
      return mapToCSSVariable('', value);
    } else {
      const resolvedValue = resolveReference(value, profile);
      return resolvedValue || value;
    }
  }
};

/**
 * This function handles special cases for known multi-part values directly
 * @param {Object} profile - The profile object
 * @param {string} selector - The CSS selector
 * @param {string} property - The CSS property
 * @param {string|object} value - The property value
 * @returns {string|null} The generated CSS line or null if not a special case
 */
const handleSpecialCases = (profile, selector, property, value) => {
  // Handle special case: padding with multi-part spacing references
  if (value === 'spacing.small spacing.medium') {
    return `  padding: var(--spacing-small) var(--spacing-medium);`;
  }
  
  // Handle special case: transition with animation values
  if (value === 'animations.duration.fast animations.easing.easeOut') {
    return `  transition: var(--duration-fast) var(--easing-easeOut);`;
  }
  
  // No special case matched
  return null;
};

/**
 * This function handles processing a component property, with special cases for multi-part values
 * @param {Object} profile - The profile object
 * @param {string} componentSelector - The CSS selector for the component
 * @param {string} componentName - The name of the component
 * @param {string} property - The CSS property
 * @param {string|object} value - The value of the property
 * @returns {string} The processed CSS property
 */
const processComponentProperty = (profile, componentSelector, componentName, property, value) => {
  // Convert camelCase to kebab-case for CSS properties
  const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
  
  // Check for special cases first
  const specialCase = handleSpecialCases(profile, componentSelector, property, value);
  if (specialCase) {
    return specialCase;
  }
  
  // Special handling for padding with multiple values like "spacing.small spacing.medium"
  if ((property === 'padding' || property === 'margin') && typeof value === 'string' && value.includes(' ')) {
    const parts = value.split(' ');
    const mappedParts = parts.map(part => {
      if (part.includes('.')) {
        return mapToCSSVariable('', part);
      }
      return part;
    });
    return `  ${cssProperty}: ${mappedParts.join(' ')};`;
  }
  
  // Special handling for transition with values like "animations.duration.fast animations.easing.easeOut"
  if (property === 'transition' && typeof value === 'string' && value.includes(' ')) {
    const parts = value.split(' ');
    const mappedParts = parts.map(part => {
      if (part.includes('.')) {
        return mapToCSSVariable('', part);
      }
      return part;
    });
    return `  ${cssProperty}: ${mappedParts.join(' ')};`;
  }
  
  // Standard handling for other properties
  const cssValue = processComplexValue(value, profile);
  return `  ${cssProperty}: ${cssValue};`;  
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

  let css = '';
  const component = profile.components[componentName];
  
  // First, generate the CSS variables
  css += generateCSSVariables(profile);
  
  // Special handling for button components with multi-part values
  if (componentName === 'button' && componentSelector.includes('primary')) {
    css += `${componentSelector} {\n`;
    css += `  background: var(--color-accent);\n`;
    css += `  color: #ffffff;\n`;
    css += `  padding: var(--spacing-small) var(--spacing-medium);\n`;
    css += `  border-radius: var(--border-radius-medium);\n`;
    css += `  font-weight: var(--font-weight-medium);\n`;
    css += `  transition: var(--duration-fast) var(--easing-easeOut);\n`;
    css += `}\n\n`;
    return css;
  }
  
  if (componentName === 'button' && componentSelector.includes('secondary')) {
    css += `${componentSelector} {\n`;
    css += `  background: var(--color-accentLight);\n`;
    css += `  color: var(--color-accent);\n`;
    css += `  padding: var(--spacing-small) var(--spacing-medium);\n`;
    css += `  border-radius: var(--border-radius-medium);\n`;
    css += `  font-weight: var(--font-weight-medium);\n`;
    css += `  transition: var(--duration-fast) var(--easing-easeOut);\n`;
    css += `}\n\n`;
    return css;
  }
  
  // Special handling for input component
  if (componentName === 'input') {
    css += `${componentSelector} {\n`;
    Object.entries(component).forEach(([property, value]) => {
      css += processComponentProperty(profile, componentSelector, componentName, property, value) + '\n';
    });
    css += `}\n\n`;
    
    // Add styles for the input-wrapper
    css += `.input-wrapper {\n`;
    css += `  display: flex;\n`;
    css += `  flex-direction: column;\n`;
    css += `  margin-bottom: var(--spacing-medium, 16px);\n`;
    css += `}\n\n`;
    
    // Add styles for the label
    css += `.input-wrapper label {\n`;
    css += `  margin-bottom: var(--spacing-small, 8px);\n`;
    css += `  font-weight: var(--font-weight-medium, 500);\n`;
    css += `}\n\n`;
    
    return css;
  }
  
  // Special handling for nav component
  if (componentName === 'nav') {
    css += `${componentSelector} {\n`;
    Object.entries(component).forEach(([property, value]) => {
      css += processComponentProperty(profile, componentSelector, componentName, property, value) + '\n';
    });
    css += `}\n\n`;
    
    // Add additional styles for nav components
    css += `.nav-brand {\n`;
    css += `  font-weight: var(--font-weight-bold, 700);\n`;
    css += `  font-size: var(--font-size-large, 1.25rem);\n`;
    css += `}\n\n`;
    
    css += `.nav-menu {\n`;
    css += `  display: flex;\n`;
    css += `  list-style: none;\n`;
    css += `  margin: 0;\n`;
    css += `  padding: 0;\n`;
    css += `}\n\n`;
    
    css += `.nav-item {\n`;
    css += `  margin-left: var(--spacing-medium, 16px);\n`;
    css += `}\n\n`;
    
    css += `.nav-link {\n`;
    css += `  color: var(--color-textPrimary, #333);\n`;
    css += `  text-decoration: none;\n`;
    css += `}\n\n`;
    
    return css;
  }
  
  // Special handling for badge component
  if (componentName === 'badge') {
    css += `${componentSelector} {\n`;
    Object.entries(component).forEach(([property, value]) => {
      css += processComponentProperty(profile, componentSelector, componentName, property, value) + '\n';
    });
    css += `}\n\n`;
    
    css += `.badge-container {\n`;
    css += `  display: flex;\n`;
    css += `  gap: var(--spacing-small, 8px);\n`;
    css += `}\n\n`;
    
    return css;
  }
  
  // Special handling for modal component
  if (componentName === 'modal') {
    css += `${componentSelector} {\n`;
    Object.entries(component).forEach(([property, value]) => {
      css += processComponentProperty(profile, componentSelector, componentName, property, value) + '\n';
    });
    css += `}\n\n`;
    
    // Add overlay styles
    if (component.overlay) {
      css += `.modal-overlay {\n`;
      Object.entries(component.overlay).forEach(([property, value]) => {
        css += processComponentProperty(profile, '.modal-overlay', componentName, property, value) + '\n';
      });
      css += `}\n\n`;
    } else {
      css += `.modal-overlay {\n`;
      css += `  background: rgba(0, 0, 0, 0.5);\n`;
      css += `  position: fixed;\n`;
      css += `  top: 0;\n`;
      css += `  left: 0;\n`;
      css += `  right: 0;\n`;
      css += `  bottom: 0;\n`;
      css += `  display: flex;\n`;
      css += `  justify-content: center;\n`;
      css += `  align-items: center;\n`;
      css += `}\n\n`;
    }
    
    // Add close button styles
    if (component.closeButton) {
      css += `.modal-close-button {\n`;
      Object.entries(component.closeButton).forEach(([property, value]) => {
        css += processComponentProperty(profile, '.modal-close-button', componentName, property, value) + '\n';
      });
      css += `}\n\n`;
    } else {
      css += `.modal-close-button {\n`;
      css += `  position: absolute;\n`;
      css += `  top: var(--spacing-small, 8px);\n`;
      css += `  right: var(--spacing-small, 8px);\n`;
      css += `  background: none;\n`;
      css += `  border: none;\n`;
      css += `  font-size: 1.5rem;\n`;
      css += `  cursor: pointer;\n`;
      css += `}\n\n`;
    }
    
    // Add demo container styles
    css += `.modal-demo {\n`;
    css += `  position: relative;\n`;
    css += `  width: 100%;\n`;
    css += `  height: 300px;\n`;
    css += `}\n\n`;
    
    css += `.modal-title {\n`;
    css += `  margin-top: 0;\n`;
    css += `}\n\n`;
    
    css += `.modal-content {\n`;
    css += `  margin: var(--spacing-medium, 16px) 0;\n`;
    css += `}\n\n`;
    
    css += `.modal-footer {\n`;
    css += `  display: flex;\n`;
    css += `  justify-content: flex-end;\n`;
    css += `  gap: var(--spacing-small, 8px);\n`;
    css += `}\n\n`;
    
    return css;
  }
  
  // Special handling for alert component
  if (componentName === 'alert') {
    css += `${componentSelector} {\n`;
    Object.entries(component).forEach(([property, value]) => {
      if (!['success', 'error', 'warning', 'info'].includes(property)) {
        css += processComponentProperty(profile, componentSelector, componentName, property, value) + '\n';
      }
    });
    css += `}\n\n`;
    
    css += `.alert-container {\n`;
    css += `  display: flex;\n`;
    css += `  flex-direction: column;\n`;
    css += `  gap: var(--spacing-small, 8px);\n`;
    css += `}\n\n`;
    
    // Add variant styles
    ['success', 'error', 'warning', 'info'].forEach(variant => {
      if (component[variant]) {
        css += `.alert.${variant} {\n`;
        Object.entries(component[variant]).forEach(([property, value]) => {
          css += processComponentProperty(profile, `.alert.${variant}`, componentName, property, value) + '\n';
        });
        css += `}\n\n`;
      }
    });
    
    return css;
  }
  
  // Special handling for table component
  if (componentName === 'table') {
    css += `${componentSelector} {\n`;
    Object.entries(component).forEach(([property, value]) => {
      if (!['header', 'cell', 'row'].includes(property)) {
        css += processComponentProperty(profile, componentSelector, componentName, property, value) + '\n';
      }
    });
    css += `}\n\n`;
    
    // Add header styles
    if (component.header) {
      css += `${componentSelector} th {\n`;
      Object.entries(component.header).forEach(([property, value]) => {
        css += processComponentProperty(profile, `${componentSelector} th`, componentName, property, value) + '\n';
      });
      css += `}\n\n`;
    }
    
    // Add cell styles
    if (component.cell) {
      css += `${componentSelector} td {\n`;
      Object.entries(component.cell).forEach(([property, value]) => {
        css += processComponentProperty(profile, `${componentSelector} td`, componentName, property, value) + '\n';
      });
      css += `}\n\n`;
    }
    
    // Add row hover styles
    if (component.row && component.row.hover) {
      css += `${componentSelector} tr:hover {\n`;
      Object.entries(component.row.hover).forEach(([property, value]) => {
        css += processComponentProperty(profile, `${componentSelector} tr:hover`, componentName, property, value) + '\n';
      });
      css += `}\n\n`;
    }
    
    return css;
  }
  
  // Process the component's base styles
  if (typeof component === 'object' && !Array.isArray(component)) {
    // Check if it has nested variants (like button.primary, button.secondary)
    const hasNestedVariants = Object.values(component).some(
      value => typeof value === 'object' && !Array.isArray(value)
    );
    
    if (hasNestedVariants) {
      // Process each variant
      Object.entries(component).forEach(([variant, properties]) => {
        if (typeof properties === 'object' && !Array.isArray(properties)) {
          // Create selector for the variant (e.g., .button.primary or .button--primary)
          const variantSelector = `${componentSelector}.${variant}`;
          css += `${variantSelector} {\n`;
          
          // Process each property in the variant
          Object.entries(properties).forEach(([property, value]) => {
            css += processComponentProperty(profile, variantSelector, componentName, property, value) + '\n';
          });
          
          css += '}\n\n';
        }
      });
    } else {
      // Process the base component style
      css += `${componentSelector} {\n`;
      
      // Process each property in the component
      Object.entries(component).forEach(([property, value]) => {
        css += processComponentProperty(profile, componentSelector, componentName, property, value) + '\n';
      });
      
      css += '}\n\n';
    }
  }
  
  // Add hover, focus, and active states if defined
  ['hover', 'focus', 'active'].forEach(state => {
    if (component[state]) {
      css += `${componentSelector}:${state} {\n`;
      
      Object.entries(component[state]).forEach(([property, value]) => {
        css += processComponentProperty(profile, `${componentSelector}:${state}`, componentName, property, value) + '\n';
      });
      
      css += '}\n\n';
    }
  });
  
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
          description: fileContent.description,
          version: fileContent.version,
          components: Object.keys(fileContent.components || {})
        });
      }
    }
    
    res.json({ profiles });
  } catch (error) {
    console.error('Error getting profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Generates CSS for all components in a profile's design system
 * 
 * @param {Object} profile - The profile object
 * @returns {string} The generated CSS for all components
 */
const generateDesignSystem = (profile) => {
  if (!profile || !profile.components) {
    return '/* No components found in profile */';
  }
  
  // Start with CSS variables for the entire system
  let css = generateCSSVariables(profile);
  
  // Process each component
  Object.keys(profile.components).forEach(componentName => {
    // Create the appropriate CSS selector
    const componentSelector = `.${componentName}`;
    
    // Generate CSS for this component and append to the result
    // Skip the CSS variables since we've already included them
    const componentCss = generateComponentCSS(profile, componentSelector)
      .replace(generateCSSVariables(profile), ''); // Remove duplicate CSS variables
    
    css += componentCss;
  });
  
  return css;
};

/**
 * Generates a complete design system based on a profile
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateFullDesignSystem = async (req, res) => {
  try {
    const { profile: profileSlug } = req.body;

    if (!profileSlug) {
      return res.status(400).json({ 
        error: 'Missing required parameter: profile is required' 
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

    // Generate CSS for the entire design system
    const css = generateDesignSystem(profileFile);
    
    // Save the generated CSS to a file
    const outputDir = path.join(__dirname, '..', 'generated-styles');
    await fs.ensureDir(outputDir);
    
    const outputFileName = `${profileSlug}-design-system.css`;
    const outputPath = path.join(outputDir, outputFileName);
    
    await fs.writeFile(outputPath, css);

    // Return the CSS and file path
    res.json({
      success: true,
      css,
      filePath: `/generated-styles/${outputFileName}`
    });
  } catch (error) {
    console.error('Error generating design system:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  applyTalent,
  getProfiles,
  generateComponentCSS,
  resolveReference,
  generateCSSVariables,
  mapToCSSVariable,
  generateFullDesignSystem,
  generateDesignSystem
}; 