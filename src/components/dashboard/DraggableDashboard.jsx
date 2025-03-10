import React, { useState, useEffect, useRef, useCallback } from "react";
import { Responsive as ResponsiveGridLayout, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  useTheme,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CardHeader,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
  CircularProgress,
} from "@mui/material";
import { useI18n } from "../../context/I18nContext";
import {
  DragIndicator,
  ZoomOutMap,
  ZoomInMap,
  CloseFullscreen,
  OpenInFull,
  Close,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
  Map as MapIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  BubbleChart as BubbleChartIcon,
  AccountTree as AccountTreeIcon,
  GridOn as GridOnIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  AspectRatio as AspectRatioIcon,
  Download as DownloadIcon,
  ViewColumn as ViewColumnIcon,
  InsertChartOutlined,
  Save as SaveIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { alpha } from "@mui/material/styles";
import PropTypes from "prop-types";
import { debounce } from "lodash";
import { useLocation } from "react-router-dom";

// Custom CSS to fix layout issues
const customStyles = {
  dashboardContainer: {
    width: "100%",
    position: "relative",
    minHeight: "800px", // Ensure container has minimum height
    overflow: "visible",
    marginBottom: "30px", // Add margin to bottom of container

    // Add styles for react-resizable handles
    "& .react-resizable-handle": {
      position: "absolute",
      width: "20px",
      height: "20px",
      bottom: "0",
      right: "0",
      padding: "0 3px 3px 0",
      zIndex: 2,
      opacity: 0,
      transition: "opacity 0.3s ease",
    },
    "& .react-resizable-handle-se": {
      bottom: "0",
      right: "0",
      cursor: "se-resize",
    },
    "& .react-resizable-handle-sw": {
      bottom: "0",
      left: "0",
      cursor: "sw-resize",
    },
    "& .react-resizable-handle-ne": {
      top: "0",
      right: "0",
      cursor: "ne-resize",
    },
    "& .react-resizable-handle-nw": {
      top: "0",
      left: "0",
      cursor: "nw-resize",
    },
    "& .react-grid-item:hover .react-resizable-handle": {
      opacity: 0.8,
    },
  },
  chartPaper: {
    height: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    borderRadius: 3,
    boxShadow: 2,
    transition: "all 0.2s ease",
    position: "relative", // Add position relative for z-index to work
    zIndex: 1, // Default z-index
    "&:hover": {
      boxShadow: 8,
      zIndex: 10, // Higher z-index on hover to stay on top
      transform: "translateY(-4px)",
    },
    // Add styling to match inner cards
    padding: 0,
    background: (theme) => theme.palette.background.paper,
    // Add a gradient line at the top similar to ProjectTableCard
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "4px",
      background: (theme) =>
        `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
      opacity: 0.7,
    },
  },
  chartHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    paddingBottom: "8px",
    "& .MuiCardHeader-action": {
      alignSelf: "center",
      marginTop: 0,
      marginRight: 0,
    },
  },
  chartTitle: {
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
  },
  chartIcon: {
    marginRight: 1.5,
    borderRadius: 2,
    padding: 1,
    display: "flex",
    color: (theme) => theme.palette.primary.main,
    backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.2),
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.05)",
      backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.3),
    },
  },
  chartContent: {
    flexGrow: 1,
    padding: 2,
    height: "calc(100% - 72px)",
    overflow: "auto",
  },
  resizeHandle: {
    position: "absolute",
    width: "20px", // Increased from previous size
    height: "20px", // Increased from previous size
    background: (theme) => alpha(theme.palette.primary.main, 0.2),
    border: (theme) => `2px solid ${theme.palette.primary.main}`,
    borderRadius: "50%",
    zIndex: 10,
    transition: "opacity 0.2s ease, transform 0.2s ease, background 0.2s ease",
    opacity: 0,
    "&:hover": {
      opacity: "1 !important",
      transform: "scale(1.2)",
      background: (theme) => alpha(theme.palette.primary.main, 0.4),
    },
  },
  // Add specific styles for each corner handle
  "resizeHandle-se": {
    bottom: "-10px",
    right: "-10px",
    cursor: "se-resize",
  },
  "resizeHandle-sw": {
    bottom: "-10px",
    left: "-10px",
    cursor: "sw-resize",
  },
  "resizeHandle-ne": {
    top: "-10px",
    right: "-10px",
    cursor: "ne-resize",
  },
  "resizeHandle-nw": {
    top: "-10px",
    left: "-10px",
    cursor: "nw-resize",
  },
};

// Import chart components
import { RevenueEbitdaChart } from "../charts/RevenueEbitdaChart";
import { ProjectPortfolioChart } from "../charts/ProjectPortfolioChart";
import { ProjectTypeChart } from "../charts/ProjectTypeChart";
import { InvestmentReturnsChart } from "../charts/InvestmentReturnsChart";
import { EbitdaMarginChart } from "../charts/EbitdaMarginChart";
import { CountryComparisonChart } from "../charts/CountryComparisonChart";
import { GeographicMap } from "../charts/GeographicMap";
import ProjectTableCard from "./ProjectTableCard";
// Import new chart components
import CashFlowSankey from "../charts/CashFlowSankey";
import MetricsHeatMap from "../charts/MetricsHeatMap";
import CorrelationMatrix from "../charts/CorrelationMatrix";

// Create a width-aware grid layout
const ResponsiveGridLayoutWithWidth = WidthProvider(ResponsiveGridLayout);

// Chart Registry - Map chart types to their components
const CHART_COMPONENTS = {
  "revenue-ebitda": RevenueEbitdaChart,
  "project-portfolio": ProjectPortfolioChart,
  "project-type": ProjectTypeChart,
  "investment-returns": InvestmentReturnsChart,
  "ebitda-margin": EbitdaMarginChart,
  "country-comparison": CountryComparisonChart,
  "geographic-map": GeographicMap,
  "project-table": ProjectTableCard,
  // Add new chart types
  "cash-flow-sankey": CashFlowSankey,
  "metrics-heatmap": MetricsHeatMap,
  "correlation-matrix": CorrelationMatrix,
};

// Chart type to icon mapping
const CHART_ICONS = {
  "revenue-ebitda": <ShowChartIcon fontSize="small" />,
  "project-portfolio": <TableChartIcon fontSize="small" />,
  "project-type": <PieChartIcon fontSize="small" />,
  "investment-returns": <BarChartIcon fontSize="small" />,
  "ebitda-margin": <TimelineIcon fontSize="small" />,
  "country-comparison": <AssessmentIcon fontSize="small" />,
  "geographic-map": <MapIcon fontSize="small" />,
  "project-table": <TableChartIcon fontSize="small" />,
  "cash-flow-sankey": <AccountTreeIcon fontSize="small" />,
  "metrics-heatmap": <GridOnIcon fontSize="small" />,
  "correlation-matrix": <BubbleChartIcon fontSize="small" />,
};

// Default layout configuration
const DEFAULT_LAYOUTS = {
  lg: [
    { i: "revenue-ebitda", x: 0, y: 0, w: 12, h: 6, minW: 4, minH: 4 },
    { i: "project-portfolio", x: 0, y: 6, w: 6, h: 6, minW: 3, minH: 4 },
    { i: "project-type", x: 6, y: 6, w: 6, h: 6, minW: 3, minH: 4 },
    { i: "geographic-map", x: 0, y: 12, w: 12, h: 9, minW: 4, minH: 6 },
    { i: "cash-flow-sankey", x: 0, y: 21, w: 12, h: 9, minW: 4, minH: 6 },
    { i: "investment-returns", x: 0, y: 30, w: 4, h: 6, minW: 2, minH: 4 },
    { i: "ebitda-margin", x: 4, y: 30, w: 4, h: 6, minW: 2, minH: 4 },
    { i: "country-comparison", x: 8, y: 30, w: 4, h: 6, minW: 2, minH: 4 },
    { i: "metrics-heatmap", x: 0, y: 36, w: 6, h: 8, minW: 3, minH: 6 },
    { i: "correlation-matrix", x: 6, y: 36, w: 6, h: 8, minW: 3, minH: 6 },
    { i: "project-table", x: 0, y: 44, w: 12, h: 8, minW: 4, minH: 6 },
  ],
  md: [
    { i: "revenue-ebitda", x: 0, y: 0, w: 10, h: 6, minW: 4, minH: 4 },
    { i: "project-portfolio", x: 0, y: 6, w: 5, h: 6, minW: 2, minH: 4 },
    { i: "project-type", x: 5, y: 6, w: 5, h: 6, minW: 2, minH: 4 },
    { i: "geographic-map", x: 0, y: 12, w: 10, h: 8, minW: 4, minH: 6 },
    { i: "cash-flow-sankey", x: 0, y: 20, w: 10, h: 8, minW: 4, minH: 6 },
    { i: "investment-returns", x: 0, y: 28, w: 3, h: 6, minW: 2, minH: 4 },
    { i: "ebitda-margin", x: 3, y: 28, w: 4, h: 6, minW: 2, minH: 4 },
    { i: "country-comparison", x: 7, y: 28, w: 3, h: 6, minW: 2, minH: 4 },
    { i: "metrics-heatmap", x: 0, y: 34, w: 5, h: 8, minW: 2, minH: 6 },
    { i: "correlation-matrix", x: 5, y: 34, w: 5, h: 8, minW: 2, minH: 6 },
    { i: "project-table", x: 0, y: 42, w: 10, h: 8, minW: 4, minH: 6 },
  ],
  sm: [
    { i: "revenue-ebitda", x: 0, y: 0, w: 6, h: 6, minW: 2, minH: 4 },
    { i: "project-portfolio", x: 0, y: 6, w: 6, h: 6, minW: 2, minH: 4 },
    { i: "project-type", x: 0, y: 12, w: 6, h: 6, minW: 2, minH: 4 },
    { i: "geographic-map", x: 0, y: 18, w: 6, h: 8, minW: 2, minH: 6 },
    { i: "cash-flow-sankey", x: 0, y: 26, w: 6, h: 8, minW: 2, minH: 6 },
    { i: "investment-returns", x: 0, y: 34, w: 6, h: 6, minW: 2, minH: 4 },
    { i: "ebitda-margin", x: 0, y: 40, w: 6, h: 6, minW: 2, minH: 4 },
    { i: "country-comparison", x: 0, y: 46, w: 6, h: 6, minW: 2, minH: 4 },
    { i: "metrics-heatmap", x: 0, y: 52, w: 6, h: 8, minW: 2, minH: 6 },
    { i: "correlation-matrix", x: 0, y: 60, w: 6, h: 8, minW: 2, minH: 6 },
    { i: "project-table", x: 0, y: 68, w: 6, h: 8, minW: 2, minH: 6 },
  ],
  xs: [
    { i: "revenue-ebitda", x: 0, y: 0, w: 4, h: 6, minW: 1, minH: 4 },
    { i: "project-portfolio", x: 0, y: 6, w: 4, h: 6, minW: 1, minH: 4 },
    { i: "project-type", x: 0, y: 12, w: 4, h: 6, minW: 1, minH: 4 },
    { i: "geographic-map", x: 0, y: 18, w: 4, h: 8, minW: 1, minH: 6 },
    { i: "cash-flow-sankey", x: 0, y: 26, w: 4, h: 8, minW: 1, minH: 6 },
    { i: "investment-returns", x: 0, y: 34, w: 4, h: 6, minW: 1, minH: 4 },
    { i: "ebitda-margin", x: 0, y: 40, w: 4, h: 6, minW: 1, minH: 4 },
    { i: "country-comparison", x: 0, y: 46, w: 4, h: 6, minW: 1, minH: 4 },
    { i: "metrics-heatmap", x: 0, y: 52, w: 4, h: 8, minW: 1, minH: 6 },
    { i: "correlation-matrix", x: 0, y: 60, w: 4, h: 8, minW: 1, minH: 6 },
    { i: "project-table", x: 0, y: 68, w: 4, h: 8, minW: 1, minH: 6 },
  ],
  xxs: [
    { i: "revenue-ebitda", x: 0, y: 0, w: 2, h: 6, minW: 1, minH: 4 },
    { i: "project-portfolio", x: 0, y: 6, w: 2, h: 6, minW: 1, minH: 4 },
    { i: "project-type", x: 0, y: 12, w: 2, h: 6, minW: 1, minH: 4 },
    { i: "geographic-map", x: 0, y: 18, w: 2, h: 8, minW: 1, minH: 6 },
    { i: "cash-flow-sankey", x: 0, y: 26, w: 2, h: 8, minW: 1, minH: 6 },
    { i: "investment-returns", x: 0, y: 34, w: 2, h: 6, minW: 1, minH: 4 },
    { i: "ebitda-margin", x: 0, y: 40, w: 2, h: 6, minW: 1, minH: 4 },
    { i: "country-comparison", x: 0, y: 46, w: 2, h: 6, minW: 1, minH: 4 },
    { i: "metrics-heatmap", x: 0, y: 52, w: 2, h: 8, minW: 1, minH: 6 },
    { i: "correlation-matrix", x: 0, y: 60, w: 2, h: 8, minW: 1, minH: 6 },
    { i: "project-table", x: 0, y: 68, w: 2, h: 8, minW: 1, minH: 6 },
  ],
};

// Constants for layout - moved outside component function
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

// Create a transition component for the Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Define a custom ResizeHandle component for better cursor tracking
const CustomResizeHandle = React.forwardRef(function CustomResizeHandle(props, ref) {
  const { handleAxis, ...restProps } = props;

  // Default to 'se' if handleAxis is not provided
  const axis = handleAxis || "se";

  // Improve cursor tracking by adding specific styles per axis
  const getAxisSpecificStyles = () => {
    switch (axis) {
      case "se":
        return {
          bottom: "-8px",
          right: "-8px",
          cursor: "se-resize",
          backgroundColor: "rgba(25, 118, 210, 0.2)",
          borderColor: "rgba(25, 118, 210, 0.7)",
        };
      case "sw":
        return {
          bottom: "-8px",
          left: "-8px",
          cursor: "sw-resize",
          backgroundColor: "rgba(25, 118, 210, 0.2)",
          borderColor: "rgba(25, 118, 210, 0.7)",
        };
      case "ne":
        return {
          top: "-8px",
          right: "-8px",
          cursor: "ne-resize",
          backgroundColor: "rgba(25, 118, 210, 0.2)",
          borderColor: "rgba(25, 118, 210, 0.7)",
        };
      case "nw":
        return {
          top: "-8px",
          left: "-8px",
          cursor: "nw-resize",
          backgroundColor: "rgba(25, 118, 210, 0.2)",
          borderColor: "rgba(25, 118, 210, 0.7)",
        };
      default:
        return {};
    }
  };

  return (
    <div
      ref={ref}
      className={`react-resizable-handle react-resizable-handle-${axis}`}
      style={{
        position: "absolute",
        width: "24px",
        height: "24px",
        background: "transparent",
        border: "2px solid transparent",
        borderRadius: "50%",
        zIndex: 10,
        userSelect: "none",
        touchAction: "none",
        ...getAxisSpecificStyles(),
      }}
      {...restProps}
    />
  );
});

// Add PropTypes for CustomResizeHandle
CustomResizeHandle.propTypes = {
  handleAxis: PropTypes.string,
};

export default function DraggableDashboard({
  financialData,
  projectData,
  countryData,
  editMode = false,
  onLayoutChange,
  savedLayouts = null,
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const location = useLocation(); // Get current route location

  // Initialize with savedLayouts if provided, otherwise use defaults
  // Use useState with callback to ensure proper initial state
  const [layouts, setLayouts] = useState(() => {
    if (savedLayouts && Object.keys(savedLayouts).length > 0) {
      /* eslint-disable-next-line no-console */
      console.log("Initializing with savedLayouts:", savedLayouts);
      return savedLayouts;
    }
    /* eslint-disable-next-line no-console */
    console.log("Using DEFAULT_LAYOUTS");
    return DEFAULT_LAYOUTS;
  });

  const [maximizedChart, setMaximizedChart] = useState(null);
  const [activeCharts, setActiveCharts] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Add state to track the complete readiness of the dashboard
  const [isDashboardReady, setIsDashboardReady] = useState(false);

  // Menu state for chart options
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // Add state for size submenu
  const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = useState(null);

  // Track resize operations
  const [isResizing, setIsResizing] = useState(false);

  // Add a useWidth hook to get the container width
  const containerRef = useRef(null);

  // Add state for current resize dimensions
  const [currentResize, setCurrentResize] = useState(null);

  // Reference to track grid stability
  const gridStabilityRef = useRef({
    attemptCount: 0,
    isFullyReady: false,
    isMounted: false,
  });

  // Add a dedicated function to reset the isResizing state safely
  const resetResizingState = useCallback(() => {
    setIsResizing(false);
    setCurrentResize(null);
    // Force recalculation after resizing
    window.dispatchEvent(new Event("resize"));
  }, []);

  // Use debounced version for better performance
  const debouncedResetResizingState = useCallback(
    debounce(() => {
      resetResizingState();
    }, 100),
    [resetResizingState]
  );

  // Get the current breakpoint based on window width
  const getCurrentBreakpoint = useCallback(() => {
    const width = window.innerWidth;
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    if (width >= BREAKPOINTS.xs) return "xs";
    return "xxs";
  }, []);

  // Force re-render of grid layout to reflect changes immediately
  const forceGridUpdate = useCallback(() => {
    // Mark that we're forcing an update to prevent conflicts with other changes
    const wasResizing = isResizing;
    setIsResizing(true);

    // First trigger resize event to reflow charts
    window.dispatchEvent(new Event("resize"));

    // Use RAF for better performance than setTimeout
    requestAnimationFrame(() => {
      // Force layout recalculation without changing the actual layout data
      // This prevents resetting to default layouts while still updating the UI
      window.dispatchEvent(new Event("resize"));

      // Only update layouts state if necessary, using the current layouts
      // Not doing a deep copy prevents accidentally losing user changes
      setTimeout(() => {
        setIsResizing(wasResizing);
      }, 50);
    });
  }, [isResizing]);

  // Handle card size change
  const handleChangeCardSize = useCallback(
    (chartId, size) => {
      // Find the current layout
      const currentBreakpoint = getCurrentBreakpoint();
      const currentLayouts = layouts[currentBreakpoint] || [];

      // Find the chart in the layout
      const chartLayout = currentLayouts.find((item) => item.i === chartId);

      if (!chartLayout) {
        /* eslint-disable-next-line no-console */
        console.warn(`Chart ${chartId} not found in layout`);
        return;
      }

      // Get max columns for current breakpoint
      const maxCols =
        {
          lg: 12,
          md: 10,
          sm: 6,
          xs: 4,
          xxs: 2,
        }[currentBreakpoint] || 12;

      // Calculate new width based on size option and max columns
      let newWidth;
      if (size === "1/3") {
        newWidth = Math.max(Math.round(maxCols / 3), 1);
      } else if (size === "1/2") {
        newWidth = Math.max(Math.round(maxCols / 2), 1);
      } else {
        // "full"
        newWidth = maxCols;
      }

      // Set appropriate minW - make it smaller than the desired width to avoid constraint warnings
      const minW = Math.max(1, Math.floor(newWidth * 0.8));

      // Create a deep copy of layouts to ensure React detects the change
      const newLayouts = JSON.parse(JSON.stringify(layouts));
      const newCurrentLayout = newLayouts[currentBreakpoint];
      const chartIndex = newCurrentLayout.findIndex((item) => item.i === chartId);

      console.log(
        `Changing ${chartId} width from ${chartLayout.w} to ${newWidth} (${size}) at breakpoint ${currentBreakpoint}`
      );

      // Update the width and constraints
      newCurrentLayout[chartIndex].w = newWidth;
      newCurrentLayout[chartIndex].minW = minW;

      // Adjust x position if card would go off grid
      if (newCurrentLayout[chartIndex].x + newWidth > maxCols) {
        newCurrentLayout[chartIndex].x = Math.max(0, maxCols - newWidth);
      }

      // Update the layouts
      setLayouts(newLayouts);

      // Save the layouts and trigger onLayoutChange
      if (onLayoutChange) {
        onLayoutChange(newLayouts);
      }

      // Force grid update using the helper function
      forceGridUpdate();

      // Close menus
      setSizeMenuAnchorEl(null);
      setMenuAnchorEl(null);
    },
    [layouts, getCurrentBreakpoint, forceGridUpdate, onLayoutChange]
  );

  // Handle size menu open
  const handleSizeMenuOpen = useCallback((event, chartId) => {
    setSizeMenuAnchorEl(event.currentTarget);
    setActiveMenu(chartId);
    // Don't close the main menu
    event.stopPropagation();
  }, []);

  // Handle size menu close
  const handleSizeMenuClose = useCallback(() => {
    setSizeMenuAnchorEl(null);
  }, []);

  // Handle menu open
  const handleMenuOpen = useCallback((event, chartId) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMenu(chartId);
  }, []);

  // Handle menu close
  const handleMenuClose = useCallback(() => {
    setActiveMenu(null);
  }, []);

  // Handle resize event
  const onResize = useCallback((layout, oldItem, newItem) => {
    // Enhanced cursor tracking during resize
    console.log(
      `Resizing chart ${newItem.i} from ${oldItem.w}x${oldItem.h} to ${newItem.w}x${newItem.h}`
    );

    // Mark that we're currently resizing
    setIsResizing(true);

    // Store the current resize dimensions for smoother updates
    setCurrentResize({
      chartId: newItem.i,
      w: newItem.w,
      h: newItem.h,
    });

    // Find the element being resized and enhance visual feedback
    const el = document.querySelector(`[data-grid-id="${newItem.i}"]`);
    if (el) {
      el.style.zIndex = "1000";
      // Force immediate visual updates
      el.style.transition = "none";
      // Ensure consistent transform origin
      el.style.transformOrigin = "center center";
    }

    // Important: Don't update the layout during active resize to prevent jumping
  }, []);

  // Handle when resize stops
  const onResizeStop = useCallback(
    (layout, oldItem, newItem) => {
      console.log(
        `Resize complete for ${newItem.i} from ${oldItem.w}x${oldItem.h} to ${newItem.w}x${newItem.h}`
      );

      // Remove actively-resizing class and reset styles
      const el = document.querySelector(`[data-grid-id="${newItem.i}"]`);
      if (el) {
        el.classList.remove("actively-resizing");
        el.style.zIndex = "";
        el.style.transition = "";
      }

      // Create a deep copy of the current layouts
      const newLayouts = JSON.parse(JSON.stringify(layouts));
      const currentBreakpoint = getCurrentBreakpoint();

      // Find and update the item that was resized
      if (newLayouts[currentBreakpoint]) {
        const itemIndex = newLayouts[currentBreakpoint].findIndex((item) => item.i === newItem.i);

        if (itemIndex !== -1) {
          // Update the width and height with precise values
          newLayouts[currentBreakpoint][itemIndex] = {
            ...newLayouts[currentBreakpoint][itemIndex],
            w: newItem.w,
            h: newItem.h,
            // Ensure minW is not larger than the new width
            minW: Math.min(newLayouts[currentBreakpoint][itemIndex].minW || 1, newItem.w),
          };

          // Update layouts with a single state update
          setLayouts(newLayouts);

          // Call onLayoutChange if provided, but after a short delay
          // to ensure DOM has settled
          if (onLayoutChange) {
            setTimeout(() => {
              onLayoutChange(newLayouts);
            }, 50);
          }
        }
      }

      // Clear resize state
      setCurrentResize(null);

      // Allow a short delay before clearing the resizing flag
      // This helps prevent layout jumps during the transition
      setTimeout(() => {
        setIsResizing(false);

        // Force window resize to ensure charts redraw properly
        window.dispatchEvent(new Event("resize"));
      }, 100);
    },
    [layouts, getCurrentBreakpoint, onLayoutChange]
  );

  // Handle drag operation on grid items
  const onDrag = useCallback(() => {
    if (!isResizing) {
      setIsResizing(true);
    }
  }, [isResizing]);

  // Handle when drag stops
  const onDragStop = useCallback(
    (layout, oldItem, newItem) => {
      // Skip if in a bad state or unmounted
      if (!isDashboardReady || !gridStabilityRef.current.isFullyReady) {
        return;
      }

      /* eslint-disable-next-line no-console */
      console.log(`Drag complete for ${newItem.i} to position x:${newItem.x}, y:${newItem.y}`);

      // Create a deep copy of the layouts to ensure we're not mutating references
      const newLayouts = JSON.parse(JSON.stringify(layouts));
      const currentBreakpoint = getCurrentBreakpoint();

      // Find and update the item that was dragged
      if (newLayouts[currentBreakpoint]) {
        const itemIndex = newLayouts[currentBreakpoint].findIndex((item) => item.i === newItem.i);

        if (itemIndex !== -1) {
          // Update position with the new x, y values
          newLayouts[currentBreakpoint][itemIndex] = {
            ...newLayouts[currentBreakpoint][itemIndex],
            x: newItem.x,
            y: newItem.y,
          };

          // Update layouts with a single state update for better performance
          setLayouts(newLayouts);

          // Notify parent of layout changes if callback provided
          if (onLayoutChange) {
            // Small delay to ensure DOM has updated
            setTimeout(() => {
              onLayoutChange(newLayouts);
            }, 100);
          }
        }
      }

      // Fix for proper cursor position after drag
      const el = document.querySelector(`[data-grid-id="${newItem.i}"]`);
      if (el) {
        el.classList.remove("dragging");
        el.style.cursor = "";
        el.style.zIndex = "";
      }

      // Delayed reset of resize state for smoother transitions
      setTimeout(() => {
        setIsResizing(false);
      }, 100);
    },
    [isDashboardReady, layouts, onLayoutChange, getCurrentBreakpoint]
  );

  // Modified draggable handlers with strict safety checks
  const onDragStart = useCallback(
    (layout, oldItem, newItem, placeholder, e, element) => {
      // Comprehensive safety check
      if (!isDashboardReady || !gridStabilityRef.current.isFullyReady) {
        console.log("Preventing drag: Dashboard not fully ready");
        if (e) {
          if (e.preventDefault) e.preventDefault();
          if (e.stopPropagation) e.stopPropagation();
        }
        return false;
      }

      // Continue only when we're 100% sure it's safe
      if (element) {
        element.classList.add("dragging");
      }
      setIsResizing(true);
      return true;
    },
    [isDashboardReady]
  );

  const onResizeStart = useCallback(
    (layout, oldItem, newItem, placeholder, e, element) => {
      // Comprehensive safety check
      if (!isDashboardReady || !gridStabilityRef.current.isFullyReady) {
        console.log("Preventing resize: Dashboard not fully ready");
        if (e) {
          if (e.preventDefault) e.preventDefault();
          if (e.stopPropagation) e.stopPropagation();
        }
        return false;
      }

      setIsResizing(true);

      // Ensure minW constraints are valid
      const currentBreakpoint = getCurrentBreakpoint();
      if (layouts[currentBreakpoint]) {
        const item = layouts[currentBreakpoint].find((i) => i.i === oldItem.i);
        if (item) {
          // Ensure minW is never larger than w
          item.minW = Math.min(item.minW || 1, item.w);

          // Add resize indicator class for visual feedback
          const el = document.querySelector(`[data-grid-id="${oldItem.i}"]`);
          if (el) {
            el.classList.add("actively-resizing");
          }
        }
      }

      return true;
    },
    [isDashboardReady, layouts, getCurrentBreakpoint]
  );

  // Establish the dashboard ready state with multiple checks and a safe delay
  useEffect(() => {
    // Reset readiness when route or key props change
    setIsDashboardReady(false);
    gridStabilityRef.current = {
      attemptCount: 0,
      isFullyReady: false,
      isMounted: false,
    };

    let isMounted = true;

    // Step 1: Mark component as mounted
    const mountTimer = setTimeout(() => {
      if (isMounted) {
        setMounted(true);
        gridStabilityRef.current.isMounted = true;
      }
    }, 200);

    // Step 2: Prepare the layout calculations with a delay
    const prepTimer = setTimeout(() => {
      if (isMounted && gridStabilityRef.current.isMounted) {
        // Force a layout refresh to ensure everything is properly calculated
        window.dispatchEvent(new Event("resize"));
        gridStabilityRef.current.attemptCount++;
      }
    }, 500);

    // Step 3: Mark the dashboard as fully ready only after everything else is stable
    const readyTimer = setTimeout(() => {
      if (isMounted && gridStabilityRef.current.isMounted) {
        setIsDashboardReady(true);
        gridStabilityRef.current.isFullyReady = true;
        console.log("Dashboard is now fully ready for interactions");
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(mountTimer);
      clearTimeout(prepTimer);
      clearTimeout(readyTimer);

      // Reset the stability tracking
      gridStabilityRef.current = {
        attemptCount: 0,
        isFullyReady: false,
        isMounted: false,
      };
    };
  }, [location.pathname]); // Reset readiness when route changes

  // Populate activeCharts from layouts when component mounts or layouts change
  useEffect(() => {
    if (layouts) {
      // Extract unique chart IDs from the current layout
      const currentBreakpoint = getCurrentBreakpoint();
      const currentLayout = layouts[currentBreakpoint] || [];

      // Get all chart IDs from the layout
      const chartIds = currentLayout.map((item) => item.i);

      // Set the active charts
      console.log("Setting active charts:", chartIds);
      setActiveCharts(chartIds);
    }
  }, [layouts, getCurrentBreakpoint]);

  // Render chart based on its type
  const renderChart = (chartId, passedData, isMaximized = false) => {
    const ChartComponent = CHART_COMPONENTS[chartId];

    if (!ChartComponent) {
      return (
        <Box
          sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Typography color="error">Chart type not found: {chartId}</Typography>
        </Box>
      );
    }

    // Use passed data if available, otherwise use props
    const data = passedData || { financialData, projectData, countryData };

    // Determine which data to pass based on chart type
    let chartData;
    switch (chartId) {
      case "revenue-ebitda":
        chartData = data.financialData;
        break;
      case "geographic-map":
      case "project-portfolio":
      case "project-type":
      case "investment-returns":
        chartData = data.projectData;
        break;
      case "country-comparison":
        chartData = data.countryData;
        break;
      case "ebitda-margin":
        chartData = data.financialData;
        break;
      case "cash-flow-sankey":
        chartData = data.financialData;
        break;
      case "metrics-heatmap":
        chartData = data.projectData;
        break;
      case "correlation-matrix":
        chartData = data.projectData;
        break;
      case "project-table":
        // In maximized view, we want to show the full card
        return <ProjectTableCard projects={data.projectData} embedded={!isMaximized} />;
      default:
        chartData = data.projectData;
    }

    return <ChartComponent data={chartData} />;
  };

  // Memoize MaximizedChart component for better performance
  const MaximizedChart = React.memo(({ chartId, data, onClose }) => {
    const theme = useTheme();
    const { t } = useI18n();

    return (
      <Dialog
        open
        fullScreen
        onClose={onClose}
        TransitionComponent={Transition}
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: (theme) => theme.palette.background.default,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                mr: 1.5,
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.light, 0.2),
                width: 36,
                height: 36,
              }}
              variant="rounded"
            >
              {CHART_ICONS[chartId]}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600} noWrap>
                {t(`charts.${formatChartId(chartId)}.title`, formatChartForDisplay(chartId))}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {t(`charts.${formatChartId(chartId)}.description`, "Chart visualization")}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <CardContent
            sx={{
              height: "calc(100% - 76px)",
              p: chartId === "project-table" ? 0 : 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {renderChart(chartId, data, true)}
          </CardContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  });

  // Add PropTypes validation
  MaximizedChart.propTypes = {
    chartId: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  // Helper function to safely format chart ID for translation keys
  const formatChartId = (id) => {
    if (!id) return "";
    // Format the chart ID for use in translation keys - ensure it matches the format in en.json
    // For example, convert "revenue-ebitda" to "revenueEbitda"
    return id.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  };

  // Helper function to format chart ID for display as fallback
  const formatChartForDisplay = (id) => {
    if (!id) return "";
    // Convert kebab-case to Title Case
    return id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Add an event listener to ensure proper cursor positioning in the grid
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Only apply during drag/resize operations
      if (isResizing) {
        // Get all currently dragging or resizing items
        const activeItems = document.querySelectorAll(
          ".react-grid-item.react-draggable-dragging, .react-grid-item.resizing"
        );

        // Apply precise cursor positioning to active items
        activeItems.forEach((item) => {
          // Ensure cursor follows item during drag/resize
          item.style.pointerEvents = "auto";
          item.style.touchAction = "none";

          // Force hardware acceleration for smooth movement
          item.style.willChange = "transform";

          // Ensure consistent transform center
          item.style.transformOrigin = "center center";
        });
      }
    };

    // Add a global event listener for precise cursor tracking
    document.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isResizing]);

  // Add dynamic CSS for resize handles and fix positioning issues
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* CRITICAL FIX - Precise cursor positioning */
      .layout.react-grid-layout {
        position: relative !important;
        transform-origin: top left;
        overflow: visible;
      }

      /* Fix the z-index and stacking context for better mouse tracking */
      .react-grid-item {
        will-change: transform;
        z-index: 1;
        box-sizing: border-box;
        transform-origin: center center;
      }

      /* Reset transitions during drag for immediate cursor feedback */
      .react-grid-item.react-draggable-dragging {
        transition: none !important;
        z-index: 3;
        will-change: transform;
        cursor: grabbing !important;
        opacity: 0.8;
        box-shadow: 0 0 10px 3px rgba(25, 118, 210, 0.4) !important;
        /* Fix for cursor offset issues */
        user-select: none;
        pointer-events: auto;
      }

      /* Force immediate updates during resize operations */
      .react-grid-item.resizing {
        transition: none !important;
        z-index: 3;
        will-change: transform;
        user-select: none;
        pointer-events: auto;
      }

      /* Improve drag handle styling for better cursor targeting */
      .drag-handle {
        cursor: grab;
        transition: opacity 0.2s;
        user-select: none;
        /* Ensure the drag handle always gets pointer events */
        pointer-events: auto;
      }

      .react-grid-item.dragging .drag-handle {
        cursor: grabbing;
      }

      /* Fix resize handle positioning and styling for better cursor targeting */
      .react-resizable-handle {
        position: absolute;
        width: 24px !important;
        height: 24px !important;
        background-color: rgba(25, 118, 210, 0.2);
        border-radius: 50%;
        border: 2px solid rgba(25, 118, 210, 0.7);
        transition: opacity 0.2s, transform 0.2s;
        z-index: 10;
        visibility: visible;
        opacity: 0;
        pointer-events: auto;
        touch-action: none;
      }

      /* Handle positions adjustments for better cursor accuracy */
      .react-resizable-handle-se {
        bottom: -8px;
        right: -8px;
        cursor: se-resize;
      }

      .react-resizable-handle-sw {
        bottom: -8px;
        left: -8px;
        cursor: sw-resize;
      }

      .react-resizable-handle-nw {
        top: -8px;
        left: -8px;
        cursor: nw-resize;
      }

      .react-resizable-handle-ne {
        top: -8px;
        right: -8px;
        cursor: ne-resize;
      }

      /* Make handles more visible on hover for better usability */
      .react-grid-item:hover .react-resizable-handle {
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  // Force window resize event on component mount to ensure charts render correctly
  useEffect(() => {
    // Trigger initial resize after a short delay for better chart sizing
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Toggle maximized state for a chart
  const toggleMaximize = (chartId) => {
    setMaximizedChart(maximizedChart === chartId ? null : chartId);
  };

  // Memoize the grid children to improve performance, as recommended in react-grid-layout docs
  const gridChildren = React.useMemo(() => {
    return activeCharts.map((chartId) => (
      <Paper
        key={chartId}
        elevation={1}
        className={currentResize?.chartId === chartId ? "actively-resizing" : ""}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          transition: isResizing ? "none" : "box-shadow 0.2s ease-in-out",
          cursor: editMode ? "default" : "auto",
          ...(editMode && {
            "&:hover": {
              boxShadow: (theme) => `0 0 5px 1px ${theme.palette.primary.light}`,
            },
          }),
        }}
        data-grid-id={chartId}
      >
        {/* Chart Title Bar */}
        <CardHeader
          className="drag-handle"
          avatar={
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: (theme) => theme.palette.primary.main,
                color: "#fff",
                ...(editMode && { cursor: "grab" }),
              }}
            >
              {CHART_ICONS[chartId] || <InsertChartOutlined />}
            </Avatar>
          }
          title={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                ...(editMode && { cursor: "grab" }),
              }}
            >
              {editMode && (
                <Tooltip title={t("dashboard.drag")}>
                  <DragIndicator
                    sx={{
                      mr: 1,
                      color: theme.palette.text.secondary,
                      cursor: "grab",
                    }}
                  />
                </Tooltip>
              )}
              <Typography variant="subtitle1" component="div">
                {t(`charts.${formatChartId(chartId)}.title`, formatChartForDisplay(chartId))}
              </Typography>
            </Box>
          }
          subheader={
            <Typography
              variant="caption"
              color="text.secondary"
              sx={editMode ? { cursor: "grab" } : {}}
            >
              {t(`charts.${formatChartId(chartId)}.description`, "Chart visualization")}
            </Typography>
          }
          action={
            <Box sx={{ display: "flex" }}>
              {editMode && (
                <Tooltip title={t("dashboard.changeSize")}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleSizeMenuOpen(e, chartId)}
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    <AspectRatioIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title={t("dashboard.maximize")}>
                <IconButton
                  size="small"
                  onClick={() => toggleMaximize(chartId)}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <OpenInFull fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={t("dashboard.options")}>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, chartId)}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
          sx={{
            pb: 0,
            "& .MuiCardHeader-action": {
              alignSelf: "center",
              marginTop: 0,
              marginRight: 0,
            },
          }}
        />

        {/* Chart Content Area */}
        <CardContent
          sx={{
            flexGrow: 1,
            p: chartId === "project-table" ? 0 : 2,
            pt: chartId === "project-table" ? 0 : 1,
            "&:last-child": { pb: 0 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100% - 72px)",
            overflow: "auto",
          }}
        >
          {renderChart(chartId, { financialData, projectData, countryData })}
        </CardContent>
      </Paper>
    ));
  }, [
    activeCharts,
    editMode,
    theme,
    t,
    formatChartId,
    formatChartForDisplay,
    financialData,
    projectData,
    countryData,
    handleSizeMenuOpen,
    handleMenuOpen,
    toggleMaximize,
    CHART_ICONS,
    currentResize,
    isResizing,
  ]);

  // Handle layout changes
  const handleLayoutChange = (currentLayout, allLayouts) => {
    // Skip if layouts are not valid or if we're currently resizing
    if (!allLayouts || Object.keys(allLayouts).length === 0 || isResizing) {
      return;
    }

    // Don't perform unnecessary updates if layouts haven't changed
    const hasChanged = JSON.stringify(layouts) !== JSON.stringify(allLayouts);
    if (!hasChanged) {
      return;
    }

    /* eslint-disable-next-line no-console */
    console.log("Layout changed, updating state:", allLayouts);

    // Validate each item to ensure it meets constraints (prevents minW warnings)
    const validatedLayouts = { ...allLayouts };
    Object.keys(validatedLayouts).forEach((breakpoint) => {
      if (validatedLayouts[breakpoint]) {
        validatedLayouts[breakpoint] = validatedLayouts[breakpoint].map((item) => {
          // Ensure minW is never greater than w
          return {
            ...item,
            minW: Math.min(item.minW || 1, item.w),
          };
        });
      }
    });

    // Create a deep copy to ensure we're not mutating references
    const layoutsCopy = JSON.parse(JSON.stringify(validatedLayouts));

    // Update internal state
    setLayouts(layoutsCopy);

    // Notify parent component if callback exists
    if (onLayoutChange) {
      onLayoutChange(layoutsCopy);
    }
  };

  // Inside the component render section, update the resizeHandle prop:
  const resizeHandleComponent = useCallback(
    (resizeHandleAxis) => <CustomResizeHandle handleAxis={resizeHandleAxis} />,
    []
  );

  return (
    <Box sx={{ height: "100%", position: "relative" }} ref={containerRef}>
      {maximizedChart ? (
        <MaximizedChart
          chartId={maximizedChart}
          data={{ financialData, projectData, countryData }}
          onClose={() => toggleMaximize(null)}
        />
      ) : mounted ? (
        <>
          {/* Dashboard Controls */}
          {editMode && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: 10,
                p: 1,
                display: "flex",
                gap: 1,
              }}
            >
              <Tooltip title={t("dashboard.saveLayout")}>
                <IconButton
                  color="primary"
                  onClick={() => {
                    if (onLayoutChange && layouts) {
                      onLayoutChange(layouts);
                    }
                  }}
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Edit Mode Indicator */}
          {editMode && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                border: (theme) => `1px dashed ${theme.palette.primary.main}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body2" color="primary">
                {t("dashboard.editModeActive")} - {t("dashboard.dragResizeEnabled")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("dashboard.dragFromCorners")}
              </Typography>
            </Box>
          )}

          <ResponsiveGridLayoutWithWidth
            className={`layout ${editMode ? "edit-mode" : ""}`}
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            onResize={onResize}
            onResizeStop={onResizeStop}
            onDrag={onDrag}
            onDragStop={onDragStop}
            onDragStart={onDragStart}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={90}
            draggableHandle=".drag-handle"
            resizeHandle={editMode ? resizeHandleComponent : null}
            resizeHandles={["se", "sw", "ne", "nw"]} // Enable all corner handles for more flexibility
            isDraggable={editMode && isDashboardReady}
            isResizable={editMode && isDashboardReady}
            // Smaller margins for better positioning accuracy
            margin={[8, 8]}
            containerPadding={[8, 8]}
            // Disable measurement before mount to avoid positioning issues
            measureBeforeMount={false}
            // Always use CSS transforms for better performance and positioning
            useCSSTransforms={isDashboardReady}
            // Disable compaction to prevent layout shifts during drag
            compactType={null}
            // Disable collision prevention for better manual positioning
            preventCollision={true}
            // Disable bounding to prevent restrictive positioning
            isBounded={false}
            // Very important for proper cursor tracking during drag/resize
            transformScale={1}
            // React-Draggable configurations for better cursor tracking
            draggableOpts={{
              // Cancel drag on specific elements to improve usability
              cancel: ".MuiCardContent-root,.MuiIconButton-root",
              // Improve grid movement smoothness
              grid: [1, 1],
              // Important for exact cursor positioning
              offsetParent: document.body,
              // Ensure the scale is set to 1 for accurate positioning
              scale: 1,
              // Add additional safety to prevent drags on unmounted elements
              enableUserSelectHack: isDashboardReady,
            }}
            // Use a stable key to prevent unnecessary re-initialization
            key={`dashboard-grid-${location.pathname}-${isDashboardReady ? "ready" : "loading"}`}
            // Pass resize start handler
            onResizeStart={onResizeStart}
          >
            {gridChildren}
          </ResponsiveGridLayoutWithWidth>
        </>
      ) : (
        // Loading state while the grid is mounting
        <Box
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Chart Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        {/* Add Card Size option */}
        <MenuItem onClick={(e) => handleSizeMenuOpen(e, activeMenu)}>
          <ListItemIcon>
            <ViewColumnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("dashboard.cardSize")} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            toggleMaximize(activeMenu);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <AspectRatioIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("dashboard.maximize")} />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("dashboard.refresh")} />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("dashboard.download")} />
        </MenuItem>
      </Menu>

      {/* Size Submenu */}
      <Menu
        anchorEl={sizeMenuAnchorEl}
        open={Boolean(sizeMenuAnchorEl)}
        onClose={handleSizeMenuClose}
        MenuListProps={{
          "aria-labelledby": "chart-size-button",
          dense: true,
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 140,
            borderRadius: 2,
            mt: 0.5,
            boxShadow: theme.shadows[4],
            "& .MuiMenuItem-root": {
              py: 1,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Size options with visual indicator for current size */}
        {activeMenu &&
          layouts &&
          (() => {
            // Get current chart size
            const currentBreakpoint = getCurrentBreakpoint();
            const currentLayout = layouts[currentBreakpoint] || [];
            const chartLayout = currentLayout.find((item) => item.i === activeMenu);

            // Get max columns for current breakpoint
            const maxCols =
              {
                lg: 12,
                md: 10,
                sm: 6,
                xs: 4,
                xxs: 2,
              }[currentBreakpoint] || 12;

            // Calculate current size ratio
            const currentRatio = chartLayout ? chartLayout.w / maxCols : 1;
            const currentSize =
              currentRatio <= 0.34 ? "1/3" : currentRatio <= 0.51 ? "1/2" : "full";

            return (
              <>
                <MenuItem
                  onClick={() => handleChangeCardSize(activeMenu, "1/3")}
                  selected={currentSize === "1/3"}
                >
                  <ListItemIcon>
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: "medium",
                        bgcolor:
                          currentSize === "1/3"
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha(theme.palette.primary.light, 0.1),
                        borderRadius: 0.5,
                        px: 1,
                        py: 0.25,
                      }}
                    >
                      1/3
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={t("dashboard.widthSmall")} />
                </MenuItem>

                <MenuItem
                  onClick={() => handleChangeCardSize(activeMenu, "1/2")}
                  selected={currentSize === "1/2"}
                >
                  <ListItemIcon>
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: "medium",
                        bgcolor:
                          currentSize === "1/2"
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha(theme.palette.primary.light, 0.1),
                        borderRadius: 0.5,
                        px: 1,
                        py: 0.25,
                      }}
                    >
                      1/2
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={t("dashboard.widthMedium")} />
                </MenuItem>

                <MenuItem
                  onClick={() => handleChangeCardSize(activeMenu, "full")}
                  selected={currentSize === "full"}
                >
                  <ListItemIcon>
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: "medium",
                        bgcolor:
                          currentSize === "full"
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha(theme.palette.primary.light, 0.1),
                        borderRadius: 0.5,
                        px: 1,
                        py: 0.25,
                      }}
                    >
                      1/1
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={t("dashboard.widthFull")} />
                </MenuItem>
              </>
            );
          })()}
      </Menu>
    </Box>
  );
}

// Add PropTypes validation for DraggableDashboard
DraggableDashboard.propTypes = {
  financialData: PropTypes.object,
  projectData: PropTypes.array,
  countryData: PropTypes.array,
  editMode: PropTypes.bool,
  onLayoutChange: PropTypes.func,
  savedLayouts: PropTypes.object,
};
