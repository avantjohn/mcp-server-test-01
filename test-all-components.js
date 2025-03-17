const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';
const API_PROFILES = `${API_BASE_URL}/profiles`;
const API_GENERATE_SYSTEM = `${API_BASE_URL}/generate-design-system`;

/**
 * Tests all components for all profiles
 */
async function testAllComponents() {
  try {
    console.log('🔍 Testing all components across all profiles...\n');
    
    // Get all profiles
    const profilesResponse = await fetch(API_PROFILES);
    if (!profilesResponse.ok) {
      throw new Error(`Failed to fetch profiles: ${profilesResponse.status}`);
    }
    
    const profilesData = await profilesResponse.json();
    const profiles = profilesData.profiles || [];
    
    if (profiles.length === 0) {
      console.log('❌ No profiles found. Please add profiles to the profiles directory.');
      return;
    }
    
    console.log(`📋 Found ${profiles.length} profiles:`);
    profiles.forEach(profile => {
      console.log(`   - ${profile.name} (${profile.slug})`);
    });
    console.log('');
    
    // Define standard components to test
    const standardComponents = ['button', 'card', 'heading', 'text', 'input', 'nav', 'badge', 'modal', 'alert', 'table'];
    
    // Test each profile
    for (const profile of profiles) {
      console.log(`\n🧪 Testing profile: ${profile.name} (${profile.slug})`);
      
      // Get the full design system for this profile
      const systemResponse = await fetch(API_GENERATE_SYSTEM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profile.slug }),
      });
      
      if (!systemResponse.ok) {
        console.log(`❌ Failed to generate design system for ${profile.name}: ${systemResponse.status}`);
        continue;
      }
      
      const systemData = await systemResponse.json();
      if (!systemData.success) {
        console.log(`❌ Error generating design system for ${profile.name}: ${systemData.message || 'Unknown error'}`);
        continue;
      }
      
      // Extract components available in this profile
      // Look for patterns like ".component {" in the CSS
      const cssComponentMatches = systemData.css.match(/\.([\w-]+)\s*[{]/g) || [];
      const availableComponents = new Set(
        cssComponentMatches
          .map(match => match.replace(/\.\s*([^{]+)\s*{/, '$1').trim())
          .filter(component => component && !component.includes(' ')) // Filter out complex selectors
      );
      
      // Include standard components that should be tested
      const componentsToTest = [...new Set([...standardComponents, ...availableComponents])];
      
      console.log(`   Found ${availableComponents.size} components in CSS output`);
      console.log(`   Testing ${componentsToTest.length} components`);
      
      // Create a directory to save test results
      const testResultsDir = path.join(__dirname, 'test-results', profile.slug);
      await fs.ensureDir(testResultsDir);
      
      // Save the full design system CSS
      await fs.writeFile(
        path.join(testResultsDir, 'design-system.css'),
        systemData.css,
        'utf8'
      );
      
      // Test each component
      let passedCount = 0;
      let failedCount = 0;
      
      for (const component of componentsToTest) {
        try {
          // Check if the component exists in the CSS
          const componentRegex = new RegExp(`\\.(${component}[^{]*){[\\s\\S]*?}`, 'g');
          const componentMatches = systemData.css.match(componentRegex);
          
          if (!componentMatches) {
            console.log(`   ⚠️ Component '${component}' not found in CSS for ${profile.name}`);
            failedCount++;
            continue;
          }
          
          // Extract the component CSS
          const componentCSS = componentMatches.join('\n\n');
          
          // Save the component CSS
          await fs.writeFile(
            path.join(testResultsDir, `${component}.css`),
            componentCSS,
            'utf8'
          );
          
          console.log(`   ✅ Component '${component}' successfully generated`);
          passedCount++;
        } catch (error) {
          console.log(`   ❌ Error testing component '${component}': ${error.message}`);
          failedCount++;
        }
      }
      
      console.log(`   📊 Results for ${profile.name}: ${passedCount} passed, ${failedCount} failed`);
    }
    
    console.log('\n🎉 Testing completed!');
  } catch (error) {
    console.error('\n❌ Error testing components:', error);
  }
}

// Run the test
testAllComponents(); 