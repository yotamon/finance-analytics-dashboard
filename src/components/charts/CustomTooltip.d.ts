import { FC, ReactNode } from "react";

/**
 * Props for the CustomTooltip component
 */
export interface CustomTooltipProps {
  /**
   * Active status of the tooltip
   */
  active?: boolean;

  /**
   * Tooltip payload data
   */
  payload?: Array<{
    name?: string;
    value?: any;
    dataKey?: string;
    fill?: string;
    color?: string;
    [key: string]: any;
  }>;

  /**
   * Tooltip label
   */
  label?: string | number;

  /**
   * Type of chart the tooltip is used with
   */
  chartType?: "line" | "bar" | "area" | "pie" | "scatter" | "composed";

  /**
   * Function to format tooltip labels
   */
  labelFormatter?: (label: string | number, payload?: any[]) => ReactNode;

  /**
   * Function to format tooltip values
   */
  valueFormatter?: (value: any, dataKey?: string, payload?: Record<string, any>) => ReactNode;

  /**
   * Custom cursor for the tooltip
   */
  cursor?: boolean | object | ReactNode;

  /**
   * Custom content for the tooltip
   */
  content?: ReactNode;

  /**
   * Whether to show percentage values
   */
  showPercentage?: boolean;

  /**
   * Custom styling for the tooltip
   */
  tooltipStyle?: React.CSSProperties;
}

/**
 * Custom tooltip component for charts
 */
export const CustomTooltip: FC<CustomTooltipProps>;

export default CustomTooltip;
