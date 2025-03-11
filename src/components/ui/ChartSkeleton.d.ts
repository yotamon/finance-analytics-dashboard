import { FC } from "react";

/**
 * Props for the ChartSkeleton component
 */
export interface ChartSkeletonProps {
  /**
   * Optional custom width for the skeleton
   */
  width?: string | number;

  /**
   * Optional custom height for the skeleton
   */
  height?: string | number;

  /**
   * Whether to show the legend skeleton
   * @default true
   */
  showLegend?: boolean;

  /**
   * Whether to show the axis labels skeleton
   * @default true
   */
  showAxes?: boolean;

  /**
   * Whether to use a variant with less detail for faster rendering
   * @default false
   */
  simplified?: boolean;

  /**
   * Additional class name
   */
  className?: string;
}

/**
 * Component that renders a skeleton placeholder for charts while they're loading
 */
declare const ChartSkeleton: FC<ChartSkeletonProps>;

export default ChartSkeleton;
