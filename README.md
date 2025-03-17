# Popmelt MCP Server

A Model-Controlled Programming (MCP) server for Popmelt, a platform that generates dynamic design systems and UI components based on structured Taste Profiles defined in JSON metadata files.

## Features

- Dynamically reads profile JSON files from a `/profiles` directory
- Generates CSS style outputs based on weighted attributes within profiles
- Returns generated CSS to the requester as a downloadable file or JSON response
- Provides API endpoints for applying talent profiles and fetching available profiles
- Support for CSS variables and modern design tokens
- Handles component variants, states (hover, focus, active), and nested elements
- Comprehensive profile management with CRUD operations
- Component templates for quick generation of standard UI elements
- **NEW**: Visual frontend for interactive design system generation and preview

## Project Structure

```
popmelt-mcp-server/
├── index.js (entry point)
├── app.js (Express application)
├── package.json
├── /profiles
│   ├── olivia-gray.json
│   ├── tech-minimalist.json
│   ├── nature-inspired.json
│   └── luminous-minimalism.json
├── /generated-styles
│   └── [profile-name]-[component-name].css
├── /public
│   ├── index.html (Frontend interface)
│   ├── /css
│   │   └── styles.css (Frontend styling)
│   └── /js
│       └── app.js (Frontend logic)
└── /routes
    ├── applyTalent.js
    ├── profileManagement.js
    └── componentTemplates.js
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/popmelt-mcp-server.git
cd popmelt-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Running Tests

To run the test suite:

```bash
npm test
```

The tests use Jest and supertest to verify API endpoints are functioning correctly.

## Visual Frontend

The Popmelt MCP Server now includes a visual frontend that allows designers and developers to:

- Browse available design system profiles
- Generate CSS for specific components or entire design systems
- Preview components with the applied styles in real-time
- Copy generated CSS for use in projects

### Using the Frontend

1. Start the server using `npm start`
2. Open your browser and navigate to `http://localhost:3000`
3. Select a profile from the dropdown menu
4. Choose a component to generate CSS for that specific component, or click "Generate Full System" for the entire design system
5. See live previews of the components with the applied styles
6. Copy the generated CSS using the "Copy CSS" button

The frontend is built with vanilla JavaScript and CSS, making it lightweight and easy to customize.

## API Endpoints

### Component Generation

#### Apply Talent Profile

Applies a talent profile to a component and generates CSS.

**Endpoint:** `POST /api/apply-talent`

**Request Body:**
```json
{
  "profile": "olivia-gray",
  "component": ".card"
}
```

**Response:**
```json
{
  "success": true,
  "css": "/* Generated CSS with variables */",
  "filePath": "/generated-styles/olivia-gray-card.css"
}
```

#### Generate Full Design System

Generates CSS for all components in a profile as a complete design system.

**Endpoint:** `POST /api/generate-design-system`

**Request Body:**
```json
{
  "profile": "olivia-gray"
}
```

**Response:**
```json
{
  "success": true,
  "css": "/* Complete design system CSS with all components */",
  "filePath": "/generated-styles/olivia-gray-design-system.css"
}
```

#### Generate Component CSS

Generates CSS for a specific component from a profile.

**Endpoint:** `POST /api/generate-component`

**Request Body:**
```json
{
  "profile": "olivia-gray",
  "component": "button"
}
```

**Response:**
```json
{
  "success": true,
  "css": "/* Component-specific CSS with variables */",
  "filePath": "/generated-styles/olivia-gray-button.css"
}
```

#### Get Available Profiles

Returns a list of all available talent profiles.

**Endpoint:** `GET /api/profiles`

**Response:**
```json
{
  "profiles": [
    {
      "name": "Olivia Gray Design System",
      "author": "Olivia Gray",
      "slug": "olivia-gray",
      "description": "A clean, modern design system with a blue accent color and minimalist aesthetic",
      "version": "1.0.0",
      "components": ["button", "card", "heading", "text"]
    },
    {
      "name": "Tech Minimalist Design System",
      "author": "Tech Minimalist",
      "slug": "tech-minimalist",
      "description": "A tech-focused design system with dark mode support and vibrant accents",
      "version": "1.0.0",
      "components": ["button", "card", "heading", "text"]
    }
  ]
}
```

### Profile Management

#### Create Profile

Creates a new talent profile.

**Endpoint:** `POST /api/profiles`

**Request Body:** Full profile JSON object

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "name": "Profile Name",
    "author": "Author Name",
    "slug": "author-name",
    "description": "Description",
    "version": "1.0.0",
    "created": "2023-03-14T12:00:00Z"
  }
}
```

#### Get Single Profile

Retrieves a specific profile by slug.

**Endpoint:** `GET /api/profiles/:slug`

**Response:**
```json
{
  "success": true,
  "profile": {
    /* Complete profile object */
  }
}
```

#### Update Profile

Updates an existing profile.

**Endpoint:** `PUT /api/profiles/:slug`

**Request Body:** Full or partial profile JSON object

**Response:**
```json
{
  "success": true,
  "profile": {
    /* Updated profile metadata */
  }
}
```

#### Delete Profile

Deletes a profile and its generated assets.

**Endpoint:** `DELETE /api/profiles/:slug`

**Response:**
```json
{
  "success": true,
  "message": "Profile successfully deleted"
}
```

### Component Templates

#### Get Available Templates

Returns a list of all available component templates.

**Endpoint:** `GET /api/templates`

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "name": "button",
      "description": "A button component with primary and secondary variants"
    },
    {
      "name": "card",
      "description": "A card container with hover effect and shadow"
    }
  ]
}
```

#### Create Profile from Templates

Creates a new profile using component templates.

**Endpoint:** `POST /api/templates/create-profile`

**Request Body:**
```json
{
  "name": "My Design System",
  "author": "Designer Name",
  "slug": "designer-name",
  "description": "My custom design system",
  "components": ["button", "card", "input", "alert"]
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    /* Created profile metadata */
  }
}
```

## Profile Structure

Popmelt MCP Server uses JSON profiles to define design systems. Each profile includes:

- Basic metadata (name, author, description, version)
- Design tokens (colors, spacing, typography, borders, animations)
- Component definitions with variants and states

See the example profiles in the `/profiles` directory for the complete structure.

## CSS Variable Generation

The server automatically converts design tokens into CSS variables, making them easily reusable throughout the design system. For example:

```css
:root {
  --color-background: #ffffff;
  --color-text-primary: #1a1a1a;
  --color-accent: #3d7aff;
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --font-family: 'Inter', sans-serif;
  --font-size-medium: 16px;
  --font-weight-medium: 500;
  --border-radius-medium: 8px;
  --duration-fast: 150ms;
  --easing-ease-out: ease-out;
}
```

## Technologies Used

- Node.js
- Express.js
- fs-extra for file operations
- HTML/CSS/JavaScript for the frontend
- Jest and Supertest for testing

## License

MIT 