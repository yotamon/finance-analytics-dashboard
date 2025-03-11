# Finance Analyzer Project Guidelines

This document outlines the development guidelines and technology decisions for the Finance Analyzer project.

## Technology Stack

### Frontend

- **Framework**: React 18.x with Vite
- **UI Library**: Material UI (MUI) 6.x and custom components
- **Styling**: TailwindCSS for utility classes + MUI components
- **State Management**: React Context API for global state
- **Routing**: React Router v6
- **Data Visualization**:
  - Recharts for standard charts
  - D3.js for advanced custom visualizations
  - MUI X-Charts for Material UI-styled charts
  - Leaflet with React-Leaflet for map visualizations
- **File Processing**:
  - PapaParse for CSV files
  - XLSX for Excel files
- **Animation**: Framer Motion
- **PDF Export**: html2canvas + jspdf

## TypeScript Standards

- **Use TypeScript for all files**: All components, utilities, and hooks must be written in TypeScript
- **File Extensions**:
  - React components: `.tsx`
  - Non-React modules: `.ts`
  - Type definition files: `.d.ts`
- **Type Safety Levels**:
  - Use `strict: true` in tsconfig.json
  - Avoid using `any` and `unknown` types except in specific parsing functions
  - Use generics for reusable components
- **Type Organization**:
  - Use separate files for related type groups (e.g., `financial.ts`, `chart-types.ts`)
  - Prefer interfaces for object shapes and component props
  - Use type aliases for unions, intersections, and complex types
- **Migration Strategy**:
  - Prioritize shared components and utilities
  - Add types incrementally to large files
  - Use TypeScript's inference where appropriate

### Development Tools

- **Code Formatting**: Prettier
- **Linting**: ESLint with React plugin
- **IDE**: Cursor with project-specific configurations

## Code Organization

### Directory Structure

```
src/
├── components/         # Reusable components
│   ├── charts/         # Chart components
│   ├── dashboard/      # Dashboard specific components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── ui/             # General UI components
│   └── upload/         # File upload components
├── context/            # React Context providers
├── design-system/      # Design system components and documentation
├── hooks/              # Custom React hooks
├── locales/            # Internationalization resources
├── pages/              # Route-based page components
├── services/           # API and data services
├── theme/              # Theme configuration
└── utils/              # Utility functions
```

## Naming Conventions

- **Files**: Use kebab-case for file names (e.g., `financial-chart.jsx`)
- **Components**: Use PascalCase for component names (e.g., `FinancialChart`)
- **Hooks**: Use camelCase with "use" prefix (e.g., `useFinancialData`)
- **Context**: Use PascalCase with "Context" suffix (e.g., `ThemeContext`)
- **Functions**: Use camelCase (e.g., `calculateTotal`)

## Component Structure

### Functional Components

```jsx
// Import order: React, external libraries, components, hooks, utils, styles
import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@mui/material";

import { useData } from "../hooks/useData";
import { formatCurrency } from "../utils/formatters";

const ComponentName = ({ prop1, prop2 }) => {
  // Component logic

  return <div>{/* Component JSX */}</div>;
};

ComponentName.propTypes = {
  prop1: PropTypes.string.required,
  prop2: PropTypes.number,
};

ComponentName.defaultProps = {
  prop2: 0,
};

export default ComponentName;
```

## Git Workflow

- Use feature branches for new features
- Name branches with prefix: `feature/`, `bugfix/`, `hotfix/`, etc.
- Commit messages should follow the format: `type: description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

## Performance Considerations

- Use React.memo for expensive components that render frequently
- Implement virtualization for long lists using react-window or similar
- Optimize chart re-renders by using memoization and controlling re-renders
- Lazy load components and routes that aren't immediately needed

## Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Ensure appropriate color contrast (WCAG AA compliance)
- Provide alternative text for images and charts
- Test with screen readers regularly

## Browser Support

- Support the latest two versions of major browsers:
  - Chrome
  - Firefox
  - Safari
  - Edge

## Data Flow

1. User uploads financial data files
2. Files are processed client-side (no server upload)
3. Data is stored in Context API
4. Components consume data through context or props
5. Visualizations and analytics are calculated and rendered
6. Users can interact with and export data/reports

## Adding New Features

When adding new features:

1. Discuss with the team first
2. Create a new branch
3. Follow the project structure and naming conventions
4. Write clean, documented, and testable code
5. Submit a pull request for review
