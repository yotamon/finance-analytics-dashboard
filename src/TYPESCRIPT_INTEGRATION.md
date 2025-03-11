# TypeScript Integration Strategy

## Overview

This document outlines the strategy for integrating TypeScript into the financial dashboard project, focusing on maintaining consistency across components and establishing proper type definitions for financial data structures.

## Financial Data Types

### Core Financial Types

```typescript
// Basic financial data types
interface FinancialData {
  // Time-based identifiers
  date: string | Date;
  year: number;
  quarter?: number;
  month?: number;

  // Financial metrics
  revenue: number;
  expenses: number;
  profit: number;
  ebitda?: number;
  ebitdaMargin?: number;

  // Additional metrics
  growth?: number;
  forecastAccuracy?: number;

  // Metadata
  category?: string;
  region?: string;
  currency?: string;
}

// Project-specific data
interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  country?: string;
  value: number;
  status: "active" | "pending" | "completed" | "on hold";
  startDate: string | Date;
  endDate?: string | Date;
  completion: number;
  riskLevel: "low" | "medium" | "high";
  manager: string;
  portfolioId?: string;
  budget?: number;
  actualCost?: number;
  variance?: number;
  roi?: number;
  kpis?: Record<string, number>;
}

// Country/geographical data
interface CountryData {
  id: string;
  name: string;
  code: string;
  region: string;
  subregion?: string;
  metrics: {
    revenue?: number;
    profit?: number;
    growth?: number;
    projectCount?: number;
    investmentAmount?: number;
    riskScore?: number;
  };
  coordinates?: [number, number]; // [latitude, longitude]
}
```

### Chart Data Types

```typescript
// Generic chart data point
interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  [key: string]: any;
}

// Time series data
interface TimeSeriesData {
  date: string | Date;
  [metric: string]: number | string | Date;
}

// Bar chart data
interface BarChartData {
  categories: string[];
  series: {
    name: string;
    data: number[];
    color?: string;
  }[];
}

// Pie chart data
interface PieChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}
```

## Component Props Strategy

For all components, follow these guidelines when defining props interfaces:

1. **Use explicit typing** for all props
2. **Mark optional props** with `?` suffix
3. **Use union types** for props with multiple acceptable values
4. **Document complex props** with JSDoc comments
5. **Create prop interfaces** for reusable components

Example:

```typescript
/**
 * Props for the FinancialChart component
 * @property {TimeSeriesData[]} data - The time series data to display
 * @property {string} title - The chart title
 * @property {string[]} [metrics] - List of metrics to display, defaults to all metrics
 * @property {boolean} [showLegend=true] - Whether to show the legend
 * @property {(point: TimeSeriesData) => void} [onPointClick] - Callback when a data point is clicked
 */
interface FinancialChartProps {
  data: TimeSeriesData[];
  title: string;
  metrics?: string[];
  showLegend?: boolean;
  onPointClick?: (point: TimeSeriesData) => void;
  height?: number | string;
  width?: number | string;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
}
```

## State Management Types

For application state, create proper TypeScript interfaces for all contexts and reducers:

```typescript
// App state
interface AppState {
  theme: "light" | "dark" | "system";
  language: string;
  sidebarOpen: boolean;
  notifications: Notification[];
}

// Dashboard state
interface DashboardState {
  layouts: Layouts;
  activeCharts: string[];
  filters: FilterValues;
  timeRange: {
    start: Date;
    end: Date;
  };
  comparison: {
    enabled: boolean;
    start: Date;
    end: Date;
  };
}
```

## Integration Action Plan

1. **Define core data types** first (financial data, projects, geography)
2. **Update context providers** to use TypeScript interfaces
3. **Migrate UI components** in a bottom-up approach
   - Start with simple, independent components
   - Move to container components
   - Finally migrate page-level components
4. **Update utility functions** with TypeScript
5. **Create API/service layer types** for external data

## Utilities for Type Conversion

For handling data from external sources:

```typescript
/**
 * Convert raw API data to typed FinancialData objects
 */
function parseFinancialData(rawData: any[]): FinancialData[] {
  return rawData.map((item) => ({
    date: new Date(item.date),
    year: parseInt(item.year),
    quarter: item.quarter ? parseInt(item.quarter) : undefined,
    month: item.month ? parseInt(item.month) : undefined,
    revenue: parseFloat(item.revenue),
    expenses: parseFloat(item.expenses),
    profit: parseFloat(item.profit),
    ebitda: item.ebitda ? parseFloat(item.ebitda) : undefined,
    ebitdaMargin: item.ebitdaMargin ? parseFloat(item.ebitdaMargin) : undefined,
    growth: item.growth ? parseFloat(item.growth) : undefined,
    forecastAccuracy: item.forecastAccuracy ? parseFloat(item.forecastAccuracy) : undefined,
    category: item.category,
    region: item.region,
    currency: item.currency,
  }));
}
```

## Testing with TypeScript

- Use proper typing in test files
- Create mock data factories that return properly typed test data
- Use type assertions to verify data structures

```typescript
// Example test data factory
function createMockFinancialData(overrides?: Partial<FinancialData>): FinancialData {
  return {
    date: new Date("2023-01-01"),
    year: 2023,
    revenue: 1000000,
    expenses: 700000,
    profit: 300000,
    ...overrides,
  };
}
```
