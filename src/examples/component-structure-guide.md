# Component Structure Guide

This document outlines the recommended structure and organization for components in the Financial Dashboard project.

## Component Organization

### Directory Structure

Components should be organized in directories according to their purpose:

```
src/components/
├── charts/         # Chart and visualization components
├── dashboard/      # Dashboard-specific components
├── forms/          # Form inputs and controls
├── layout/         # Layout components (Header, Sidebar, etc.)
├── tables/         # Table components for data display
└── ui/             # General UI components (buttons, cards, etc.)
```

### File Structure

For each component, follow this file organization:

```
components/category/
├── component-name.tsx          # Main component file
├── component-name.styled.tsx   # Styled components (if applicable)
├── component-name.utils.ts     # Helper functions used by the component
├── component-name.types.ts     # Type definitions (if many)
├── component-name.test.tsx     # Component tests
└── index.ts                    # Export file
```

## Component File Structure

Each component file should follow this structure:

1. **Imports**

   - React and React hooks
   - External libraries and components
   - Internal components
   - Hooks and utilities
   - Types and interfaces
   - Styled components

2. **Type Definitions**

   - Define component props interface
   - Define any component-specific types

3. **Helper Functions and Constants**

   - Define any component-specific utilities
   - Define constants used by the component

4. **Component Definition**

   - Functional component with type annotation
   - Props destructuring with defaults
   - Hooks and state definitions
   - Effect hooks
   - Event handlers
   - Render methods

5. **Export Statement**
   - Default export for the component

## TypeScript Best Practices

### Props Definition

```tsx
interface MyComponentProps {
  // Required props
  data: DataItem[];
  title: string;

  // Optional props with default values
  isLoading?: boolean;
  onSelect?: (item: DataItem) => void;

  // Pass-through props
  className?: string;
  style?: React.CSSProperties;
}
```

### Component Definition

```tsx
const MyComponent: React.FC<MyComponentProps> = ({
  data,
  title,
  isLoading = false,
  onSelect,
  className,
  style,
}) => {
  // Component implementation
};
```

### Generic Components

For reusable components that can work with different data types:

```tsx
interface DataDisplayProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
}

function DataDisplay<T>({ items, renderItem, keyExtractor }: DataDisplayProps<T>) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}
```

## Component Examples

### Basic UI Component

```tsx
import React from "react";
import { CommonComponentProps } from "@/types/ui-types";

interface ButtonProps extends CommonComponentProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "text";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  className,
  style,
  id,
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className || ""}`}
      style={style}
      onClick={handleClick}
      disabled={disabled}
      id={id}
    >
      {label}
    </button>
  );
};

export default Button;
```

### Data Visualization Component

```tsx
import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardContent } from "@mui/material";
import { ChartDataPoint, ChartOptions } from "@/types/chart-types";

interface BarChartProps extends ChartOptions {
  data: ChartDataPoint[];
  dataKey: string;
  barColor?: string;
}

const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  dataKey,
  title,
  subtitle,
  height = 400,
  barColor = "#4CAF50",
  isLoading = false,
}) => {
  const processedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      // Any data transformation here
    }));
  }, [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent>
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer>
            <BarChart data={processedData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataKey} fill={barColor} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarChartComponent;
```

## Performance Optimization

### Memoization

Use React's memoization APIs to prevent unnecessary re-renders:

```tsx
// Memoize expensive calculations
const processedData = useMemo(() => {
  return someExpensiveOperation(data);
}, [data]);

// Memoize callback functions
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// Memoize components
export default memo(MyComponent);
```

### Optimizing Renders

- Only include in the dependency array what's actually needed
- Use functional updates for setState when the new state depends on the previous state
- Extract rapidly changing parts of the UI into separate components

## Accessibility

Every component should follow these accessibility guidelines:

- Use semantic HTML elements
- Provide alternative text for images
- Ensure proper keyboard navigation
- Use ARIA attributes when necessary
- Maintain sufficient color contrast
- Test with screen readers

## Error Handling

Components should handle errors gracefully:

- Provide user-friendly error messages
- Use fallback UI when data is missing
- Implement error boundaries around complex components
- Log errors for debugging

## Testing

Component tests should cover:

- Rendering with different props
- User interactions
- Edge cases (empty data, error states)
- Accessibility

## Documentation

Each component should include:

- JSDoc comments for the component and its props
- Usage examples
- Edge cases and limitations
- Performance considerations
