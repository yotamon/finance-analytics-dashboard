import React, { useState, useEffect, useMemo, useCallback, CSSProperties } from "react";
import {
  Box,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { motion } from "framer-motion";
import { useI18n } from "../../context/I18nContext";
import {
  HeatMapProject,
  HeatMapProjectData,
  MetricsHeatMapProps,
  GroupedMetrics,
  MetricConfig,
} from "../../types/chart-types";

// Define additional TypeScript interfaces
interface GroupedProjects {
  [key: string]: HeatMapProject[];
}

interface GroupedMetricsMap {
  [key: string]: GroupedMetrics;
}

interface MinMaxValues {
  [key: string]: {
    min: number;
    max: number;
  };
}

// Default color scale
const DEFAULT_COLORS = {
  min: "#e3f2fd", // Light blue
  max: "#1565c0", // Dark blue
  neutral: "#f5f5f5", // Light grey
};

/**
 * Metrics Heat Map Component
 *
 * This component creates a heat map for comparing financial metrics across projects or categories.
 * It visualizes data intensity using color gradients, allowing for quick comparison of multiple metrics.
 */
export const MetricsHeatMap: React.FC<MetricsHeatMapProps> = ({
  data,
  height = 500,
  width,
  colorScale: customColorScale,
  metrics: metricsProp,
  groupBy: initialGroupBy = "type",
}) => {
  const theme = useTheme();
  const { t } = useI18n();
  const [selectedMetric, setSelectedMetric] = useState<string>("irr");
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [groupBy, setGroupBy] = useState<string>(initialGroupBy);

  // Merge default colors with custom colors
  const colorScale = useMemo(
    () => ({
      ...DEFAULT_COLORS,
      ...customColorScale,
    }),
    [customColorScale]
  );

  // Sample data if none provided
  const sampleData = useMemo<{ projects: HeatMapProject[] }>(
    () => ({
      projects: [
        {
          name: "Project A",
          type: "Solar Ground",
          country: "Romania",
          irr: 0.281,
          yieldOnCost: 0.15,
          ebitdaMargin: 0.85,
          debtServiceCoverage: 1.8,
        },
        {
          name: "Project B",
          type: "On-shore Wind",
          country: "Romania",
          irr: 0.318,
          yieldOnCost: 0.14,
          ebitdaMargin: 0.92,
          debtServiceCoverage: 2.1,
        },
        {
          name: "Project C",
          type: "Solar Ground",
          country: "N.Macedonia",
          irr: 0.282,
          yieldOnCost: 0.13,
          ebitdaMargin: 0.87,
          debtServiceCoverage: 1.9,
        },
        {
          name: "Project D",
          type: "Solar Ground",
          country: "Bulgaria",
          irr: 0.268,
          yieldOnCost: 0.13,
          ebitdaMargin: 0.83,
          debtServiceCoverage: 1.7,
        },
        {
          name: "Project E",
          type: "On-shore Wind",
          country: "Serbia",
          irr: 0.264,
          yieldOnCost: 0.13,
          ebitdaMargin: 0.82,
          debtServiceCoverage: 1.6,
        },
        {
          name: "Project F",
          type: "Solar Ground",
          country: "Greece",
          irr: 0.293,
          yieldOnCost: 0.14,
          ebitdaMargin: 0.88,
          debtServiceCoverage: 2.0,
        },
        {
          name: "Project G",
          type: "On-shore Wind",
          country: "Bulgaria",
          irr: 0.273,
          yieldOnCost: 0.12,
          ebitdaMargin: 0.84,
          debtServiceCoverage: 1.8,
        },
        {
          name: "Project H",
          type: "Solar Ground",
          country: "Serbia",
          irr: 0.295,
          yieldOnCost: 0.15,
          ebitdaMargin: 0.9,
          debtServiceCoverage: 2.2,
        },
      ],
    }),
    []
  );

  // Use provided data or fallback to sample data
  const projectData = useMemo<HeatMapProject[]>(() => {
    if (!data) return sampleData.projects;
    // Handle both formats: direct array or object with projects property
    return Array.isArray(data) ? data : data.projects || sampleData.projects;
  }, [data, sampleData]);

  // Group projects by type and country
  const { groupedByType, groupedByCountry } = useMemo<{
    groupedByType: GroupedProjects;
    groupedByCountry: GroupedProjects;
  }>(() => {
    const byType: GroupedProjects = {};
    const byCountry: GroupedProjects = {};

    projectData.forEach((project) => {
      // Group by type
      if (!byType[project.type]) {
        byType[project.type] = [];
      }
      byType[project.type].push(project);

      // Group by country
      if (!byCountry[project.country]) {
        byCountry[project.country] = [];
      }
      byCountry[project.country].push(project);
    });

    return { groupedByType: byType, groupedByCountry: byCountry };
  }, [projectData]);

  // Calculate average metrics by group
  const calculateGroupMetrics = useCallback((groups: GroupedProjects): GroupedMetricsMap => {
    const result: GroupedMetricsMap = {};

    Object.entries(groups).forEach(([key, projects]) => {
      result[key] = {
        irr: projects.reduce((sum, p) => sum + p.irr, 0) / projects.length,
        yieldOnCost: projects.reduce((sum, p) => sum + p.yieldOnCost, 0) / projects.length,
        ebitdaMargin: projects.reduce((sum, p) => sum + (p.ebitdaMargin || 0), 0) / projects.length,
        debtServiceCoverage:
          projects.reduce((sum, p) => sum + (p.debtServiceCoverage || 0), 0) / projects.length,
        count: projects.length,
      };
    });

    return result;
  }, []);

  const metricsByType = useMemo<GroupedMetricsMap>(
    () => calculateGroupMetrics(groupedByType),
    [calculateGroupMetrics, groupedByType]
  );
  const metricsByCountry = useMemo<GroupedMetricsMap>(
    () => calculateGroupMetrics(groupedByCountry),
    [calculateGroupMetrics, groupedByCountry]
  );

  // Available metrics for selection
  const metrics = useMemo<MetricConfig[]>(
    () => [
      { id: "irr", name: t("metric.irr"), format: (val) => `${(val * 100).toFixed(1)}%` },
      {
        id: "yieldOnCost",
        name: t("metric.yieldOnCost"),
        format: (val) => `${(val * 100).toFixed(1)}%`,
      },
      {
        id: "ebitdaMargin",
        name: t("metric.ebitdaMargin"),
        format: (val) => `${(val * 100).toFixed(1)}%`,
      },
      {
        id: "debtServiceCoverage",
        name: t("metric.debtServiceCoverage"),
        format: (val) => val.toFixed(2),
      },
    ],
    [t]
  );

  // Find min and max values for metrics - memoized
  const minMaxValues = useMemo<MinMaxValues>(() => {
    // Calculate min/max values only once for all metrics
    const allMetricsValues: { [key: string]: number[] } = {
      irr: [],
      yieldOnCost: [],
      ebitdaMargin: [],
      debtServiceCoverage: [],
    };

    // Collect all values for each metric from both type and country groups
    const processMetricValues = (metricData: GroupedMetricsMap) => {
      Object.values(metricData).forEach((metrics) => {
        if (metrics.irr !== undefined) allMetricsValues.irr.push(metrics.irr);
        if (metrics.yieldOnCost !== undefined)
          allMetricsValues.yieldOnCost.push(metrics.yieldOnCost);
        if (metrics.ebitdaMargin !== undefined)
          allMetricsValues.ebitdaMargin.push(metrics.ebitdaMargin);
        if (metrics.debtServiceCoverage !== undefined)
          allMetricsValues.debtServiceCoverage.push(metrics.debtServiceCoverage);
      });
    };

    processMetricValues(metricsByType);
    processMetricValues(metricsByCountry);

    // Calculate min/max for each metric
    const result: MinMaxValues = {};

    // Helper function to safely calculate min/max
    const calculateMinMax = (values: number[]) => {
      if (!values || values.length === 0) {
        return { min: 0, max: 1 }; // Default fallback
      }
      return {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };

    // Calculate for each metric
    result.irr = calculateMinMax(allMetricsValues.irr);
    result.yieldOnCost = calculateMinMax(allMetricsValues.yieldOnCost);
    result.ebitdaMargin = calculateMinMax(allMetricsValues.ebitdaMargin);
    result.debtServiceCoverage = calculateMinMax(allMetricsValues.debtServiceCoverage);

    return result;
  }, [metricsByType, metricsByCountry]);

  // Find the selected metric config
  const selectedMetricConfig = useMemo<MetricConfig>(
    () => metrics.find((m) => m.id === selectedMetric) || metrics[0],
    [metrics, selectedMetric]
  );

  // Color interpolation helper - memoized
  const interpolateColor = useCallback((color1: string, color2: string, factor: number): string => {
    // Convert hex to RGB
    const hex2rgb = (hex: string): number[] => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    // Convert RGB to hex
    const rgb2hex = (rgb: number[]): string => {
      return (
        "#" +
        rgb
          .map((val) => {
            const hex = Math.round(val).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          })
          .join("")
      );
    };

    const rgb1 = hex2rgb(color1);
    const rgb2 = hex2rgb(color2);

    const result = rgb1.map((val, i) => {
      return val + factor * (rgb2[i] - val);
    });

    return rgb2hex(result);
  }, []);

  // Calculate color for a cell based on its value - memoized
  const getColorForValue = useCallback(
    (value: number | undefined, metric: string): string => {
      if (value === undefined || isNaN(value)) return theme.palette.grey[300];

      const metricValues = minMaxValues[metric];
      if (!metricValues) return theme.palette.grey[300];

      const { min, max } = metricValues;

      // Normalize value between 0 and 1 (with safety check for division by zero)
      const normalized = max === min ? 0.5 : (value - min) / (max - min);

      // Choose a color scale based on theme and metric
      if (metric === "debtServiceCoverage") {
        // For DSCR, higher is better
        const startColor = theme.palette.error.light;
        const endColor = theme.palette.success.light;
        return interpolateColor(startColor, endColor, normalized);
      } else {
        // For other metrics (IRR, Yield, EBITDA margin), higher is also better
        const startColor = theme.palette.error.light;
        const midColor = theme.palette.warning.light;
        const endColor = theme.palette.success.light;

        if (normalized < 0.5) {
          return interpolateColor(startColor, midColor, normalized * 2);
        } else {
          return interpolateColor(midColor, endColor, (normalized - 0.5) * 2);
        }
      }
    },
    [minMaxValues, theme.palette, interpolateColor]
  );

  // Handle metric selection
  const handleMetricChange = useCallback((e: SelectChangeEvent) => {
    setSelectedMetric(e.target.value);
  }, []);

  // Handle cell hover
  const handleCellHover = useCallback((cellId: string) => {
    setHoveredCell(cellId);
  }, []);

  const handleCellLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  // Render a single cell in the heatmap
  const renderCell = useCallback(
    (key: string, value: number | undefined, count: number, rowType: string) => {
      if (value === undefined || isNaN(value)) return null;

      const formattedValue = selectedMetricConfig.format(value);
      const cellColor = getColorForValue(value, selectedMetric);
      const isHovered = hoveredCell === `${rowType}-${key}`;
      const cellId = `${rowType}-${key}`;

      return (
        <Box
          key={cellId}
          sx={{
            p: 1.5,
            backgroundColor: cellColor,
            flex: 1,
            minWidth: 100,
            borderRadius: 1,
            m: 0.5,
            transition: "all 0.2s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            boxShadow: isHovered ? 3 : 1,
            cursor: "pointer",
          }}
          onMouseEnter={() => handleCellHover(cellId)}
          onMouseLeave={handleCellLeave}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {key}
          </Typography>
          <Typography variant="h6">{formattedValue}</Typography>
          <Typography variant="caption" color="text.secondary">
            {`${count} ${t("metric.projects")}`}
          </Typography>
        </Box>
      );
    },
    [
      selectedMetricConfig,
      getColorForValue,
      selectedMetric,
      hoveredCell,
      t,
      handleCellHover,
      handleCellLeave,
    ]
  );

  // Loading effect when changing metrics
  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedMetric]);

  // Memoize the rendered type and country cells
  const renderedTypeCells = useMemo(() => {
    return Object.entries(metricsByType).map(([type, metrics]) =>
      renderCell(type, metrics[selectedMetric as keyof GroupedMetrics], metrics.count, "type")
    );
  }, [metricsByType, selectedMetric, renderCell]);

  const renderedCountryCells = useMemo(() => {
    return Object.entries(metricsByCountry).map(([country, metrics]) =>
      renderCell(country, metrics[selectedMetric as keyof GroupedMetrics], metrics.count, "country")
    );
  }, [metricsByCountry, selectedMetric, renderCell]);

  // Render the component
  return (
    <Box
      sx={{
        width: width || "100%",
        height,
        position: "relative",
      }}
    >
      <Paper
        sx={{
          height: "100%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" color="text.primary">
            {t("charts.heatmap.title")}
          </Typography>

          <FormControl variant="outlined" size="small">
            <InputLabel id="metric-select-label">{t("charts.heatmap.metric")}</InputLabel>
            <Select
              labelId="metric-select-label"
              value={selectedMetric}
              onChange={handleMetricChange}
              label={t("charts.heatmap.metric")}
              sx={{ minWidth: 150 }}
            >
              {metrics.map((metric) => (
                <MenuItem key={metric.id} value={metric.id}>
                  {metric.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box
            sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "auto" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                {t("charts.heatmap.byType")}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap" }}>{renderedTypeCells}</Box>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                {t("charts.heatmap.byCountry")}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap" }}>{renderedCountryCells}</Box>
            </motion.div>

            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">
                {t("charts.heatmap.description")}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MetricsHeatMap;
