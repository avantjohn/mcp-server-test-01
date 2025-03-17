const request = require('supertest');
const path = require('path');
const fs = require('fs-extra');

// Import the express app
const app = require('../app');

// Sample profile data for testing
const sampleProfile = {
  name: "Test Profile",
  author: "Test Author",
  slug: "test-author",
  description: "A profile for testing",
  version: "1.0.0",
  attributes: {
    colors: {
      primary: {
        value: "#3d7aff",
        weight: 0.8
      },
      secondary: {
        value: "#f5f5f5",
        weight: 0.6
      }
    },
    typography: {
      fontFamily: {
        value: "Inter, sans-serif",
        weight: 0.9
      },
      fontSize: {
        value: "16px",
        weight: 0.7
      }
    }
  },
  components: {
    card: {
      background: {
        value: "var(--color-secondary)",
        weight: 0.8
      },
      borderRadius: {
        value: "8px",
        weight: 0.7
      },
      boxShadow: {
        value: "0 2px 4px rgba(0, 0, 0, 0.05)",
        weight: 0.6
      }
    },
    button: {
      background: {
        value: "var(--color-primary)",
        weight: 0.9
      },
      color: {
        value: "white",
        weight: 0.8
      },
      borderRadius: {
        value: "4px",
        weight: 0.7
      },
      padding: {
        value: "0.5rem 1rem",
        weight: 0.6
      }
    }
  }
};

// Create a temp test profile
beforeAll(async () => {
  await fs.ensureDir(path.join(__dirname, '..', 'profiles'));
  await fs.writeJson(
    path.join(__dirname, '..', 'profiles', 'test-author.json'),
    sampleProfile
  );
});

// Remove the test profile after tests
afterAll(async () => {
  await fs.remove(path.join(__dirname, '..', 'profiles', 'test-author.json'));
});

describe('Health Check API', () => {
  it('should return 200 OK for health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});

describe('Profiles API', () => {
  it('should return a list of profiles', async () => {
    const response = await request(app).get('/api/profiles');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.profiles)).toBe(true);
    expect(response.body.profiles.some(p => p.slug === 'test-author')).toBe(true);
  });

  it('should fetch a specific profile by slug', async () => {
    const response = await request(app).get('/api/profiles/test-author');
    expect(response.status).toBe(200);
    expect(response.body.profile.name).toBe('Test Profile');
    expect(response.body.profile.author).toBe('Test Author');
  });
});

describe('Context Provider API', () => {
  it('should return system context information', async () => {
    const response = await request(app).get('/api/context');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.contexts)).toBe(true);
    const testProfile = response.body.contexts.find(c => c.id === 'test-author');
    expect(testProfile).toBeDefined();
    expect(testProfile.metadata.name).toBe('Test Profile');
  });

  it('should return detailed context for a specific profile', async () => {
    const response = await request(app).get('/api/context/profile/test-author');
    expect(response.status).toBe(200);
    expect(response.body.context.type).toBe('design_profile_detail');
    expect(response.body.context.id).toBe('test-author');
    expect(response.body.context.metadata.name).toBe('Test Profile');
  });

  it('should return component preview information', async () => {
    const response = await request(app).get('/api/context/preview/test-author/card');
    expect(response.status).toBe(200);
    expect(response.body.preview.component).toBe('card');
    expect(response.body.preview.profile).toBe('Test Profile');
    expect(response.body.preview.html).toBeDefined();
    expect(response.body.preview.css).toBeDefined();
  });
});

describe('Component Generation API', () => {
  it('should apply a talent profile to a component', async () => {
    const response = await request(app)
      .post('/api/apply-talent')
      .send({
        profile: 'test-author',
        component: '.card'
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.css).toBeDefined();
  });

  it('should generate a full design system for a profile', async () => {
    const response = await request(app)
      .post('/api/generate-design-system')
      .send({
        profile: 'test-author'
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.css).toBeDefined();
  });
});

describe('Component Templates API', () => {
  it('should return a list of available templates', async () => {
    const response = await request(app).get('/api/templates');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.templates)).toBe(true);
  });
}); 