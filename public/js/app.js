/**
 * Popmelt MCP Visualizer
 * Frontend JavaScript for interacting with the Popmelt MCP server
 */

// API URLs
const API_BASE_URL = 'http://localhost:3000/api';
const API_PROFILES = `${API_BASE_URL}/profiles`;
const API_GENERATE_SYSTEM = `${API_BASE_URL}/generate-design-system`;

// DOM Elements
const profileSelect = document.getElementById('profile-select');
const componentSelect = document.getElementById('component-select');
const generateComponentBtn = document.getElementById('generate-component');
const generateSystemBtn = document.getElementById('generate-system');
const cssOutputElement = document.getElementById('css-output');
const copyCssBtn = document.getElementById('copy-css');
const componentPreview = document.getElementById('component-preview');
const profileInfo = document.getElementById('profile-info');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');

// Create a style element for preview components
const previewStyleElement = document.createElement('style');
previewStyleElement.id = 'preview-styles';
document.head.appendChild(previewStyleElement);

// Component examples for preview
const componentExamples = {
  'button': {
    primaryExample: '<button class="button primary">Primary Button</button>',
    secondaryExample: '<button class="button secondary">Secondary Button</button>'
  },
  'card': {
    example: `<div class="card">
      <h3>Card Title</h3>
      <p>This is a sample card component with some content.</p>
    </div>`
  },
  'heading': {
    h1Example: '<h1 class="heading h1">Heading Level 1</h1>',
    h2Example: '<h2 class="heading h2">Heading Level 2</h2>'
  },
  'text': {
    bodyExample: '<p class="text body">This is body text that can be used for longer form content on your pages.</p>',
    captionExample: '<p class="text caption">This is caption text, typically used for smaller, supporting information.</p>'
  },
  'input': {
    example: `<div class="input-wrapper">
      <label for="sample-input">Sample Input</label>
      <input type="text" id="sample-input" class="input" placeholder="Enter text here...">
    </div>`
  },
  'nav': {
    example: `<nav class="nav">
      <div class="nav-brand">Brand Logo</div>
      <ul class="nav-menu">
        <li class="nav-item"><a href="#" class="nav-link">Home</a></li>
        <li class="nav-item"><a href="#" class="nav-link">Features</a></li>
        <li class="nav-item"><a href="#" class="nav-link">Pricing</a></li>
        <li class="nav-item"><a href="#" class="nav-link">About</a></li>
      </ul>
    </nav>`
  },
  'badge': {
    example: `<div class="badge-container">
      <span class="badge">New</span>
      <span class="badge">Featured</span>
      <span class="badge">Sale</span>
    </div>`
  },
  'modal': {
    example: `<div class="modal-demo">
      <div class="modal-overlay">
        <div class="modal">
          <button class="modal-close-button">×</button>
          <h2 class="modal-title">Modal Title</h2>
          <div class="modal-content">
            <p>This is a sample modal component.</p>
          </div>
          <div class="modal-footer">
            <button class="button primary">Accept</button>
            <button class="button secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>`
  },
  'alert': {
    successExample: `<div class="alert success">
      <strong>Success!</strong> Operation completed successfully.
    </div>`,
    errorExample: `<div class="alert error">
      <strong>Error!</strong> Something went wrong.
    </div>`,
    warningExample: `<div class="alert warning">
      <strong>Warning!</strong> Proceed with caution.
    </div>`,
    infoExample: `<div class="alert info">
      <strong>Info:</strong> This is an informational message.
    </div>`
  },
  'table': {
    example: `<table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>John Doe</td>
          <td>john@example.com</td>
          <td>Active</td>
        </tr>
        <tr>
          <td>Jane Smith</td>
          <td>jane@example.com</td>
          <td>Pending</td>
        </tr>
        <tr>
          <td>Mark Johnson</td>
          <td>mark@example.com</td>
          <td>Inactive</td>
        </tr>
      </tbody>
    </table>`
  }
};

// Initialize the app
async function init() {
  try {
    // Fetch available profiles
    const profiles = await fetchProfiles();
    populateProfileSelect(profiles);

    // Add event listeners
    profileSelect.addEventListener('change', handleProfileChange);
    componentSelect.addEventListener('change', handleComponentChange);
    generateComponentBtn.addEventListener('click', handleGenerateComponent);
    generateSystemBtn.addEventListener('click', handleGenerateSystem);
    copyCssBtn.addEventListener('click', handleCopyCss);
  } catch (error) {
    showNotification(`Error initializing app: ${error.message}`, true);
  }
}

