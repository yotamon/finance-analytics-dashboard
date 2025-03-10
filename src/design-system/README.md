# Finance Analyzer Design System

A comprehensive, flexible, and theme-aware design system for the Finance Analyzer application that provides consistent UI components with support for light and dark themes.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Theme Provider](#theme-provider)
4. [Design Tokens](#design-tokens)
5. [Components](#components)
6. [Utilities](#utilities)
7. [Usage Examples](#usage-examples)
8. [Best Practices](#best-practices)

## Overview

The Finance Analyzer Design System is built to provide:

- **Consistency**: Uniform styles and behaviors across the application
- **Flexibility**: Easily customizable components to suit different use cases
- **Accessibility**: Components designed with accessibility in mind
- **Theme Support**: Built-in light and dark theme modes
- **Developer Experience**: Simple API and comprehensive documentation

## Installation

The design system is built into the Finance Analyzer application. To use it in your components, simply import the components and utilities as needed:

```jsx
import { Button, Card, Text, useTheme } from "../design-system";
```

## Theme Provider

The `ThemeProvider` component is the foundation of the design system's theme functionality. It manages theme state and provides theme variables to your components.

### Setup

The `ThemeProvider` should wrap your application at a high level to provide theme context to all components:

```jsx
import { ThemeProvider } from "../design-system";

function App() {
	return <ThemeProvider defaultTheme="light">{/* Your application components */}</ThemeProvider>;
}
```

### Usage

Use the `useTheme` hook to access theme information and functions:

```jsx
import { useTheme } from "../design-system";

function MyComponent() {
	const { isDark, toggleTheme, setTheme } = useTheme();

	return (
		<div>
			<p>Current theme: {isDark ? "Dark" : "Light"}</p>
			<button onClick={toggleTheme}>Toggle Theme</button>
			<button onClick={() => setTheme("light")}>Set Light</button>
			<button onClick={() => setTheme("dark")}>Set Dark</button>
		</div>
	);
}
```

## Design Tokens

Design tokens are the foundational values used throughout the design system. They include:

- **Color Palettes**: Predefined color scales for primary, neutral, success, warning, error, and info
- **Typography**: Font families, weights, sizes, line heights, and letter spacing
- **Spacing**: Standard spacing values for margin, padding, etc.
- **Border Radius**: Rounded corner values
- **Shadows**: Box shadow definitions
- **Transitions**: Duration and timing functions
- **Z-Index**: Standard z-index values
- **Breakpoints**: Screen size breakpoints for responsive design

### Accessing Tokens

You can import tokens directly:

```jsx
import { tokens, colorPalettes, typography } from "../design-system";

function MyComponent() {
	return (
		<div
			style={{
				color: colorPalettes.primary[500],
				fontSize: typography.fontSize.lg,
				padding: tokens.spacing[4]
			}}>
			Hello world
		</div>
	);
}
```

## Components

The design system includes several core components:

### Box

`Box` is the foundational component that all other components build upon. It provides a consistent way to apply styles and properties.

```jsx
import { Box } from "../design-system";

<Box m="1rem" p="2rem" bg="var(--color-bg-primary)" border="1px solid var(--color-border-default)" borderRadius="var(--border-radius-md)">
	Content goes here
</Box>;
```

### Button

`Button` provides accessible, styled button components with various appearances and states.

```jsx
import { Button } from "../design-system";

<Button variant="primary" size="md" onClick={handleClick} isLoading={isLoading} leftIcon={<IconComponent />}>
	Click Me
</Button>;
```

Button variants include: `primary`, `secondary`, `tertiary`, `success`, `danger`, and `ghost`.
Sizes include: `xs`, `sm`, `md`, `lg`, and `xl`.

### Card

`Card` creates container elements with consistent styling and optional sections.

```jsx
import { Card, CardHeader, CardBody, CardFooter } from "../design-system";

<Card variant="default" shadow="md" bordered isHoverable>
	<CardHeader>Card Title</CardHeader>
	<CardBody>Main content goes here</CardBody>
	<CardFooter>Footer content</CardFooter>
</Card>;
```

Card variants include: `default`, `outline`, `filled`, and `elevated`.

### Text

`Text` handles typography with consistent styling based on the current theme.

```jsx
import { Text } from "../design-system";

<Text variant="h1" color="var(--color-primary-600)" align="center" truncate>
	Heading Text
</Text>;
```

Text variants include: `h1` through `h6`, `subtitle1`, `subtitle2`, `body1`, `body2`, `caption`, `overline`, and `label`.

## Utilities

The design system includes utility functions:

- `hexToRgb`: Convert hex color to RGB format
- `rgbToHex`: Convert RGB to hex format
- `adjustBrightness`: Adjust color brightness
- `getCssVariable`: Get the value of a CSS variable
- `getThemeColor`: Get a theme color with fallback

```jsx
import { hexToRgb, adjustBrightness } from "../design-system";

const rgbColor = hexToRgb("#3b82f6"); // "59 130 246"
const brighterColor = adjustBrightness("#3b82f6", 20); // Brighten by 20%
```

## Usage Examples

### Creating a themed component

```jsx
import { Box, Text, Card, CardBody, useTheme } from "../design-system";

function StatsCard({ title, value, icon }) {
	const { isDark } = useTheme();

	return (
		<Card variant={isDark ? "filled" : "default"} shadow="md" isHoverable>
			<CardBody>
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<div>
						<Text variant="overline" color="var(--color-text-tertiary)">
							{title}
						</Text>
						<Text variant="h3" mt="0.5rem">
							{value}
						</Text>
					</div>
					<Box p="1rem" borderRadius="var(--border-radius-full)" bg="var(--color-primary-100)" color="var(--color-primary-700)">
						{icon}
					</Box>
				</Box>
			</CardBody>
		</Card>
	);
}
```

### Creating a button group

```jsx
import { Box, Button } from "../design-system";

function ButtonGroup({ options, selectedValue, onChange }) {
	return (
		<Box display="flex" gap="0.5rem">
			{options.map(option => (
				<Button key={option.value} variant={selectedValue === option.value ? "primary" : "secondary"} onClick={() => onChange(option.value)}>
					{option.label}
				</Button>
			))}
		</Box>
	);
}
```

## Best Practices

1. **Use Design System Components**: Prefer design system components over custom HTML elements to maintain consistency.

2. **Theme Awareness**: Always use the `useTheme` hook when you need to adjust styles based on the current theme.

3. **CSS Variables**: Use CSS variables (e.g., `var(--color-primary-500)`) for colors and other theme-specific values.

4. **Responsive Design**: Utilize the breakpoint tokens for responsive layouts.

5. **Semantic Colors**: Use semantic color variables (e.g., `--color-error-500`) instead of literal color values.

6. **Component Composition**: Build complex UIs by composing simple components rather than creating monolithic components.

7. **Consistent Spacing**: Use the spacing tokens for consistent padding and margins throughout the application.

8. **A11y Considerations**: Ensure components meet accessibility standards (contrast, keyboard navigation, ARIA attributes).

9. **Performance**: Avoid unnecessary re-renders by memoizing components when appropriate.

10. **Documentation**: Document custom components that build on the design system for other developers.
