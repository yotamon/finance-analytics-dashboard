/**
 * Type definitions for MUI X Charts components.
 * This file extends the existing types to fix common type errors.
 */

declare module "@mui/x-charts/BarChart" {
  import { ReactNode } from "react";

  // Add missing opacity property to BarSeriesType
  interface BarSeriesType {
    opacity?: number;
  }

  // Define FadeOptions for highlightScope
  interface FadeOptions {
    color?: string;
    opacity?: number;
  }

  // Add renderer option to ChartsTooltipProps
  interface ChartsTooltipProps<T extends string> {
    renderer?: (props: any) => ReactNode;
  }

  // Export modified types to ensure they're used
  export { BarSeriesType, FadeOptions, ChartsTooltipProps };
}

declare module "@mui/x-charts/ScatterChart" {
  import { ReactNode } from "react";

  // Define ScatterValueType for valueFormatter
  type ScatterValueType = number | string | null | undefined;

  // Define SeriesValueFormatterContext
  interface SeriesValueFormatterContext {
    type?: string;
    [key: string]: any;
  }

  // Define SeriesValueFormatter
  interface SeriesValueFormatter<T> {
    (value: T, context?: SeriesValueFormatterContext): string;
  }

  // Define proper interfaces for Chart data points
  interface DatasetElementType<T> {
    [key: string]: any;
  }

  // Export modified types to ensure they're used
  export {
    ScatterValueType,
    SeriesValueFormatterContext,
    SeriesValueFormatter,
    DatasetElementType,
  };
}

declare module "@mui/x-charts/models" {
  // Define item content function for tooltips
  interface TooltipItemContentProps {
    item?: {
      id?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  type ItemContentFunction = (props: TooltipItemContentProps) => string[];

  // Define Tooltip props
  interface TooltipProps {
    trigger?: "item" | "axis";
    itemContent?: ItemContentFunction;
    [key: string]: any;
  }

  // Export modified types to ensure they're used
  export { TooltipItemContentProps, ItemContentFunction, TooltipProps };
}