// Fetch profiles from API
async function fetchProfiles() {
  try {
    const response = await fetch(API_PROFILES);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data.profiles || [];
  } catch (error) {
    showNotification(`Error fetching profiles: ${error.message}`, true);
    return [];
  }
}

// Populate profile select dropdown
function populateProfileSelect(profiles) {
  profileSelect.innerHTML = '';
  
  if (profiles.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No profiles available';
    option.disabled = true;
    option.selected = true;
    profileSelect.appendChild(option);
    return;
  }
  
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a profile';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  profileSelect.appendChild(defaultOption);
  
  // Reorder profiles to put Ethereal Simplicity first
  const etherealProfile = profiles.find(p => p.slug === 'ethereal-simplicity');
  const orderedProfiles = etherealProfile 
    ? [etherealProfile, ...profiles.filter(p => p.slug !== 'ethereal-simplicity')]
    : profiles;
  
  orderedProfiles.forEach(profile => {
    const option = document.createElement('option');
    option.value = profile.slug; // Use slug as value
    option.textContent = profile.name; // Use name for display
    profileSelect.appendChild(option);
  });
}

// Format profile name for display
function formatProfileName(profileId) {
  return profileId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Handle profile selection change
function handleProfileChange() {
  const selectedProfile = profileSelect.value;
  if (!selectedProfile) {
    resetComponentSelect();
    resetComponentPreview();
    resetProfileInfo();
    return;
  }
  
  // Find the selected profile in our data
  const selectedProfileData = profilesData.find(profile => profile.slug === selectedProfile);
  
  if (selectedProfileData) {
    populateComponentSelect(selectedProfileData.components);
    updateProfileInfo(selectedProfileData);
  } else {
    populateComponentSelect();
    updateProfileInfo({ slug: selectedProfile });
  }
}

// Store profiles data globally
let profilesData = [];

// Populate component select dropdown
function populateComponentSelect(components = ['button', 'card', 'heading', 'text', 'input', 'nav', 'badge', 'modal', 'alert', 'table']) {
  componentSelect.innerHTML = '';
  
  // Add option elements for each component
  components.forEach(component => {
    const option = document.createElement('option');
    option.value = component;
    option.textContent = component.charAt(0).toUpperCase() + component.slice(1);
    
    // Set button as the default selected option
    if (component === 'button') {
      option.selected = true;
    }
    
    componentSelect.appendChild(option);
  });
  
  // After populating the dropdown, trigger the component change handler
  // to update the preview for the default selected component
  handleComponentChange();
}

// Reset component select dropdown
function resetComponentSelect() {
  componentSelect.innerHTML = '';
  
  // Create a "Select profile first" disabled option
  const disabledOption = document.createElement('option');
  disabledOption.value = '';
  disabledOption.textContent = 'Select a profile first';
  disabledOption.disabled = true;
  componentSelect.appendChild(disabledOption);
  
  // Set the disabled option as selected
  disabledOption.selected = true;
}

// Handle component selection change
function handleComponentChange() {
  resetComponentPreview();
  
  // Get the currently selected component
  const selectedComponent = componentSelect.value;
  
  // If a component is selected, show its preview
  if (selectedComponent) {
    showComponentPreview(selectedComponent);
  }
}

// Filter CSS for specific component
function filterCSSForComponent(fullCSS, component) {
  // First, make sure we include the CSS variables (everything in :root {})
  const rootRegex = /:root\s*{[\s\S]*?}/;
  const rootMatch = fullCSS.match(rootRegex);
  let componentCSS = rootMatch ? rootMatch[0] + '\n\n' : '';
  
  // Find CSS for the specific component
  const componentRegex = new RegExp(`\\.(${component}[^{]*){[\\s\\S]*?}`, 'g');
  const componentMatches = fullCSS.match(componentRegex);
  
  if (componentMatches) {
    componentCSS += componentMatches.join('\n\n');
  }
  
  return componentCSS;
}

// Generate component CSS
async function handleGenerateComponent() {
  const profile = profileSelect.value;
  const component = componentSelect.value;
  
  if (!profile) {
    showNotification('Please select a profile', true);
    return;
  }
  
  if (!component) {
    showNotification('Please select a component', true);
    return;
  }
  
  try {
    // First, generate the full design system
    const response = await fetch(API_GENERATE_SYSTEM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Filter only the component we need
      const componentCSS = filterCSSForComponent(data.css, component);
      
      cssOutputElement.textContent = componentCSS;
      updatePreviewStyles(data.css); // Use full CSS for preview to ensure all variables are available
      showComponentPreview(component);
      showNotification('Component CSS generated successfully!');
    } else {
      throw new Error(data.message || 'Failed to generate component');
    }
  } catch (error) {
    showNotification(`Error generating component: ${error.message}`, true);
  }
}

// Generate full design system
async function handleGenerateSystem() {
  const profile = profileSelect.value;
  
  if (!profile) {
    showNotification('Please select a profile', true);
    return;
  }
  
  try {
    const response = await fetch(API_GENERATE_SYSTEM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      cssOutputElement.textContent = data.css;
      updatePreviewStyles(data.css);
      
      // If a component is selected, show its preview
      const component = componentSelect.value;
      if (component) {
        showComponentPreview(component);
      }
      
      showNotification('Design system generated successfully!');
    } else {
      throw new Error(data.message || 'Failed to generate design system');
    }
  } catch (error) {
    showNotification(`Error generating design system: ${error.message}`, true);
  }
}

// Copy CSS to clipboard
function handleCopyCss() {
  const css = cssOutputElement.textContent;
  
  if (!css || css.includes('Select a profile')) {
    showNotification('No CSS to copy', true);
    return;
  }
  
  navigator.clipboard.writeText(css)
    .then(() => showNotification('CSS copied to clipboard!'))
    .catch(error => showNotification(`Failed to copy: ${error.message}`, true));
}

// Update preview styles
function updatePreviewStyles(css) {
  previewStyleElement.textContent = css;
}

// Show component preview
function showComponentPreview(component) {
  resetComponentPreview();
  
  if (!componentExamples[component]) {
    componentPreview.innerHTML = `<div class="placeholder"><p>No preview available for ${component}</p></div>`;
    return;
  }
  
  const examplesContainer = document.createElement('div');
  examplesContainer.className = 'dynamic-component-container';
  
  // Get example snippets for the component
  const examples = componentExamples[component];
  
  Object.entries(examples).forEach(([key, html]) => {
    const exampleContainer = document.createElement('div');
    exampleContainer.className = 'component-example';
    
    const title = document.createElement('div');
    title.className = 'component-title';
    title.textContent = formatExampleTitle(key);
    
    const content = document.createElement('div');
    content.innerHTML = html;
    
    exampleContainer.appendChild(title);
    exampleContainer.appendChild(content);
    examplesContainer.appendChild(exampleContainer);
  });
  
  componentPreview.innerHTML = '';
  componentPreview.appendChild(examplesContainer);
}

// Format example title
function formatExampleTitle(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/Example$/, '');
}

