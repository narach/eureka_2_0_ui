# Eureka - Life Science Research App

A web-based application for Life Science research hypothesis construction and article search.

## Features

- **Hypothesis Graph Constructor**: Interactive drag-and-drop interface for creating hypothesis graphs with entities (Diseases, Targets, Drugs) and connections
- **Research Panel**: Hypothesis editor with filters for status, relevancy threshold, citations, and search options
- **Search Results**: Display of research articles with detailed metadata including relevancy scores, citations, and favorites

## Tech Stack

- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Node.js/NPM** for package management

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── HypothesisGraph.tsx    # Graph constructor with draggable entities
│   ├── ResearchPanel.tsx      # Hypothesis editor and filters
│   ├── SearchResults.tsx      # Article list container
│   └── ArticleCard.tsx        # Individual article card component
├── types.ts                   # TypeScript type definitions
├── mockData.ts               # Mock data for development
├── App.tsx                   # Main application component
├── main.tsx                  # Application entry point
└── index.css                 # Global styles with Tailwind
```

## Application Layout

The application is divided into three main sections:

1. **Hypothesis Graph Constructor (45% width)**
   - Drag-and-drop cards for entities
   - Color-coded: Diseases (Orange), Targets (Light Green), Drugs (Blue)
   - Arrows showing connections between entities

2. **Research Panel (25% width)**
   - Hypothesis selection with dropdowns
   - Editable hypothesis text area
   - Filter controls (Status, Relevancy, Citations, etc.)

3. **Search Results (30% width)**
   - Article list with favorites filter
   - Article cards with publication details, relevancy scores, and metadata

## Development

### Linting

```bash
npm run lint
```

## License

This project is for development purposes.

