# TypeScript Coding Standards

This document outlines the coding standards and best practices for TypeScript development in the Finance Analyzer project. These standards ensure consistency, maintainability, and type safety across the codebase.

## General TypeScript Guidelines

### Type Annotations

- Use explicit type annotations for function parameters and return types.
- Use type inference for local variables when the type is obvious.
- Avoid using `any` and `unknown` types except where absolutely necessary.
- Use more specific types instead of generic ones (e.g., `string[]` instead of `Array<string>`).

```typescript
// ✅ Good
function calculateTotal(prices: number[]): number {
  return prices.reduce((total, price) => total + price, 0);
}

// ❌ Avoid
function calculateTotal(prices): any {
  return prices.reduce((total, price) => total + price, 0);
}
```

### Interfaces and Types

- Use `interface` for object shapes that may be implemented or extended.
- Use `type` for unions, intersections, and simple type aliases.
- Use descriptive names that reflect the purpose of the type.
- Add JSDoc comments for complex types to explain their purpose.

```typescript
// Object shapes using interfaces
interface ChartConfig {
  width: number;
  height: number;
  margin?: Margin;
  showLegend: boolean;
}

// Union types using type
type ChartType = "bar" | "line" | "pie" | "scatter";
```

### Null and Undefined Handling

- Use optional chaining (`?.`) and nullish coalescing (`??`) operators.
- Be explicit about which parameters can be nullable by using union types with `null` or `undefined`.
- Use non-null assertion operator (`!`) sparingly and only when you're certain a value cannot be null.

```typescript
// Optional parameter
function formatCurrency(value: number, currency?: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
  }).format(value);
}
```

### Type Assertions

- Use `as` syntax for type assertions rather than angle brackets (`<>`).
- Minimize the use of type assertions and prefer type guards.
- Create custom type guards when working with complex types.

```typescript
// Type guard example
function isBarChartData(data: unknown): data is BarChartData {
  return data !== null && typeof data === "object" && "category" in data && "value" in data;
}
```

## React TypeScript Patterns

### Component Props

- Define an interface for component props named `{ComponentName}Props`.
- Use React's built-in types for event handlers.
- Make props optional when they have default values.
- Document complex props with JSDoc comments.

```typescript
interface DataTableProps {
  /** Array of data items to display in the table */
  data: Array<Record<string, unknown>>;
  /** Columns configuration defining the display properties */
  columns: TableColumn[];
  /** Whether the table is in a loading state */
  isLoading?: boolean;
  /** Callback when a row is selected */
  onRowSelect?: (row: Record<string, unknown>) => void;
}

function DataTable({ data, columns, isLoading = false, onRowSelect }: DataTableProps): JSX.Element {
  // Component implementation
}
```

### Event Handling

- Use the proper React event types for event handlers.
- Explicitly type the event parameter in event handlers.

```typescript
// Event handler with proper typing
const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  setValue(event.target.value);
};
```

### React Hooks

- Type state properly in `useState` hooks.
- Type dependencies explicitly in hooks like `useEffect`, `useMemo`, and `useCallback`.
- Create custom hooks with descriptive names and return interfaces.

```typescript
// Using useState with proper typing
const [value, setValue] = useState<string>("");

// Custom hook with typed return value
interface UseChartDataResult {
  data: ChartData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useChartData(chartId: string): UseChartDataResult {
  // Hook implementation
}
```

## File Organization

### File Structure

- Keep related types in the same file as their implementation or in a dedicated types file.
- For larger components, separate types into a `{component-name}.types.ts` file.
- Group related types together in domain-specific type files.

### Import Order

1. External libraries
2. React and React-related imports
3. Local components and hooks
4. Utility functions
5. Types and interfaces
6. Styles and assets

```typescript
// External libraries
import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

// Local components/hooks
import { useCurrency } from "@/context/CurrencyContext";
import DataTable from "@/components/DataTable";

// Utilities
import { formatNumber } from "@/utils/formatters";

// Types
import { ChartData, ChartOptions } from "@/types/chart-types";

// Styles
import "@/styles/Chart.css";
```

## Type Safety Best Practices

### Generics

- Use generics to create reusable components and functions.
- Provide meaningful names for generic type parameters.
- Add constraints to generic types when appropriate.

```typescript
// Generic component example
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T extends { id: string }>({ items, renderItem }: ListProps<T>): JSX.Element {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

### Discriminated Unions

- Use discriminated unions for state management.
- Add a literal `type` property to each variant of the union.

```typescript
// Discriminated union for API state
type ApiState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

### Type Utilities

- Leverage TypeScript utility types (`Partial`, `Required`, `Pick`, `Omit`, etc.).
- Create custom mapped types for common patterns.

```typescript
// Using utility types
type ChartConfigWithDefaults = Required<ChartConfig>;
type ChartDisplayOptions = Pick<ChartConfig, "showLegend" | "showTooltip">;

// Custom mapped type
type Nullable<T> = { [P in keyof T]: T[P] | null };
```

## Strict Mode Configuration

- Enable strict mode in tsconfig.json.
- Enable all recommended strict checks.

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true
  }
}
```

## Testing TypeScript Code

- Type test fixtures and mock data.
- Use type-aware testing utilities.
- Test type guards explicitly.

```typescript
// Typed test fixture
const testChartData: ChartData[] = [
  { category: "A", value: 10 },
  { category: "B", value: 20 },
];

// Testing a type guard
test("isBarChartData correctly identifies bar chart data", () => {
  expect(isBarChartData({ category: "A", value: 10 })).toBe(true);
  expect(isBarChartData({ x: 10, y: 20 })).toBe(false);
});
```

## Performance Considerations

- Use the `as const` assertion for read-only data.
- Avoid unnecessary type computations in hot code paths.
- Use `React.memo` with correct typing for expensive components.

```typescript
// Using as const for read-only data
const CHART_TYPES = ["bar", "line", "pie", "scatter"] as const;
type ChartType = (typeof CHART_TYPES)[number];

// Memoized component with proper typing
const MemoizedChart = React.memo<ChartProps>(
  (props) => <Chart {...props} />,
  (prevProps, nextProps) => prevProps.data === nextProps.data
);
```

## Documentation

- Add JSDoc comments for public APIs, interfaces, and complex functions.
- Document non-obvious type constraints and assumptions.
- Include examples in documentation for complex generic types.

```typescript
/**
 * Formats a numerical value according to the specified currency and format options.
 *
 * @param value - The numerical value to format
 * @param currency - The currency code (ISO 4217)
 * @param options - Additional formatting options
 * @returns A formatted currency string
 *
 * @example
 * formatCurrency(1234.56, 'USD') // '$1,234.56'
 * formatCurrency(1234.56, 'EUR', { useGrouping: false }) // '€1234.56'
 */
function formatCurrency(
  value: number,
  currency: CurrencyCode,
  options?: CurrencyFormatOptions
): string {
  // Implementation
}
```

By following these standards, we ensure our TypeScript code is consistent, maintainable, and leverages the full power of TypeScript's type system to prevent bugs and improve developer experience.
