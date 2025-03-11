/**
 * Chart and visualization type definitions
 */

import { CurrencyCode } from "./currency-types";

/**
 * Base interface for all chart data points
 */
export interface ChartDataPoint {
  /**
   * Display label for the data point
   */
  label: string;

  /**
   * Numeric value for the data point
   */
  value: number;

  /**
   * Optional date for time-based visualizations
   */
  date?: string | Date;

  /**
   * Optional category classification
   */
  category?: string;

  /**
   * Optional color override for this specific data point
   */
  color?: string;

  /**
   * Allows for additional properties to be added to data points
   */
  [key: string]: any;
}

/**
 * Time series data point with required date field
 */
export interface TimeSeriesDataPoint extends ChartDataPoint {
  /**
   * Date of the data point, required for time series
   */
  date: string | Date;

  /**
   * Formatted date string for display
   */
  formattedDate?: string;
}

/**
 * Bar chart data structure
 */
export interface BarChartData {
  /**
   * Categories for the X-axis
   */
  categories: string[];

  /**
   * Series of data to be displayed
   */
  series: {
    name: string;
    data: number[];
    color?: string;
  }[];
}

/**
 * Pie chart data structure
 */
export interface PieChartData {
  /**
   * Segments of the pie chart
   */
  segments: {
    label: string;
    value: number;
    color?: string;
    percentage?: number;
  }[];

  /**
   * Total sum of all segments
   */
  total: number;
}

/**
 * Geographic data point for maps
 */
export interface GeoDataPoint extends ChartDataPoint {
  /**
   * Longitude coordinate
   */
  longitude: number;

  /**
   * Latitude coordinate
   */
  latitude: number;

  /**
   * Country or region code
   */
  region?: string;

  /**
   * Size of the marker if using bubble maps
   */
  size?: number;
}

/**
 * Chart configuration options
 */
export interface ChartOptions {
  /**
   * Chart title
   */
  title?: string;

  /**
   * Chart subtitle
   */
  subtitle?: string;

  /**
   * Height of the chart
   */
  height?: number | string;

  /**
   * Width of the chart
   */
  width?: number | string;

  /**
   * Date format for time-based charts
   */
  dateFormat?: string;

  /**
   * Symbol to show before values (e.g., "$")
   */
  valuePrefix?: string;

  /**
   * Symbol to show after values (e.g., "%")
   */
  valueSuffix?: string;

  /**
   * Currency code for financial data
   */
  currency?: CurrencyCode;

  /**
   * Whether to connect null/missing values
   */
  connectNulls?: boolean;

  /**
   * Whether the chart is in loading state
   */
  isLoading?: boolean;

  /**
   * Whether to show grid lines
   */
  showGridLines?: boolean;

  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;

  /**
   * Legend position
   */
  legendPosition?: "top" | "right" | "bottom" | "left";

  /**
   * Color scheme for the chart
   */
  colorScheme?: string[];
}

/**
 * Time range for filtering chart data
 */
export type TimeRange = "1d" | "7d" | "30d" | "90d" | "1y" | "5y" | "ytd" | "all" | "custom";

/**
 * Chart comparison mode
 */
export type ComparisonMode = "none" | "previous_period" | "year_over_year";

/**
 * EBITDA Margin Chart specific interfaces
 */

/**
 * EBITDA Margin Chart input data structure
 */
export interface EbitdaMarginInputData {
  /**
   * Array of years (or periods) for the x-axis
   */
  years: (string | number)[];

  /**
   * Revenue values for each year/period
   */
  revenues: number[];

  /**
   * EBITDA values for each year/period
   */
  ebitda: number[];
}

/**
 * EBITDA Margin Chart data point
 */
export interface EbitdaMarginDataPoint {
  /**
   * Year or period label
   */
  year: string | number;

  /**
   * Calculated EBITDA margin as a percentage
   */
  margin: number;

  /**
   * Revenue value
   */
  revenue: number;

  /**
   * EBITDA value
   */
  ebitda: number;
}

/**
 * EBITDA Margin Chart component props
 */
export interface EbitdaMarginChartProps {
  /**
   * Chart data
   */
  data: EbitdaMarginInputData;

  /**
   * Optional height override
   */
  height?: number;

  /**
   * Optional width override
   */
  width?: number;

  /**
   * Optional industry average benchmark
   */
  industryAverage?: number;

  /**
   * Optional target margin
   */
  targetMargin?: number;

  /**
   * Optional flag to show/hide average reference line
   */
  showAverage?: boolean;

  /**
   * Optional custom chart options
   */
  options?: Partial<ChartOptions>;
}

/**
 * Revenue and EBITDA Chart specific interfaces
 */

/**
 * Revenue and EBITDA Chart input data structure
 */
export interface RevenueEbitdaInputData {
  /**
   * Array of years (or periods) for the x-axis
   */
  years: (string | number)[];

  /**
   * Revenue values for each year/period
   */
  revenues: number[];

  /**
   * EBITDA values for each year/period
   */
  ebitda: number[];
}

/**
 * Revenue and EBITDA Chart component props
 */
export interface RevenueEbitdaChartProps {
  /**
   * Chart data
   */
  data: RevenueEbitdaInputData;

  /**
   * Optional height override
   */
  height?: number;

  /**
   * Optional width override
   */
  width?: number;

  /**
   * Optional flag to show values on bars
   */
  showValues?: boolean;

  /**
   * Optional flag to show year-over-year growth
   */
  showGrowth?: boolean;

  /**
   * Optional color scheme override
   */
  colors?: {
    revenue?: string;
    ebitda?: string;
  };

