/**
 * Chart theme configuration type
 */
export interface ChartThemeConfig {
  /**
   * Chart container styling
   */
  chart: {
    /**
     * Chart animation duration in milliseconds
     */
    animationDuration: number;

    /**
     * Chart animation easing function
     */
    animationEasing: string;

    /**
     * Chart padding
     */
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };

  /**
   * Grid styling
   */
  grid: {
    /**
     * Stroke dash array pattern for grid lines
     */
    strokeDasharray: string;

    /**
     * Grid line color
     */
    stroke: string;

    /**
     * Whether to show horizontal grid lines
     */
    horizontal: boolean;

    /**
     * Whether to show vertical grid lines
     */
    vertical: boolean;
  };

  /**
   * Active data point styling
   */
  activeDot: {
    /**
     * Radius of active data point
     */
    r: number;

    /**
     * Stroke width of active data point
     */
    strokeWidth: number;

    /**
     * Fill color of active data point
     */
    fill: string;
  };

  /**
   * Colors used in charts
   */
  colors: {
    /**
     * Primary colors palette
     */
    primary: string[];

    /**
     * Secondary colors palette
     */
    secondary: string[];

    /**
     * Categorical colors palette
     */
    categorical: string[];

    /**
     * Sequential colors palette (for heatmaps, choropleth maps)
     */
    sequential: string[];

    /**
     * Diverging colors palette (for data with meaningful center point)
     */
    diverging: string[];
  };
}

/**
 * Global chart theme configuration
 */
export const ChartTheme: ChartThemeConfig;

/**
 * Gets chart colors based on chart type and count
 * @param chartType - Type of chart
 * @param count - Number of colors needed
 * @returns Array of colors
 */
export function getChartColors(chartType: string, count: number): string[];

/**
 * Creates gradient definition for chart elements
 * @param id - Gradient ID
 * @param color - Base color for gradient
 * @returns Gradient object
 */
export function createGradient(id: string, color: string): any;

/**
 * Gets dash pattern for line styling
 * @param index - Index in the pattern sequence
 * @returns Dash array pattern
 */
export function getDashPattern(index: number): string;
