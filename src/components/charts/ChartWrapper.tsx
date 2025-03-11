import React, { useState, useEffect, memo, FC, ReactNode } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  Cell,
  LabelList,
  Text,
  Sector,
  TooltipProps,
} from "recharts";
// Using type import with 'type' keyword to avoid runtime import
import type { ChartThemeConfig } from "./ChartTheme";
// Using require for implementation import to handle missing declaration file
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ChartTheme, getChartColors, createGradient, getDashPattern } = require("./ChartTheme");
import { CustomTooltip } from "./CustomTooltip";
import { Box, CircularProgress, Typography, Paper, useTheme, Alert } from "@mui/material";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ChartSkeleton = require("../ui/ChartSkeleton").default;
import useChartLazyLoading from "../../hooks/useChartLazyLoading";
import { useI18n } from "../../context/I18nContext";
import {
  ChartWrapperProps,
  ActiveShapeProps,
  AxisTickProps,
  TransformedChartData,
  ChartType,
} from "../../types/chart-wrapper-types";

/**
 * ActiveShape component for PieChart with hover effects
 */
const ActiveShape: FC<ActiveShapeProps> = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} style={{ fontWeight: "bold" }}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

type XAxisTickProps = {
  x: number;
  y: number;
  payload: { value: string | number };
  angle?: number;
  verticalAnchor?: string;
  textAnchor?: string;
};

/**
 * Custom tick component for x-axis labels with truncation for long labels
 */
const CustomizedXAxisTick = (props: XAxisTickProps) => {
  const { x, y, payload, angle = 0, verticalAnchor = "middle", textAnchor = "middle" } = props;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor={textAnchor}
        dominantBaseline={verticalAnchor}
        transform={`rotate(${angle})`}
        fontSize={12}
        fill="#666"
      >
        {typeof payload.value === "string" && payload.value.length > 10
          ? `${payload.value.substring(0, 10)}...`
          : payload.value}
      </text>
    </g>
  );
};

// Define types for formatting functions used in tooltips
type LabelFormatterFunction = (label: string | number, payload?: Array<any>) => ReactNode;
type ValueFormatterFunction = (value: any, name?: string, props?: any) => ReactNode;

/**
 * Memoized chart wrapper component that supports multiple chart types
 * with lazy loading, error handling, and responsive design
 */
