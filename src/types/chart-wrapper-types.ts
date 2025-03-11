/**
 * Type definitions for the ChartWrapper component
 */
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

/**
 * Supported chart types in the application
 */
export type ChartType =
  | "LineChart"
  | "BarChart"
  | "PieChart"
  | "DonutChart"
  | "ScatterChart"
  | "ComboChart"
  | "AreaChart"
  | "ColumnChart";

/**
 * Google Charts-like options structure
 */
export interface ChartOptions {
  /**
   * Chart title and configuration
   */
  title?: string;
  titleTextStyle?: Record<string, any>;

  /**
   * Chart subtitle
   */
  subtitle?: string;

  /**
   * Horizontal axis configuration
   */
  hAxis?: {
    title?: string;
    format?: string;
    textStyle?: Record<string, any>;
    gridlines?: {
      count?: number;
      color?: string;
    };
    viewWindow?: {
      min?: number;
      max?: number;
    };
  };

  /**
   * Vertical axis configuration
   */
  vAxis?: {
    title?: string;
    format?: string;
    textStyle?: Record<string, any>;
    gridlines?: {
      count?: number;
      color?: string;
    };
    viewWindow?: {
      min?: number;
      max?: number;
    };
    baseline?: number;
  };

  /**
   * Legend configuration
   */
  legend?: {
    position?: "top" | "right" | "bottom" | "left" | "none";
    alignment?: "start" | "center" | "end";
    textStyle?: Record<string, any>;
  };

  /**
   * Series configuration with colors
   */
  series?: Record<
    string,
    {
      color?: string;
      visibleInLegend?: boolean;
      lineWidth?: number;
      pointSize?: number;
      areaOpacity?: number;
      type?: "line" | "bar" | "area";
    }
  >;

  /**
   * Bar chart specific options
   */
  bar?: {
    groupWidth?: string | number;
    barWidth?: string | number;
    dataOpacity?: number;
  };

  /**
   * Pie chart specific options
   */
  pieHole?: number; // For donut charts
  pieSliceText?: "percentage" | "value" | "label" | "none";

  /**
   * Chart animation and layout
   */
  animation?: {
    duration?: number;
    easing?: string;
    startup?: boolean;
  };

  /**
   * Colors palette for the chart
   */
  colors?: string[];

  /**
   * Chart background color
   */
  backgroundColor?: string;

  /**
   * Chart tooltip settings
   */
  tooltip?: {
    isHtml?: boolean;
    trigger?: "focus" | "selection" | "none";
    format?: string;
  };
}

/**
 * Data for ActiveShape in PieChart component
 */
export interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: {
    name: string | number;
    [key: string]: any;
  };
  percent: number;
  value: number | string;
}

/**
 * Props for CustomizedXAxisTick component
 */
export interface AxisTickProps {
  x: number;
  y: number;
  payload: {
    value: string | number;
    [key: string]: any;
  };
  angle?: number;
  verticalAnchor?: string;
  textAnchor?: string;
}

/**
 * Props for ChartWrapper component
 */
export interface ChartWrapperProps {
  /**
   * Type of chart to render
   */
  chartType: ChartType;

  /**
   * Data for the chart - array with first row as headers
   * [["Category", "Value1", "Value2"], ["A", 10, 20], ["B", 15, 25]]
   */
  data: Array<Array<string | number>>;

  /**
   * Chart configuration options
   */
  options?: ChartOptions;

  /**
   * Width of the chart container
   * @default "100%"
   */
  width?: string | number;

  /**
   * Height of the chart container
   * @default "100%"
   */
  height?: string | number;

  /**
   * Name of the chart for reference
   * @default "Chart"
   */
  chartName?: string;
}

/**
 * Transformed data used internally by the chart components
 */
export interface TransformedChartData {
  name: string | number;
  [key: string]: any;
}
