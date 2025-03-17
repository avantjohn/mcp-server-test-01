const fs = require('fs-extra');
const path = require('path');

/**
 * Common UI component templates that can be used as a starting point
 * for talent profile components
 */
const componentTemplates = {
  // Basic button component with variants
  button: {
    primary: {
      background: 'colors.accent',
      color: '#ffffff',
      padding: 'spacing.small spacing.medium',
      borderRadius: 'borders.radius.medium',
      fontWeight: 'typography.fontWeight.medium',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color animations.duration.fast animations.easing.easeOut',
      hover: {
        background: 'colors.accentDark'
      },
      focus: {
        outline: 'colors.accent borders.width.medium solid',
        outlineOffset: '2px'
      },
      active: {
        transform: 'translateY(1px)'
      }
    },
    secondary: {
      background: 'colors.accentLight',
      color: 'colors.accent',
      padding: 'spacing.small spacing.medium',
      borderRadius: 'borders.radius.medium',
      fontWeight: 'typography.fontWeight.medium',
      border: 'colors.accent borders.width.thin solid',
      cursor: 'pointer',
      transition: 'background-color animations.duration.fast animations.easing.easeOut',
      hover: {
        background: 'colors.background',
        borderColor: 'colors.accentDark'
      },
      focus: {
        outline: 'colors.accent borders.width.medium solid',
        outlineOffset: '2px'
      },
      active: {
        transform: 'translateY(1px)'
      }
    }
  },
  
  // Card component
  card: {
    background: 'colors.background',
    padding: 'spacing.large',
    borderRadius: 'borders.radius.medium',
    color: 'colors.textPrimary',
    boxShadow: 'shadows.small',
    transition: 'box-shadow animations.duration.normal animations.easing.easeOut',
    hover: {
      boxShadow: 'shadows.medium'
    }
  },
  
  // Text input component
  input: {
    background: 'colors.background',
    color: 'colors.textPrimary',
    padding: 'spacing.small spacing.medium',
    borderRadius: 'borders.radius.small',
    border: 'colors.textSecondary borders.width.thin solid',
    fontSize: 'typography.fontSize.medium',
    lineHeight: 'typography.lineHeight.normal',
    transition: 'border-color animations.duration.fast animations.easing.easeOut',
    focus: {
      borderColor: 'colors.accent',
      outline: 'none'
    },
    placeholder: {
      color: 'colors.textSecondary'
    }
  },
  
  // Navigation component
  nav: {
    background: 'colors.background',
    padding: 'spacing.medium',
    borderBottom: 'colors.textSecondary borders.width.thin solid',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  // Badge/tag component
  badge: {
    background: 'colors.accentLight',
    color: 'colors.accent',
    padding: 'spacing.small spacing.medium',
    borderRadius: 'borders.radius.round',
    fontSize: 'typography.fontSize.small',
    fontWeight: 'typography.fontWeight.medium',
    display: 'inline-block'
  },
  
  // Modal component
  modal: {
    background: 'colors.background',
    padding: 'spacing.large',
    borderRadius: 'borders.radius.medium',
    boxShadow: 'shadows.large',
    maxWidth: '500px',
    width: '100%',
    position: 'relative',
    overlay: {
      background: 'rgba(0, 0, 0, 0.5)',
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '1000'
    },
    closeButton: {
      position: 'absolute',
      top: 'spacing.medium',
      right: 'spacing.medium',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 'typography.fontSize.large',
      color: 'colors.textSecondary'
    }
  },
  
  // Alert/notification component
  alert: {
    padding: 'spacing.medium',
    borderRadius: 'borders.radius.small',
    fontSize: 'typography.fontSize.medium',
    display: 'flex',
    alignItems: 'center',
    marginBottom: 'spacing.medium',
    success: {
      background: '#e6f7e6',
      color: '#2c682c',
      borderLeft: '#2c682c borders.width.medium solid'
    },
    error: {
      background: '#fde7e7',
      color: '#b13939',
      borderLeft: '#b13939 borders.width.medium solid'
    },
    warning: {
      background: '#fff8e6',
      color: '#966a19',
      borderLeft: '#966a19 borders.width.medium solid'
    },
    info: {
      background: '#e6f3ff',
      color: '#3172b9',
      borderLeft: '#3172b9 borders.width.medium solid'
    }
  },
  
  // Table component
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    header: {
      background: 'colors.accentLight',
      padding: 'spacing.small spacing.medium',
      fontWeight: 'typography.fontWeight.bold',
      textAlign: 'left',
      borderBottom: 'colors.accent borders.width.thin solid'
    },
    cell: {
      padding: 'spacing.small spacing.medium',
      borderBottom: 'colors.textSecondary borders.width.thin solid'
    },
    row: {
      hover: {
        background: 'colors.accentLight'
      }
    }
  }
};