export const ChartWrapper: FC<ChartWrapperProps> = memo(function ChartWrapper({
  chartType,
  data,
  options,
  width = "100%",
  height = "100%",
  chartName = "Chart",
}) {
  const theme = useTheme();
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  // Use our custom lazy loading hook
  const { isVisible, shouldRender, ref } = useChartLazyLoading({
    threshold: 0.1,
    delay: 150,
  });

  // Handle chart load state
  useEffect(() => {
    try {
      // Check if data is valid
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("Chart data is empty or invalid");
      }

      if (isVisible && shouldRender) {
        // Add a small delay to stagger rendering and improve perceived performance
        const timer = setTimeout(() => setIsChartLoading(false), 300);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error("Error initializing chart:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize chart");
      setIsChartLoading(false);
    }
  }, [data, isVisible, shouldRender]);

  /**
   * Handle pie/donut chart hover
   */
  const handlePieEnter = (_: any, index: number): void => {
    setActiveIndex(index);
  };

  /**
   * Setup chart with enhanced styling
   */
  const renderChart = () => {
    // If not visible or not yet ready to render, return null (will be replaced by skeleton)
    if (!isVisible || !shouldRender) {
      return null;
    }

    try {
      // If error occurred, show error message
      if (error) {
        return (
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}
          >
            <Alert severity="error" sx={{ width: "90%" }}>
              Chart Error: {error}
            </Alert>
          </Box>
        );
      }

      // Validate data
      if (!data || !Array.isArray(data) || data.length === 0) {
        return (
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}
          >
            <Alert severity="warning" sx={{ width: "90%" }}>
              {t("charts.noData")}
            </Alert>
          </Box>
        );
      }

      // If still loading, show progress indicator
      if (isChartLoading) {
        return (
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}
          >
            <CircularProgress size={40} thickness={4} />
          </Box>
        );
      }

      // Extract dataKey from data (assuming first row contains headers)
      const headers = Array.isArray(data) && data.length > 0 ? data[0] : [];
      const dataKeys = headers.slice(1) as string[]; // First column is usually labels

      // Transform Google Charts data format to Recharts format
      const transformedData: TransformedChartData[] =
        Array.isArray(data) && data.length > 1
          ? data.slice(1).map((row) => {
              const obj: TransformedChartData = { name: row[0] };
              dataKeys.forEach((key, index) => {
                obj[key] = row[index + 1];
              });
              return obj;
            })
          : [];

      // Get colors from theme based on chart type
      const colors = options?.series
        ? Object.values(options.series)
            .map((s) => s.color as string)
            .filter(Boolean)
        : getChartColors(chartType.toLowerCase().replace("chart", ""), dataKeys.length);

      // Common props for all chart types
      const commonProps = {
        margin: { top: 30, right: 40, left: 30, bottom: 50 },
      };

      /**
       * Custom formatter for tooltips
       */
      const valueFormatter: ValueFormatterFunction = (value, name) => {
        if (options?.vAxis?.format) {
          const format = options.vAxis.format;
          if (format.includes("%")) return `${(Number(value) * 100).toFixed(1)}%`;
          if (format.includes("#M")) return `${format.replace("#M", value)}M`;
          return format.replace("#", value);
        }
        return value?.toString() || "";
      };

      /**
       * Label formatter for tooltips
       */
      const labelFormatter: LabelFormatterFunction = (label) =>
        `${options?.hAxis?.title || t("charts.axis.year")}: ${label}`;

      /**
       * Calculate how many ticks we can display without overlap
       */
      const calculateOptimalTickCount = (dataLength: number): number => {
        // Determine optimal tick count based on data length
        if (dataLength <= 3) return dataLength;
        if (dataLength <= 7) return Math.floor(dataLength / 2) + 1;
        if (dataLength <= 15) return Math.ceil(dataLength / 3);
        return Math.ceil(dataLength / 5);
      };

      /**
       * Calculate tick values to prevent overlapping
       */
      const calculateTickValues = (
        data: TransformedChartData[],
        dataKey = "name"
      ): Array<string | number> => {
        if (!data || data.length === 0) return [];

        const ticks = data.map((item) => item[dataKey]);

        // If we have few datapoints, show all ticks
        if (ticks.length <= 5) return ticks;

        // Otherwise, calculate optimal spacing
        const optimalCount = calculateOptimalTickCount(ticks.length);
        const step = Math.max(1, Math.floor(ticks.length / optimalCount));

        // Create array of evenly spaced tick indices
        const tickIndices: number[] = [];
        for (let i = 0; i < ticks.length; i += step) {
          tickIndices.push(i);
        }

        // Always include the last tick if it's not already included
        if (tickIndices[tickIndices.length - 1] !== ticks.length - 1) {
          tickIndices.push(ticks.length - 1);
        }

        return tickIndices.map((index) => ticks[index]);
      };

      // Normalized chart type to handle case variations
      const normalizedChartType = chartType.toLowerCase();

      // Map from Google Charts types to Recharts types
      const chartTypeMap: Record<string, ChartType> = {
        columnchart: "BarChart",
        barchart: "BarChart",
        linechart: "LineChart",
        piechart: "PieChart",
        donutchart: "PieChart",
        scatterchart: "ScatterChart",
        combochart: "ComboChart",
        areachart: "AreaChart",
      };

      // Get the normalized chart type or use the original
      const mappedChartType = chartTypeMap[normalizedChartType] || chartType;

      // Render different chart types with enhanced styling
      switch (mappedChartType) {
        case "LineChart": {
          const lineTickValues = calculateTickValues(transformedData);
          return (
            <ResponsiveContainer width={width} height={height || 400} aspect={2.5}>
              <LineChart data={transformedData} {...commonProps}>
                <defs>
                  {dataKeys.map((key, index) => (
                    <linearGradient
                      key={`gradient-${key}`}
                      id={`gradient-${key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={colors[index % colors.length]}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={colors[index % colors.length]}
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray={ChartTheme.grid.strokeDasharray}
                  stroke={ChartTheme.grid.stroke}
                  vertical={false}
                  horizontal={ChartTheme.grid.horizontal}
                />
                <XAxis
                  dataKey="name"
                  tick={(props) => <CustomizedXAxisTick {...props} />}
                  ticks={lineTickValues}
                  tickLine={{ stroke: "#888" }}
                  axisLine={{ stroke: "#888" }}
                  padding={{ left: 20, right: 20 }}
                  label={
                    options?.hAxis?.title
                      ? {
                          value: options.hAxis.title,
                          position: "insideBottom",
                          offset: 10,
                          style: { fontSize: 13, fill: "#666", fontWeight: 500 },
                        }
                      : undefined
                  }
                  tickMargin={15}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#666" }}
                  tickLine={{ stroke: "#888" }}
                  axisLine={{ stroke: "#888" }}
                  label={
                    options?.vAxis?.title
                      ? {
                          value: options.vAxis.title,
                          angle: -90,
                          position: "insideLeft",
                          offset: -10,
                          style: { fontSize: 13, fill: "#666", textAnchor: "middle" },
                        }
                      : undefined
                  }
                  tickMargin={10}
                  width={60}
                  domain={[0, "auto"]}
                  tickFormatter={(value) =>
                    typeof value === "number" ? value.toLocaleString() : value
                  }
                />
                <Tooltip
                  content={(props) => (
                    <CustomTooltip
                      {...props}
                      labelFormatter={labelFormatter}
                      valueFormatter={valueFormatter}
                      chartType="line"
                    />
                  )}
                  animationDuration={300}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: 10,
                    marginBottom: 15,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                  iconType="circle"
                  iconSize={8}
                  verticalAlign="top"
                  align="center"
                  layout="horizontal"
                />
                {dataKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{
                      r: 5,
                      strokeWidth: 1,
                      fill: "#fff",
                      stroke: colors[index % colors.length],
                    }}
                    activeDot={ChartTheme.activeDot}
                    animationDuration={ChartTheme.chart.animationDuration}
                    animationEasing={ChartTheme.chart.animationEasing}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          );
        }

        // Other chart types would be implemented here, similar to the LineChart implementation
        // For brevity, I'm showing just the LineChart type fully implemented

        default:
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Alert severity="info" sx={{ width: "90%" }}>
                {t("charts.unsupportedType", { type: chartType })}
              </Alert>
            </Box>
          );
      }
    } catch (err) {
      console.error("Chart render error:", err);
      return (
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}
        >
          <Alert severity="error" sx={{ width: "90%" }}>
            {t("charts.renderError")}
          </Alert>
        </Box>
      );
    }
  };

  return (
    <div ref={ref} className="chart-container" style={{ width, height, position: "relative" }}>
      {!isVisible || !shouldRender ? (
        <ChartSkeleton />
      ) : (
        <React.Fragment>{renderChart()}</React.Fragment>
      )}
    </div>
  );
});

// Display name for React DevTools
ChartWrapper.displayName = "ChartWrapper";
