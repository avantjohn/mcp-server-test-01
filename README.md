# Popmelt MCP Server

A Model-Controlled Programming (MCP) server for Popmelt, a platform that generates dynamic design systems and UI components based on structured Taste Profiles defined in JSON metadata files.

## Features

- **Dynamic Profile Processing**: Reads and processes profile JSON files from a `/profiles` directory
- **CSS Generation Engine**: Generates modern CSS outputs based on weighted attributes within profiles
- **Design Token System**: Comprehensive support for CSS variables and modern design tokens
- **Component Variants**: Handles component variants, states (hover, focus, active), and nested elements
- **Context Provider**: New API endpoints for retrieving context information for better profile visualization
- **RESTful API**: Complete API for profile application, generation, and management
- **Component Templates**: Ready-to-use component templates for quick UI generation
- **Visual Frontend**: Interactive dashboard for design system generation and preview
- **Realtime Preview**: View components with applied styles in real-time
- **Full System Generation**: Generate complete design systems with a single request
- **Responsive Support**: Generated CSS includes responsive design patterns
- **Test Suite**: Comprehensive test coverage for all key functionality

## Project Structure

```
popmelt-mcp-server/
├── index.js                 # Server entry point
├── app.js                   # Express application configuration
├── package.json             # Project dependencies
├── /profiles                # JSON profile definitions
│   ├── neon-horizon.json
│   ├── ethereal-simplicity.json
│   └── brutal-pop.json
├── /generated-styles        # Generated CSS output files
│   └── [profile-name]-[component-name].css
├── /public                  # Frontend interface
│   ├── index.html           # Main dashboard
│   ├── /css                 # Frontend styling
│   │   └── styles.css
│   └── /js                  # Frontend logic
│       └── app.js
├── /routes                  # API route handlers
│   ├── applyTalent.js       # Profile application logic
│   ├── profileManagement.js # CRUD operations for profiles
│   ├── componentTemplates.js # Component template handlers
│   └── contextProvider.js   # Context information endpoints
└── /test                    # Test suite
    └── api.test.js          # API endpoint tests
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

For development with hot reloading:
```bash
npm run dev
```

The server will run on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Running Tests

To run the test suite:

```bash
npm test
```

The tests use Jest and supertest to verify API endpoints are functioning correctly.

## Visual Frontend

The Popmelt MCP Server includes a visual frontend dashboard that allows designers and developers to:

- Browse available design system profiles
- Generate CSS for specific components or entire design systems
- Preview components with the applied styles in real-time
- Copy generated CSS for use in projects
- View and edit profile JSON directly

### Using the Frontend

1. Start the server using `npm start`
2. Open your browser and navigate to `http://localhost:3000`
3. Select a profile from the dropdown menu
4. Choose a component to generate CSS for that specific component, or click "Generate Full System" for the entire design system
5. See live previews of the components with the applied styles
6. Copy the generated CSS using the "Copy CSS" button

## API Endpoints

### Component Generation

#### Apply Talent Profile

Applies a talent profile to a component and generates CSS.

**Endpoint:** `POST /api/apply-talent`

**Request Body:**
```json
{
  "profile": "neon-horizon",
  "component": ".card"
}
```

**Response:**
```json
{
  "success": true,
  "css": "/* Generated CSS with variables */",
  "filePath": "/generated-styles/neon-horizon-card.css"
}
```

#### Generate Full Design System

Generates CSS for all components in a profile as a complete design system.

**Endpoint:** `POST /api/generate-design-system`

**Request Body:**
```json
{
  "profile": "ethereal-simplicity"
}
```

**Response:**
```json
{
  "success": true,
  "css": "/* Complete design system CSS with all components */",
  "filePath": "/generated-styles/ethereal-simplicity-design-system.css"
}
```

#### Generate Component CSS

Generates CSS for a specific component from a profile.

**Endpoint:** `POST /api/generate-component`

**Request Body:**
```json
{
  "profile": "brutal-pop",
  "component": "button"
}
```

