import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  SelectChangeEvent,
} from "@mui/material";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, SankeyGraph, SankeyNode, SankeyLink } from "d3-sankey";
import { motion } from "framer-motion";
import { useI18n } from "../../context/I18nContext";
import { useCurrency } from "../../context/CurrencyContext";
import {
  SankeyNodeData,
  SankeyLinkData,
  SankeyViewData,
  SankeyData,
  CashFlowSankeyProps,
} from "../../types/chart-types";

// Define additional local interfaces
interface TooltipPosition {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

type ViewMode = "costBreakdown" | "revenueStreams";

/**
 * Sankey Diagram for Cash Flow Visualization
 *
 * This component creates a Sankey diagram to visualize cash flow between different categories.
 * It shows how money flows through the organization/projects from sources to destinations.
 */
export const CashFlowSankey: React.FC<CashFlowSankeyProps> = ({
  data,
  height = 500,
  width,
  initialViewMode = "costBreakdown",
  options = {},
}) => {
  const theme = useTheme();
  const { t } = useI18n();
  const { convert, currency } = useCurrency();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRenderedRef = useRef<boolean>(false); // Track if chart has been rendered
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 500 });
  const [chartData, setChartData] = useState<SankeyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>("costBreakdown");
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SankeyNodeData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  // Define color scales based on theme - memoize to prevent recreation on render
  const nodeColorScale = React.useMemo(
    () =>
      d3
        .scaleOrdinal<string>()
        .range([
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main,
        ]),
    [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
    ]
  );

  // Track container size - this should only run once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Prepare sample data with translation
  const sampleData = React.useMemo<SankeyData>(
    () => ({
      costBreakdown: {
        nodes: [
          { id: "investments", name: t("charts.cashFlowSankey.investments"), category: "source" },
          { id: "revenue", name: t("charts.cashFlowSankey.revenue"), category: "source" },
          { id: "operations", name: t("charts.cashFlowSankey.operations"), category: "expenses" },
          { id: "salaries", name: t("charts.cashFlowSankey.salaries"), category: "expenses" },
          { id: "marketing", name: t("charts.cashFlowSankey.marketing"), category: "expenses" },
          { id: "taxes", name: t("charts.cashFlowSankey.taxes"), category: "expenses" },
          { id: "dividends", name: t("charts.cashFlowSankey.dividends"), category: "expenses" },
          { id: "retained", name: t("charts.cashFlowSankey.retained"), category: "profit" },
        ],
        links: [
          { source: "revenue", target: "operations", value: 45 },
          { source: "revenue", target: "salaries", value: 30 },
          { source: "revenue", target: "marketing", value: 15 },
          { source: "revenue", target: "taxes", value: 20 },
          { source: "revenue", target: "dividends", value: 10 },
          { source: "revenue", target: "retained", value: 30 },
          { source: "investments", target: "operations", value: 25 },
          { source: "investments", target: "retained", value: 25 },
        ],
      },
      revenueStreams: {
        nodes: [
          { id: "wind", name: t("charts.cashFlowSankey.windProjects"), category: "source" },
          { id: "solar", name: t("charts.cashFlowSankey.solarProjects"), category: "source" },
          { id: "revenue", name: t("charts.cashFlowSankey.totalRevenue"), category: "income" },
          { id: "expenses", name: t("charts.cashFlowSankey.expenses"), category: "expenses" },
          { id: "profits", name: t("charts.cashFlowSankey.profits"), category: "profit" },
        ],
        links: [
          { source: "wind", target: "revenue", value: 85 },
          { source: "solar", target: "revenue", value: 65 },
          { source: "revenue", target: "expenses", value: 110 },
          { source: "revenue", target: "profits", value: 40 },
        ],
      },
    }),
    [t]
  );

  // Setup chart data - only on initial mount or when data prop changes
  useEffect(() => {
    try {
      setIsLoading(true);

      // If no data is provided, use sample data
      if (!data) {
        setChartData(sampleData);
        setIsLoading(false);
        return;
      }

      // Use provided data or fallback to sample data for each property
      const dataToUse = data;

      // Validate that data structure is complete
      if (
        !dataToUse.costBreakdown?.nodes?.length ||
        !dataToUse.costBreakdown?.links?.length ||
        !dataToUse.revenueStreams?.nodes?.length ||
        !dataToUse.revenueStreams?.links?.length
      ) {
        // Creating a validated data object with fallbacks for missing data
        const validatedData = {
          costBreakdown: {
            nodes: dataToUse.costBreakdown?.nodes || sampleData.costBreakdown.nodes,
            links: dataToUse.costBreakdown?.links || sampleData.costBreakdown.links,
          },
          revenueStreams: {
            nodes: dataToUse.revenueStreams?.nodes || sampleData.revenueStreams.nodes,
            links: dataToUse.revenueStreams?.links || sampleData.revenueStreams.links,
          },
        };

        setChartData(validatedData);
      } else {
        setChartData(dataToUse);
      }
    } catch (err) {
      console.error("Error setting up chart data:", err);
      setChartData(sampleData); // Fallback to sample data
      setError(t("charts.noData"));
    } finally {
      setIsLoading(false);
      // Reset the rendered flag so we'll render the chart again with new data
      chartRenderedRef.current = false;
    }
  }, [data, sampleData]);

  // Function to get node color based on type
  const getNodeColor = React.useCallback(
    (node: SankeyNodeData): string => {
      return nodeColorScale(node.category) || theme.palette.grey[500];
    },
    [nodeColorScale, theme.palette.grey]
  );

  // Get link color - blend source and target colors
  const getLinkColor = React.useCallback(
    (link: d3.SimulationLinkDatum<SankeyNodeData>): string => {
      const sourceNode = typeof link.source === "object" ? link.source : null;
      if (!sourceNode) return theme.palette.grey[500];

      const sourceColor = d3.color(getNodeColor(sourceNode));
      if (!sourceColor) return theme.palette.grey[500];

      return sourceColor.copy({ opacity: 0.5 }).toString();
    },
    [getNodeColor, theme.palette.grey]
  );

  // Create and render Sankey diagram
  const renderSankey = React.useCallback(async (): Promise<void> => {
    try {
      // Don't re-render if already rendered and nothing has changed
      if (chartRenderedRef.current) {
        return;
      }

      // Set loading state
      setIsLoading(true);

      // Validate required data and references
      if (!svgRef.current || !chartData || !chartData[viewMode]) {
        console.warn("Missing required elements for Sankey diagram");
        setIsLoading(false);
        return;
      }

      // Clear previous chart
      d3.select(svgRef.current).selectAll("*").remove();

      // Get current view data with safe access
      const viewData = chartData[viewMode];

      // Validate data structure
      if (
        !viewData.nodes ||
        !Array.isArray(viewData.nodes) ||
        viewData.nodes.length === 0 ||
        !viewData.links ||
        !Array.isArray(viewData.links) ||
        viewData.links.length === 0
      ) {
        console.warn("Invalid data structure for Sankey diagram");
        setError(t("charts.noData"));
        setIsLoading(false);
        return;
      }

      // Create a copy of the data to avoid modifying the original
      const nodes: SankeyNodeData[] = JSON.parse(JSON.stringify(viewData.nodes));
      const links: SankeyLinkData[] = JSON.parse(JSON.stringify(viewData.links));

      // Convert node ids to indices
      const nodeIds: Record<string, number> = {};
      nodes.forEach((node, i) => {
        nodeIds[node.id] = i;
      });

      // Convert links source/target from id to index
      links.forEach((link) => {
        if (typeof link.source === "string") {
          link.source = nodeIds[link.source] ?? 0;
        }
        if (typeof link.target === "string") {
          link.target = nodeIds[link.target] ?? 0;
        }
      });

      // Convert values to currency if needed
      links.forEach((link) => {
        try {
          // Check if the value is a valid number
          if (typeof link.value === "number" && !isNaN(link.value)) {
            // Handle possible null return from convert
            const convertedValue = convert(link.value);
            if (convertedValue !== null) {
              link.value = convertedValue;
            }
          } else {
            console.warn(`Invalid link value: ${link.value}`);
            link.value = typeof link.value === "number" ? link.value : 1;
          }
        } catch (error) {
          console.warn(
            `Error converting value: ${error instanceof Error ? error.message : "Unknown error"}`
          );
          link.value = typeof link.value === "number" ? link.value : 1;
        }
      });

      // Define chart dimensions with margins
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      const width = dimensions.width - margin.left - margin.right;
      const height = dimensions.height - margin.top - margin.bottom;

      // Create SVG
      const svg = d3
        .select(svgRef.current)
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Initialize sankey generator
      const sankeyGenerator = sankey<SankeyNodeData, SankeyLinkData>()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([
          [0, 0],
          [width, height],
        ]);

      // Generate sankey data
      const sankeyData = sankeyGenerator({
        nodes: nodes,
        links: links,
      } as unknown as SankeyGraph<SankeyNodeData, SankeyLinkData>);

      // Draw links
      svg
        .append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(sankeyData.links || [])
        .enter()
        .append("path")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke", getLinkColor)
        .attr("stroke-width", (d) => Math.max(1, d.width || 1))
        .attr("fill", "none")
        .attr("opacity", 0.5)
        // Gradual fade-in animation
        .attr("stroke-dasharray", function () {
          const length = this.getTotalLength();
          return `${length} ${length}`;
        })
        .attr("stroke-dashoffset", function () {
          return this.getTotalLength();
        })
        .transition()
        .duration(1000)
        .delay((_, i) => i * 50)
        .attr("stroke-dashoffset", 0)
        // Tooltip on hover
        .selection()
        .append("title")
        .text((d) => {
          const source = typeof d.source === "object" ? d.source.name : "Source";
          const target = typeof d.target === "object" ? d.target.name : "Target";
          return `${source} → ${target}\n${currency.symbol}${d.value.toFixed(1)}M`;
        });

      // Draw nodes
      const nodes_g = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(sankeyData.nodes || [])
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${d.x0 || 0},${d.y0 || 0})`)
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .delay((_, i) => i * 100)
        .attr("opacity", 1)
        .selection();

      // Add node rectangles
      nodes_g
        .append("rect")
        .attr("height", (d) => Math.max(0, (d.y1 || 0) - (d.y0 || 0)))
        .attr("width", (d) => (d.x1 || 0) - (d.x0 || 0))
        .attr("fill", getNodeColor)
        .attr("stroke", (d) => {
          const color = d3.color(getNodeColor(d));
          return color ? color.darker(0.5).toString() : "#000000";
        })
        .append("title")
        .text((d) => `${d.name}\n${currency.symbol}${(d.value || 0).toFixed(1)}M`);

      // Add node labels
      nodes_g
        .append("text")
        .attr("x", (d) => ((d.x0 || 0) < width / 2 ? 6 + ((d.x1 || 0) - (d.x0 || 0)) : -6))
        .attr("y", (d) => ((d.y1 || 0) - (d.y0 || 0)) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d) => ((d.x0 || 0) < width / 2 ? "start" : "end"))
        .text((d) => d.name)
        .attr("fill", theme.palette.text.primary)
        .attr("font-size", "12px")
        .each(function (d) {
          // Wrap text if needed
          const text = d3.select(this);
          const maxWidth = 100;
          const words = d.name.split(/\s+/);
          const lineHeight = 1.1;

          text.text(null);

          if (words.length === 1) {
            text
              .append("tspan")
              .attr("x", (d.x0 || 0) < width / 2 ? 6 + ((d.x1 || 0) - (d.x0 || 0)) : -6)
              .attr("y", ((d.y1 || 0) - (d.y0 || 0)) / 2)
              .text(d.name);
          } else {
            let lineNumber = 0;
            words.forEach((word, i) => {
              const tspan = text
                .append("tspan")
                .attr("x", (d.x0 || 0) < width / 2 ? 6 + ((d.x1 || 0) - (d.x0 || 0)) : -6)
                .attr("y", ((d.y1 || 0) - (d.y0 || 0)) / 2)
                .attr("dy", `${i === 0 ? 0 : lineHeight}em`)
                .text(word);

              lineNumber++;
            });

            // Adjust position for multi-line text
            text
              .selectAll("tspan")
              .attr("dy", (_, i) => `${i * lineHeight - ((lineNumber - 1) * lineHeight) / 2}em`);
          }
        });

      // Complete loading
      setIsLoading(false);
      // Set the rendered flag to true
      chartRenderedRef.current = true;
    } catch (err) {
      console.error("Error rendering Sankey diagram:", err);
      setError(t("charts.renderError"));
    } finally {
      setIsLoading(false);
    }
  }, [
    chartData,
    viewMode,
    dimensions.width,
    dimensions.height,
    getNodeColor,
    getLinkColor,
    t,
    currency.symbol,
  ]);

  // Trigger chart rendering when dependencies change
  useEffect(() => {
    // Only render if we have chart data and dimensions
    if (chartData && dimensions.width > 0 && dimensions.height > 0) {
      // Reset the rendered flag if the view mode changes
      if (chartRenderedRef.current) {
        // Reset to false to force a re-render
        chartRenderedRef.current = false;
      }

      // Render the chart
      renderSankey();
    }
  }, [chartData, viewMode, dimensions, renderSankey]);

  // Reset the rendered flag when the theme changes
  useEffect(() => {
    chartRenderedRef.current = false;
  }, [theme]);

  // Handle view mode change
  const handleViewModeChange = React.useCallback((e: SelectChangeEvent<string>): void => {
    const newMode = e.target.value as ViewMode;
    setViewMode(newMode);
    // Reset the rendered flag to force re-render with the new view mode
    chartRenderedRef.current = false;
  }, []);

  return (
    <Box ref={containerRef} sx={{ width: "100%", height: "100%", position: "relative" }}>
      {/* View Mode Selector */}
      <Box sx={{ mb: 2, ml: 1 }}>
        <Select
          labelId="sankey-view-label"
          value={viewMode}
          onChange={handleViewModeChange}
          label={t("charts.cashflowsankey.viewMode")}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="costBreakdown">{t("charts.cashflowsankey.costBreakdown")}</MenuItem>
          <MenuItem value="revenueStreams">{t("charts.cashflowsankey.revenueStreams")}</MenuItem>
        </Select>
      </Box>

      {error && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100% - 60px)",
          }}
        >
          <Typography color="error" variant="body1">
            {error}
          </Typography>
        </Box>
      )}

      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100% - 60px)",
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}

      {!isLoading &&
        !error &&
        (!data || !chartData || !chartData[viewMode] || !chartData[viewMode].nodes) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "calc(100% - 60px)",
            }}
          >
            <Typography color="text.secondary">{t("charts.noData")}</Typography>
          </Box>
        )}

      {/* SVG Container */}
      <svg
        ref={svgRef}
        width={dimensions.width || 100}
        height={Math.max(dimensions.height - 60, 100)}
        style={{
          display:
            isLoading ||
            error ||
            !data ||
            !chartData ||
            !chartData[viewMode] ||
            !chartData[viewMode].nodes
              ? "none"
              : "block",
          marginTop: "10px",
        }}
      />

      {/* Tooltip */}
      {hoveredNode && (
        <Tooltip open={!!hoveredNode} title="" placement="top">
          <Box
            sx={{
              position: "absolute",
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              bgcolor: "background.paper",
              boxShadow: 3,
              borderRadius: 1,
              p: 1,
              pointerEvents: "none",
            }}
          >
            <Typography variant="subtitle2">{hoveredNode.name}</Typography>
            <Typography variant="body2">
              {currency.symbol}
              {(hoveredNode.value || 0).toFixed(1)}M
            </Typography>
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default CashFlowSankey;
