# Popmelt MCP Server

A Model-Controlled Programming (MCP) server for Popmelt, a platform that generates dynamic design systems and UI components based on structured Taste Profiles defined in JSON metadata files.

## Features

- Dynamically reads `.cursorrules` JSON files from a `/profiles` directory
- Generates CSS style outputs based on weighted attributes within profiles
- Returns generated CSS to the requester as a downloadable file or JSON response
- Provides API endpoints for applying talent profiles and fetching available profiles

## Project Structure

```
popmelt-mcp-server/
├── index.js (entry point)
├── package.json
├── /profiles
│   └── luminous-minimalism.json
├── /generated-styles
│   └── [profile-name]-[component-name].css
└── routes/
    └── applyTalent.js
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

## API Endpoints

### Apply Talent Profile

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
  "css": ".card {\n  background-color: #ffffff;\n  padding: 24px;\n  border-radius: 8px;\n  color: #1a1a1a;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);\n}\n",
  "filePath": "/generated-styles/olivia-gray-card.css"
}
```

### Get Available Profiles

Returns a list of all available talent profiles.

**Endpoint:** `GET /api/profiles`

**Response:**
```json
{
  "profiles": [
    {
      "name": "Luminous Minimalism",
      "author": "Olivia Gray",
      "slug": "olivia-gray",
      "description": "A clean, bright design system that emphasizes whitespace and subtle interactions"
    }
  ]
}
```

## Adding New Profiles

To add a new profile, create a JSON file in the `/profiles` directory with the following structure:

```json
{
  "name": "Profile Name",
  "author": "Author Name",
  "slug": "author-name",
  "description": "Description of the profile",
  "version": "1.0.0",
  "attributes": {
    "colors": {
      "background": {
        "value": "#ffffff",
        "weight": 0.9
      }
    }
  },
  "components": {
    "card": {
      "background": "colors.background",
      "padding": "spacing.large"
    }
  }
}
```

## License

MIT 