**Response:**
```json
{
  "success": true,
  "css": "/* Component-specific CSS with variables */",
  "filePath": "/generated-styles/brutal-pop-button.css"
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
      "name": "Neon Horizon",
      "author": "Digital Futurist",
      "slug": "neon-horizon",
      "description": "A bold, vibrant design system inspired by cyberpunk aesthetics with neon accents and dark backgrounds",
      "version": "1.0.0",
      "components": ["button", "card", "heading", "text", "input", "nav"]
    },
    {
      "name": "Ethereal Simplicity",
      "author": "Minimalist Designer",
      "slug": "ethereal-simplicity",
      "description": "A light, airy design system focusing on whitespace and subtle interactions",
      "version": "1.0.0",
      "components": ["button", "card", "heading", "text", "input", "form"]
    }
  ]
}
```

### Context Provider (New!)

#### Get Global Context

Returns global context information about the system.

**Endpoint:** `GET /api/context`

**Response:**
```json
{
  "success": true,
  "context": {
    "availableProfiles": ["neon-horizon", "ethereal-simplicity", "brutal-pop"],
    "availableComponents": ["button", "card", "input", "form", "nav", "heading", "text"],
    "serverVersion": "1.0.0"
  }
}
```

#### Get Profile Context

Returns detailed context information for a specific profile.

**Endpoint:** `GET /api/context/profile/:profile`

**Response:**
```json
{
  "success": true,
  "context": {
    "profile": {
      "name": "Neon Horizon",
      "author": "Digital Futurist",
      "slug": "neon-horizon",
      "description": "A bold, vibrant design system inspired by cyberpunk aesthetics",
      "components": ["button", "card", "heading", "nav"],
      "colorTokens": {
        "primary": "#ff00ff",
        "background": "#121212"
      },
      "spacingTokens": {
        "small": "0.5rem",
        "medium": "1rem"
      }
    }
  }
}
```

#### Get Component Preview

Returns preview HTML and CSS for a specific component with a profile applied.

**Endpoint:** `GET /api/context/preview/:profile/:component`

**Response:**
```json
{
  "success": true,
  "preview": {
    "html": "<button class=\"button button--primary\">Click Me</button>",
    "css": "/* Generated component CSS */",
    "component": "button",
    "profile": "neon-horizon"
  }
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
    "slug": "profile-name",
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
  "slug": "my-design-system",
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

Popmelt MCP Server uses structured JSON profiles to define design systems. Each profile includes:

### Basic Metadata
- `name`: The name of the design system
- `author`: The creator of the design system
- `slug`: URL-friendly identifier for the profile
- `description`: Description of the design system
- `version`: Semantic version number

### Design Tokens
- `colors`: Color palette including primary, secondary, accent, background, and text colors
- `spacing`: Spacing scale for margins, padding, and layout
- `typography`: Font families, sizes, weights, and line heights
- `borders`: Border widths, styles, and radii
- `animations`: Durations, easings, and delay values

### Component Definitions
Each component includes:
- Base styles
- Variants (primary, secondary, tertiary)
- States (hover, focus, active, disabled)
- Nested elements (icon, label, container)
- Responsive breakpoints

See the example profiles in the `/profiles` directory for the complete structure.

## CSS Variable Generation

The server automatically converts design tokens into CSS variables, making them easily reusable throughout the design system. For example:

```css
:root {
  --color-background: #ffffff;
  --color-text-primary: #1a1a1a;
  --color-accent: #3d7aff;
  --spacing-small: 0.5rem;
  --spacing-medium: 1rem;
  --font-family: 'Inter', sans-serif;
  --font-size-medium: 1rem;
  --font-weight-medium: 500;
  --border-radius-medium: 0.5rem;
  --duration-fast: 150ms;
  --easing-ease-out: ease-out;
}
```

## Technologies Used

- **Node.js**: JavaScript runtime
- **Express.js**: Web server framework
- **fs-extra**: Enhanced file system operations
- **body-parser**: Request parsing middleware
- **cors**: Cross-origin resource sharing
- **Jest & Supertest**: Testing framework
- **HTML/CSS/JavaScript**: Frontend technologies

## Health Check

A health check endpoint is available at `/api/health` to verify the server is running correctly.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT 