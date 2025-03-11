// Types for ChartTheme.jsx
export interface ChartColorPalette {
  primary: string[];
  secondary: string[];
  success: string[];
  warning: string[];
  accent: string[];
  neutral: string[];
  [key: string]: string[];
}

export interface ChartFontSettings {
  fontFamily: string;
  fontSize: number;
  labelFontSize: number;
  titleFontSize: number;
}

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartSettings {
  backgroundColor: string;
  margin: ChartMargin;
  animate: boolean;
  animationDuration: number;
  animationEasing: string;
}

export interface ChartGridSettings {
  stroke: string;
  strokeDasharray: string;
  vertical: boolean;
  horizontal: boolean;
}

export interface ChartAxisSettings {
  stroke: string;
  tickStroke: string;
  tickSize: number;
}

export interface ChartTooltipSettings {
  backgroundColor: string;
  borderRadius: number;
  boxShadow: string;
  padding: number;
  border: string;
}

export interface ChartLegendSettings {
  position: string;
  wrapperStyle: {
    paddingTop: number;
    marginBottom: number;
    borderTop: string;
    textAlign: string;
  };
}

export interface ChartResponsiveContainerSettings {
  aspect: number;
  minHeight: number;
}

export interface ChartDotSettings {
  r: number;
  strokeWidth: number;
  fill: string;
  stroke: string;
}

export interface ChartBarSettings {
  radius: number[];
  barSize: number;
  minBarSize: number;
  barGap: number;
}

export interface ChartLineSettings {
  strokeWidth: number;
  activeDotRadius: number;
  dot: ChartDotSettings;
}

export interface ChartPieSettings {
  innerRadius: number;
  outerRadius: number;
  paddingAngle: number;
  labelOffset: number;
}

export interface ChartThemeType {
  colors: ChartColorPalette;
  fonts: ChartFontSettings;
  chart: ChartSettings;
  grid: ChartGridSettings;
  axis: ChartAxisSettings;
  tooltip: ChartTooltipSettings;
  legend: ChartLegendSettings;
  responsiveContainer: ChartResponsiveContainerSettings;
  activeDot: ChartDotSettings;
  bar: ChartBarSettings;
  line: ChartLineSettings;
  pie: ChartPieSettings;
}

export type ChartType = "bar" | "line" | "area" | "pie" | "donut" | "success" | "warning";

export interface ChartThemeHelpers {
  getChartColors: (type: ChartType, count?: number) => string | string[];
  createGradient: (id: string, color: string, opacity?: number) => React.ReactElement;
  getDashPattern: (index: number) => string;
}