// Reset component preview
function resetComponentPreview() {
  componentPreview.innerHTML = `
    <div class="placeholder">
      <p>Select a profile and component to see a preview</p>
    </div>
  `;
}

// Update profile information
function updateProfileInfo(profile) {
  profileInfo.innerHTML = `
    <h3>${profile.name || formatProfileName(profile.slug)}</h3>
    <p>${profile.description || 'A custom design system profile.'}</p>
    <ul>
      <li><strong>Author:</strong> ${profile.author || 'Unknown'}</li>
      <li><strong>Version:</strong> ${profile.version || '1.0.0'}</li>
      <li><strong>Components:</strong> ${(profile.components || []).join(', ') || 'Standard components'}</li>
    </ul>
  `;
}

// Reset profile information
function resetProfileInfo() {
  profileInfo.innerHTML = '<p>Select a profile to see details</p>';
}

// Show notification
function showNotification(message, isError = false) {
  notificationMessage.textContent = message;
  notification.classList.remove('hidden');
  
  if (isError) {
    notification.classList.add('error');
  } else {
    notification.classList.remove('error');
  }
  
  notification.classList.add('visible');
  
  setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 300); // Match transition duration
  }, 3000);
}

// Fetch and store profile data
async function fetchProfileData() {
  try {
    const response = await fetch(API_PROFILES);
    if (response.ok) {
      const data = await response.json();
      profilesData = data.profiles || [];
    }
  } catch (error) {
    console.error('Error fetching profile data:', error);
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  await fetchProfileData();
  init();
}); 