/**
 * Creates a skeleton profile based on template components
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTemplateProfile = async (req, res) => {
  try {
    const { name, author, slug, description, components } = req.body;
    
    // Validate required fields
    if (!name || !author || !slug) {
      return res.status(400).json({
        success: false,
        error: 'Name, author, and slug are required'
      });
    }
    
    // Validate components array
    if (!components || !Array.isArray(components) || components.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one component must be specified'
      });
    }
    
    // Validate that all requested components exist in templates
    const invalidComponents = components.filter(
      comp => !componentTemplates[comp]
    );
    
    if (invalidComponents.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid component(s): ${invalidComponents.join(', ')}`,
        availableComponents: Object.keys(componentTemplates)
      });
    }
    
    // Create a basic profile structure
    const profile = {
      name,
      author,
      slug,
      description: description || `A design system created by ${author}`,
      version: '1.0.0',
      attributes: {
        colors: {
          background: {
            value: '#ffffff',
            weight: 0.9
          },
          textPrimary: {
            value: '#1a1a1a',
            weight: 0.8
          },
          textSecondary: {
            value: '#6b6b6b',
            weight: 0.6
          },
          accent: {
            value: '#3d7aff',
            weight: 0.7
          },
          accentLight: {
            value: '#e8f0ff',
            weight: 0.5
          },
          accentDark: {
            value: '#2c5cc5',
            weight: 0.6
          }
        },
        spacing: {
          small: {
            value: '8px',
            weight: 0.5
          },
          medium: {
            value: '16px',
            weight: 0.7
          },
          large: {
            value: '24px',
            weight: 0.6
          },
          xlarge: {
            value: '48px',
            weight: 0.4
          }
        },
        typography: {
          fontFamily: {
            value: "'Inter', sans-serif",
            weight: 0.9
          },
          fontSize: {
            small: {
              value: '14px',
              weight: 0.6
            },
            medium: {
              value: '16px',
              weight: 0.8
            },
            large: {
              value: '20px',
              weight: 0.7
            },
            xlarge: {
              value: '28px',
              weight: 0.5
            }
          },
          fontWeight: {
            regular: {
              value: '400',
              weight: 0.7
            },
            medium: {
              value: '500',
              weight: 0.6
            },
            bold: {
              value: '700',
              weight: 0.5
            }
          },
          lineHeight: {
            tight: {
              value: '1.2',
              weight: 0.5
            },
            normal: {
              value: '1.5',
              weight: 0.8
            },
            loose: {
              value: '1.8',
              weight: 0.4
            }
          }
        },
        borders: {
          radius: {
            small: {
              value: '4px',
              weight: 0.6
            },
            medium: {
              value: '8px',
              weight: 0.8
            },
            large: {
              value: '16px',
              weight: 0.5
            },
            round: {
              value: '9999px',
              weight: 0.3
            }
          },
          width: {
            thin: {
              value: '1px',
              weight: 0.8
            },
            medium: {
              value: '2px',
              weight: 0.5
            },
            thick: {
              value: '4px',
              weight: 0.3
            }
          }
        },
        shadows: {
          small: {
            value: '0 2px 4px rgba(0, 0, 0, 0.05)',
            weight: 0.6
          },
          medium: {
            value: '0 4px 8px rgba(0, 0, 0, 0.08)',
            weight: 0.5
          },
          large: {
            value: '0 8px 16px rgba(0, 0, 0, 0.1)',
            weight: 0.4
          }
        },
        animations: {
          duration: {
            fast: {
              value: '150ms',
              weight: 0.6
            },
            normal: {
              value: '300ms',
              weight: 0.8
            },
            slow: {
              value: '500ms',
              weight: 0.4
            }
          },
          easing: {
            easeOut: {
              value: 'cubic-bezier(0.16, 1, 0.3, 1)',
              weight: 0.7
            },
            easeInOut: {
              value: 'cubic-bezier(0.65, 0, 0.35, 1)',
              weight: 0.6
            },
            linear: {
              value: 'linear',
              weight: 0.3
            }
          }
        }
      },
      components: {}
    };
    
    // Add the requested components from templates
    components.forEach(componentName => {
      profile.components[componentName] = componentTemplates[componentName];
    });
    
    // Generate a filename based on the slug and a timestamp
    const timestamp = Date.now();
    const filename = `${slug}-${timestamp}.json`;
    const profilesDir = path.join(__dirname, '..', 'profiles');
    const filePath = path.join(profilesDir, filename);
    
    // Add metadata - created date and ID
    profile.created = new Date().toISOString();
    profile.id = require('crypto').randomUUID();
    
    // Save the profile
    await fs.ensureDir(profilesDir);
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
        created: profile.created,
        components: Object.keys(profile.components)
      }
    });
  } catch (error) {
    console.error('Error creating template profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Gets all available component templates
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getComponentTemplates = (req, res) => {
  try {
    const templates = Object.keys(componentTemplates).map(name => ({
      name,
      description: getTemplateDescription(name)
    }));
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error getting component templates:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Get a description for a component template
 * 
 * @param {string} templateName - The name of the template
 * @returns {string} A description of the template
 */
const getTemplateDescription = (templateName) => {
  const descriptions = {
    button: 'A button component with primary and secondary variants',
    card: 'A card container with hover effect and shadow',
    input: 'A text input field with focus state',
    nav: 'A navigation bar component',
    badge: 'A badge or tag component for labels',
    modal: 'A modal dialog with overlay',
    alert: 'An alert/notification component with different states',
    table: 'A table component with styled header and rows'
  };
  
  return descriptions[templateName] || 'A UI component';
};

module.exports = {
  createTemplateProfile,
  getComponentTemplates,
  componentTemplates
}; 