/**
 * Common type definitions for Recharts components
 * Used across various chart components in the application
 */
import { CSSProperties, ReactNode } from "react";

/**
 * Common margin type used in charts
 */
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Base chart data point interface
 * All chart data will extend this or conform to this shape
 */
export interface BaseDataPoint {
  [key: string]: any;
}

/**
 * Recharts tooltip payload item
 */
export interface TooltipPayloadItem {
  name: string;
  value: string | number;
  unit?: string;
  color?: string;
  fill?: string;
  dataKey?: string;
  payload?: any;
}

/**
 * Common props for Recharts tooltip components
 */
export interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  coordinate?: {
    x: number;
    y: number;
  };
  wrapperStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  itemStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  formatter?: (value: any, name: string, props: any) => ReactNode;
  labelFormatter?: (label: string | number) => ReactNode;
  animationDuration?: number;
  animationEasing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
}

/**
 * Common props for axis components
 */
export interface AxisProps {
  dataKey?: string;
  xAxisId?: string | number;
  yAxisId?: string | number;
  width?: number;
  height?: number;
  orientation?: "top" | "bottom" | "left" | "right";
  type?: "number" | "category";
  allowDecimals?: boolean;
  hide?: boolean;
  tickCount?: number;
  tickLine?: boolean | object;
  axisLine?: boolean | object;
  tick?: boolean | object | ReactNode | ((props: any) => ReactNode);
  stroke?: string;
  padding?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  allowDataOverflow?: boolean;
  scale?:
    | "auto"
    | "linear"
    | "pow"
    | "sqrt"
    | "log"
    | "identity"
    | "time"
    | "band"
    | "point"
    | "ordinal"
    | "quantile"
    | "quantize"
    | "threshold";
  domain?: [number | "auto" | "dataMin" | "dataMax", number | "auto" | "dataMin" | "dataMax"];
  interval?: "preserveStart" | "preserveEnd" | "preserveStartEnd" | number;
  reversed?: boolean;
}

/**
 * Common props for legend components
 */
export interface LegendProps {
  width?: number;
  height?: number;
  layout?: "horizontal" | "vertical";
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  iconSize?: number;
  iconType?:
    | "line"
    | "square"
    | "rect"
    | "circle"
    | "cross"
    | "diamond"
    | "star"
    | "triangle"
    | "wye";
  payload?: Array<{
    value: string;
    id?: string;
    type?: string;
    color?: string;
  }>;
  formatter?: (value: string, entry: any) => ReactNode;
  onClick?: (event: any) => void;
  onMouseEnter?: (event: any) => void;
  onMouseLeave?: (event: any) => void;
  wrapperStyle?: CSSProperties;
}

/**
 * Common props for all chart types
 */
export interface BaseChartProps {
  width?: number | string;
  height?: number | string;
  data: BaseDataPoint[];
  margin?: ChartMargin;
  className?: string;
  style?: CSSProperties;
  title?: string | ReactNode;
  desc?: string | ReactNode;
}

/**
 * Props for line charts
 */
export interface LineChartProps extends BaseChartProps {
  layout?: "horizontal" | "vertical";
  syncId?: string;
  syncMethod?: "index" | "value";
  compact?: boolean;
  throttleDelay?: number;
  onMouseEnter?: (data: any, index: number) => void;
  onMouseLeave?: (data: any, index: number) => void;
  onClick?: (data: any, index: number) => void;
}

/**
 * Props for bar charts
 */
export interface BarChartProps extends BaseChartProps {
  layout?: "horizontal" | "vertical";
  syncId?: string;
  barCategoryGap?: number | string;
  barGap?: number | string;
  barSize?: number;
  maxBarSize?: number;
  stackOffset?: "none" | "expand" | "wiggle" | "silhouette" | "sign";
  reverseStackOrder?: boolean;
  onMouseEnter?: (data: any, index: number) => void;
  onMouseLeave?: (data: any, index: number) => void;
  onClick?: (data: any, index: number) => void;
}

/**
 * Props for pie charts
 */
export interface PieChartProps extends BaseChartProps {
  startAngle?: number;
  endAngle?: number;
  cx?: number | string;
  cy?: number | string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  paddingAngle?: number;
  nameKey?: string;
  dataKey?: string;
  valueKey?: string;
  activeIndex?: number | number[];
  activeShape?: object | ReactNode | ((props: any) => ReactNode);
  onMouseEnter?: (data: any, index: number) => void;
  onMouseLeave?: (data: any, index: number) => void;
  onClick?: (data: any, index: number) => void;
}

/**
 * Props for scatter charts
 */
export interface ScatterChartProps extends BaseChartProps {
  xAxisId?: string | number;
  yAxisId?: string | number;
  zAxisId?: string | number;
  onMouseEnter?: (data: any, index: number) => void;
  onMouseLeave?: (data: any, index: number) => void;
  onClick?: (data: any, index: number) => void;
}

/**
 * Props for area charts
 */
export interface AreaChartProps extends BaseChartProps {
  layout?: "horizontal" | "vertical";
  syncId?: string;
  syncMethod?: "index" | "value";
  stackOffset?: "none" | "expand" | "wiggle" | "silhouette" | "sign";
  onMouseEnter?: (data: any, index: number) => void;
  onMouseLeave?: (data: any, index: number) => void;
  onClick?: (data: any, index: number) => void;
}

/**
 * Props for heatmap specific charts
 */
export interface HeatMapDataPoint extends BaseDataPoint {
  x: string | number;
  y: string | number;
  value: number;
  tooltip?: string;
}

export interface HeatMapChartProps extends BaseChartProps {
  data: HeatMapDataPoint[];
  xCategories: string[];
  yCategories: string[];
  colorScale: string[];
  showTooltip?: boolean;
  showLegend?: boolean;
  minValue?: number;
  maxValue?: number;
  onCellClick?: (data: HeatMapDataPoint) => void;
}