  /**
   * Optional custom chart options
   */
  options?: Partial<ChartOptions>;
}

/**
 * Custom tooltip props for Revenue EBITDA chart
 */
export interface RevenueEbitdaTooltipProps {
  /**
   * Index of the hovered item
   */
  itemIndex?: number;

  /**
   * Optional series properties
   */
  series?: any[];

  /**
   * Optional active item data
   */
  activeItem?: any;

  /**
   * Optional additional tooltip data
   */
  [key: string]: any;
}

/**
 * Metrics Heatmap specific interfaces
 */

/**
 * Project type for metrics heatmap
 */
export interface HeatMapProject {
  /**
   * Name of the project
   */
  name: string;

  /**
   * Type or category of project
   */
  type: string;

  /**
   * Country where the project is located
   */
  country: string;

  /**
   * Internal Rate of Return as a percentage
   */
  irr: number;

  /**
   * Yield on Cost as a percentage
   */
  yieldOnCost: number;

  /**
   * EBITDA margin as a percentage
   */
  ebitdaMargin?: number;

  /**
   * Debt Service Coverage Ratio
   */
  debtServiceCoverage?: number;

  /**
   * Additional properties that may be present on the project
   */
  [key: string]: any;
}

/**
 * Project data structure for metrics heatmap
 */
export interface HeatMapProjectData {
  /**
   * Array of projects to visualize
   */
  projects?: HeatMapProject[];
}

/**
 * Metrics Heatmap component props
 */
export interface MetricsHeatMapProps {
  /**
   * Data for the heatmap visualization
   */
  data?: HeatMapProjectData | HeatMapProject[];

  /**
   * Optional height override
   */
  height?: number;

  /**
   * Optional width override
   */
  width?: number;

  /**
   * Optional color scale for the heatmap
   * Default colors used if not provided
   */
  colorScale?: {
    min: string;
    max: string;
    neutral?: string;
  };

  /**
   * Optional list of metrics to include
   * If not provided, all available metrics will be shown
   */
  metrics?: string[];

  /**
   * Optional grouping dimension (e.g., 'country', 'type')
   */
  groupBy?: string;
}

/**
 * Grouped metrics for heatmap aggregation
 */
export interface GroupedMetrics {
  /**
   * Average IRR for the group
   */
  irr: number;

  /**
   * Average Yield on Cost for the group
   */
  yieldOnCost: number;

  /**
   * Average EBITDA margin for the group
   */
  ebitdaMargin: number;

  /**
   * Average Debt Service Coverage Ratio for the group
   */
  debtServiceCoverage: number;

  /**
   * Number of projects in the group
   */
  count: number;
}

/**
 * Configuration for a metric in the heatmap
 */
export interface MetricConfig {
  /**
   * Unique identifier for the metric
   */
  id: string;

  /**
   * Display name for the metric
   */
  name: string;

  /**
   * Formatting function to display the metric value
   */
  format: (val: number) => string;
}

/**
 * Cash Flow Sankey Chart specific interfaces
 */

/**
 * Node data for Sankey diagram
 */
export interface SankeyNodeData {
  /**
   * Unique identifier for the node
   */
  id: string;

  /**
   * Display name for the node
   */
  name: string;

  /**
   * Category of the node (e.g., 'revenue', 'cost', 'profit')
   */
  category: string;

  /**
   * X position of left side of node - calculated by d3-sankey
   */
  x0?: number;

  /**
   * X position of right side of node - calculated by d3-sankey
   */
  x1?: number;

  /**
   * Y position of top of node - calculated by d3-sankey
   */
  y0?: number;

  /**
   * Y position of bottom of node - calculated by d3-sankey
   */
  y1?: number;

  /**
   * Total flow value through the node
   */
  value?: number;

  /**
   * Index of the node - calculated by d3-sankey
   */
  index?: number;
}

/**
 * Link data for Sankey diagram
 */
export interface SankeyLinkData {
  /**
   * Source node ID or node object
   */
  source: string | number | SankeyNodeData;

  /**
   * Target node ID or node object
   */
  target: string | number | SankeyNodeData;

  /**
   * Flow value for the link
   */
  value: number;

  /**
   * Link width - calculated by d3-sankey
   */
  width?: number;
}

/**
 * Data structure for a single Sankey view
 */
export interface SankeyViewData {
  /**
   * Array of nodes for the Sankey diagram
   */
  nodes: SankeyNodeData[];

  /**
   * Array of links between nodes
   */
  links: SankeyLinkData[];
}

/**
 * Data structure containing different Sankey views
 */
export interface SankeyData {
  /**
   * Cost breakdown view
   */
  costBreakdown: SankeyViewData;

  /**
   * Revenue streams view
   */
  revenueStreams: SankeyViewData;

  /**
   * Additional views
   */
  [key: string]: SankeyViewData;
}

/**
 * Cash Flow Sankey component props
 */
export interface CashFlowSankeyProps {
  /**
   * Data for the Sankey diagram
   */
  data?: SankeyData;

  /**
   * Optional height override
   */
  height?: number;

  /**
   * Optional width override
   */
  width?: number;

  /**
   * Initial view mode
   */
  initialViewMode?: "costBreakdown" | "revenueStreams" | string;

  /**
   * Options for customizing the Sankey diagram
   */
  options?: {
    /**
     * Node padding
     */
    nodePadding?: number;

    /**
     * Node width
     */
    nodeWidth?: number;

    /**
     * Custom color scheme
     */
    colors?: string[];

    /**
     * Whether to show values on the links
     */
    showValues?: boolean;
  };
}
