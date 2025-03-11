// ChartTheme.tsx - Common styling for all charts in the application
import React from "react";
import {
  ChartThemeType,
  ChartType,
  ChartColorPalette,
  ChartFontSettings,
  ChartSettings,
  ChartGridSettings,
  ChartAxisSettings,
  ChartTooltipSettings,
  ChartLegendSettings,
  ChartResponsiveContainerSettings,
  ChartDotSettings,
  ChartBarSettings,
  ChartLineSettings,
  ChartPieSettings,
} from "../../types/chart-theme-types";

export const ChartTheme: ChartThemeType = {
  // Modern color palette
  colors: {
    primary: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"],
    secondary: ["#8b5cf6", "#a78bfa", "#c4b5fd"],
    success: ["#10b981", "#34d399", "#6ee7b7"],
    warning: ["#f59e0b", "#fbbf24", "#fcd34d"],
    accent: ["#ec4899", "#f472b6", "#f9a8d4"],
    neutral: ["#6b7280", "#9ca3af", "#d1d5db"],
    categorical: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#6b7280"],
    sequential: ["#dbeafe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8"],
    diverging: ["#ef4444", "#f59e0b", "#f3f4f6", "#3b82f6", "#1d4ed8"],
  },

  // Fonts and text styling
  fonts: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 12,
    labelFontSize: 14,
    titleFontSize: 16,
  },

  // Common chart styling
  chart: {
    backgroundColor: "transparent",
    margin: { top: 40, right: 40, left: 25, bottom: 50 },
    animate: true,
    animationDuration: 800,
    animationEasing: "ease-out",
  },

  // Grid styling
  grid: {
    stroke: "rgba(0, 0, 0, 0.08)",
    strokeDasharray: "3 3",
    vertical: false,
    horizontal: true,
  },

  // Axis styling
  axis: {
    stroke: "#888",
    tickStroke: "#888",
    tickSize: 5,
  },

  // Tooltip styling
  tooltip: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 8,
    boxShadow: "0 2px 15px rgba(0, 0, 0, 0.1)",
    padding: 12,
    border: "1px solid #eee",
  },

  // Legend styling
  legend: {
    position: "top",
    wrapperStyle: {
      paddingTop: 10,
      marginBottom: 10,
      borderTop: "1px solid #eee",
      textAlign: "center",
    },
  },

  // Responsive container
  responsiveContainer: {
    aspect: 2.5, // Wider aspect ratio
    minHeight: 400,
  },

  // Custom dot for line/area charts
  activeDot: {
    r: 6,
    strokeWidth: 2,
    fill: "#fff",
    stroke: "#3b82f6",
  },

  // Bar chart styling
  bar: {
    radius: [4, 4, 0, 0],
    barSize: 40,
    minBarSize: 20,
    barGap: 8,
  },

  // Line styling
  line: {
    strokeWidth: 2.5,
    activeDotRadius: 6,
    dot: {
      r: 4,
      strokeWidth: 2,
      fill: "#fff",
      stroke: "#3b82f6",
    },
  },

  // Pie chart styling
  pie: {
    innerRadius: 0,
    outerRadius: 100,
    paddingAngle: 1,
    labelOffset: 10,
  },
};

// Helper function to get color arrays based on chart type
export const getChartColors = (type: ChartType, count: number = 1): string | string[] => {
  switch (type) {
    case "bar":
    case "area":
      return count === 1 ? ChartTheme.colors.primary[0] : ChartTheme.colors.primary.slice(0, count);
    case "line":
      return count === 1
        ? ChartTheme.colors.secondary[0]
        : ChartTheme.colors.secondary.slice(0, count);
    case "pie":
    case "donut":
      return [
        ...ChartTheme.colors.primary,
        ...ChartTheme.colors.secondary,
        ...ChartTheme.colors.success,
      ].slice(0, count);
    case "success":
      return count === 1 ? ChartTheme.colors.success[0] : ChartTheme.colors.success.slice(0, count);
    case "warning":
      return count === 1 ? ChartTheme.colors.warning[0] : ChartTheme.colors.warning.slice(0, count);
    default:
      return count === 1
        ? ChartTheme.colors.primary[0]
        : [...ChartTheme.colors.primary, ...ChartTheme.colors.secondary].slice(0, count);
  }
};

// Helper to create gradient for area charts - avoiding direct JSX
export const createGradient = (
  id: string,
  color: string,
  opacity: number = 0.2
): React.ReactElement => {
  // Return a function that creates the gradient instead of JSX directly
  return React.createElement("linearGradient", { id, x1: "0", y1: "0", x2: "0", y2: "1" }, [
    React.createElement("stop", { key: "stop1", offset: "5%", stopColor: color, stopOpacity: 0.8 }),
    React.createElement("stop", {
      key: "stop2",
      offset: "95%",
      stopColor: color,
      stopOpacity: opacity,
    }),
  ]);
};

// Generate dashed patterns for chart elements
export const getDashPattern = (index: number): string => {
  const patterns = ["3 3", "5 5", "8 3", "3 6 3", "8 3 2 3"];
  return patterns[index % patterns.length];
};

export default ChartTheme;
