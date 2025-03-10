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
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { alpha } from "@mui/material/styles";
import PropTypes from "prop-types";
import { debounce } from "lodash";

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
  const [layouts, setLayouts] = useState(savedLayouts || DEFAULT_LAYOUTS);
  const [maximizedChart, setMaximizedChart] = useState(null);
  const [activeCharts, setActiveCharts] = useState([]);
  const [mounted, setMounted] = useState(false);

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

  // Force re-render of grid layout to reflect changes immediately
  const forceGridUpdate = () => {
    // Mark that we're forcing an update to prevent conflicts with other changes
    const wasResizing = isResizing;
    setIsResizing(true);

    // First trigger resize event to reflow charts
    window.dispatchEvent(new Event("resize"));

    // Use RAF for better performance than setTimeout
    requestAnimationFrame(() => {
      // Then force a rerender by cloning and updating layouts state
      setLayouts((prevLayouts) => {
        // Create a deep copy to ensure React detects the change
        return JSON.parse(JSON.stringify(prevLayouts));
      });

      // Reset resizing flag after a short delay to ensure full render completes
      setTimeout(() => {
        setIsResizing(wasResizing);
      }, 50);
    });
  };

  const handleChangeCardSize = (chartId, size) => {
    // Find the current layout
    const currentBreakpoint = getCurrentBreakpoint();
    const currentLayouts = layouts[currentBreakpoint] || [];

    // Find the chart in the layout
    const chartLayout = currentLayouts.find((item) => item.i === chartId);

    if (!chartLayout) {
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
  };

  // Get the current breakpoint based on window width
  const getCurrentBreakpoint = () => {
    const width = window.innerWidth;
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    if (width >= BREAKPOINTS.xs) return "xs";
    return "xxs";
  };

  // Handle size menu open
  const handleSizeMenuOpen = (event, chartId) => {
    setSizeMenuAnchorEl(event.currentTarget);
    setActiveMenu(chartId);
    // Don't close the main menu
    event.stopPropagation();
  };

  // Handle size menu close
  const handleSizeMenuClose = () => {
    setSizeMenuAnchorEl(null);
  };

  // Handle menu open
  const handleMenuOpen = (event, chartId) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMenu(chartId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveMenu(null);
  };

  // Effect to update when savedLayouts changes from parent
  useEffect(() => {
    if (savedLayouts) {
      setLayouts(savedLayouts);
    }
  }, [savedLayouts]);

  // Initialize active charts from layouts
  useEffect(() => {
    // Extract all unique chart IDs from layouts
    const chartIds = new Set();
    Object.values(layouts).forEach((layout) => {
      layout.forEach((item) => chartIds.add(item.i));
    });
    setActiveCharts(Array.from(chartIds));

    // Set mounted to true after initial render to avoid layout jumping
    setMounted(true);

    // Force layout calculation after a delay to ensure proper rendering
    const timer = setTimeout(() => {
      forceGridUpdate();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Effect to handle resize events
  useEffect(() => {
    if (!mounted) return;

    // Force layout recalculation on window resize
    const handleResize = () => {
      // Update layout after resize with deep copy to ensure React detects the change
      setTimeout(() => {
        setLayouts((prevLayouts) => JSON.parse(JSON.stringify(prevLayouts)));
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    // Force initial layout calculation after mounting
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted]);

  // Handle resize event
  const onResize = (layout, oldItem, newItem) => {
    // Mark that we're currently resizing
    setIsResizing(true);

    // Only log the resize progress without updating state during active resize
    console.log(
      `Resizing chart ${newItem.i} from ${oldItem.w}x${oldItem.h} to ${newItem.w}x${newItem.h}`
    );

    // Store the current resize dimensions for smoother updates
    setCurrentResize({
      chartId: newItem.i,
      w: newItem.w,
      h: newItem.h,
    });
  };

  // Handle when resize stops
  const onResizeStop = (layout, oldItem, newItem) => {
    console.log(
      `Resize complete for ${newItem.i} from ${oldItem.w}x${oldItem.h} to ${newItem.w}x${newItem.h}`
    );

    // Remove actively-resizing class
    const el = document.querySelector(`[data-grid-id="${newItem.i}"]`);
    if (el) {
      el.classList.remove("actively-resizing");
    }

    // Create a deep copy of the layouts
    const newLayouts = JSON.parse(JSON.stringify(layouts));
    const currentBreakpoint = getCurrentBreakpoint();

    // Find and update the item that was resized
    if (newLayouts[currentBreakpoint]) {
      const itemIndex = newLayouts[currentBreakpoint].findIndex((item) => item.i === newItem.i);

      if (itemIndex !== -1) {
        // Update the width and height
        newLayouts[currentBreakpoint][itemIndex] = {
          ...newLayouts[currentBreakpoint][itemIndex],
          w: newItem.w,
          h: newItem.h,
          // Ensure minW is not larger than the new width
          minW: Math.min(newLayouts[currentBreakpoint][itemIndex].minW || 1, newItem.w),
        };

        // Update layouts
        setLayouts(newLayouts);

        // Call onLayoutChange if provided
        if (onLayoutChange) {
          onLayoutChange(newLayouts);
        }
      }
    }

    // Clear resize state
    setCurrentResize(null);

    // Use debounced reset for better performance
    debouncedResetResizingState();
  };

  // Handle layout changes
  const handleLayoutChange = (currentLayout, allLayouts) => {
    // Skip if layouts are not valid
    if (!allLayouts || Object.keys(allLayouts).length === 0) {
      return;
    }

    // Don't update layouts during a resize operation to prevent conflicts
    if (isResizing) {
      console.log("Layout change during resize - skipping update");
      return;
    }

    // Performance optimization - compare with previous layouts
    // to avoid unnecessary updates due to minor grid recalculations
    const currentBreakpoint = getCurrentBreakpoint();
    const prevBreakpointLayouts = layouts[currentBreakpoint] || [];
    const newBreakpointLayouts = allLayouts[currentBreakpoint] || [];

    // Skip if current layout is same length and no significant changes
    if (prevBreakpointLayouts.length === newBreakpointLayouts.length) {
      const hasSignificantChanges = newBreakpointLayouts.some((newItem, index) => {
        const prevItem = prevBreakpointLayouts[index];
        if (!prevItem || prevItem.i !== newItem.i) return true;

        // Only care about meaningful position/size changes (threshold of 1 unit)
        return (
          Math.abs(prevItem.x - newItem.x) > 1 ||
          Math.abs(prevItem.y - newItem.y) > 1 ||
          Math.abs(prevItem.w - newItem.w) > 1 ||
          Math.abs(prevItem.h - newItem.h) > 1
        );
      });

      if (!hasSignificantChanges) {
        return;
      }
    }

    // Validate each item to ensure it meets constraints
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

  // Toggle maximized state for a chart
  const toggleMaximize = (chartId) => {
    setMaximizedChart(maximizedChart === chartId ? null : chartId);
  };

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
                {t(`charts.${formatChartId(chartId)}.title`)}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {t(`charts.${formatChartId(chartId)}.description`)}
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
    return id.replace(/-/g, "");
  };

  // Add dynamic CSS for resize handles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Base styles for resize handles */
      .react-resizable-handle {
        position: absolute;
        width: 20px;
        height: 20px;
        background-repeat: no-repeat;
        background-origin: content-box;
        box-sizing: border-box;
        background-image: url('data:image/svg+xml;utf8,<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="4" fill="rgba(0,0,0,0.5)"/></svg>');
        background-position: bottom right;
        padding: 0 3px 3px 0;
        opacity: 0.7;
        transition: opacity 0.3s, transform 0.2s, background-color 0.3s;
      }

      /* Hide handles when not in edit mode */
      .layout:not(.edit-mode) .react-resizable-handle {
        display: none;
      }

      /* Only show handles in edit mode */
      .layout.edit-mode .react-grid-item .react-resizable-handle {
        visibility: visible;
        opacity: 0.4;
      }

      /* Make handles visible when hovering over a grid item */
      .layout.edit-mode .react-grid-item:hover .react-resizable-handle {
        opacity: 0.8;
      }

      /* When actively resizing */
      .react-grid-item.resizing .react-resizable-handle,
      .react-grid-item.actively-resizing .react-resizable-handle {
        background-color: rgba(25, 118, 210, 0.7) !important;
        transform: scale(1.1);
        opacity: 1 !important;
      }

      /* Show a highlight around the card being resized */
      .react-grid-item.resizing,
      .react-grid-item.actively-resizing {
        z-index: 3;
        box-shadow: 0 0 10px 3px rgba(25, 118, 210, 0.4) !important;
      }

      /* Handle positions */
      .react-resizable-handle-se {
        bottom: 0;
        right: 0;
        cursor: se-resize;
      }

      .react-resizable-handle-sw {
        bottom: 0;
        left: 0;
        cursor: sw-resize;
      }

      .react-resizable-handle-nw {
        top: 0;
        left: 0;
        cursor: nw-resize;
      }

      .react-resizable-handle-ne {
        top: 0;
        right: 0;
        cursor: ne-resize;
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

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
        }}
        data-grid-id={chartId}
      >
        {/* Chart Title Bar */}
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  mr: 1.5,
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.light, 0.2),
                  width: 32,
                  height: 32,
                }}
                variant="rounded"
              >
                {CHART_ICONS[chartId]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  {t(`charts.${formatChartId(chartId)}.title`)}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {t(`charts.${formatChartId(chartId)}.description`)}
                </Typography>
              </Box>
            </Box>
          }
          action={
            <Box sx={{ display: "flex" }}>
              {editMode && (
                <Tooltip title={t("dashboard.drag")}>
                  <IconButton
                    size="small"
                    sx={{ color: theme.palette.text.secondary, opacity: 0.7 }}
                  >
                    <DragIndicator fontSize="small" className="drag-handle" />
                  </IconButton>
                </Tooltip>
              )}

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

  return (
    <Box sx={customStyles.dashboardContainer} ref={containerRef}>
      {maximizedChart ? (
        <MaximizedChart
          chartId={maximizedChart}
          data={{ financialData, projectData, countryData }}
          onClose={() => toggleMaximize(null)}
        />
      ) : (
        <>
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

          {/* Render a hidden div that updates when mounted to force layout recalculation */}
          <Box sx={{ display: "none" }}>{mounted ? "mounted" : "not-mounted"}</Box>

          <ResponsiveGridLayoutWithWidth
            className={`layout ${editMode ? "edit-mode" : ""}`}
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            onResize={onResize}
            onResizeStop={onResizeStop}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={90}
            draggableHandle=".drag-handle"
            resizeHandle={editMode ? undefined : null}
            isDraggable={editMode}
            isResizable={editMode}
            margin={[12, 12]}
            containerPadding={[12, 12]}
            measureBeforeMount={false}
            useCSSTransforms={mounted}
            compactType="vertical"
            preventCollision={false}
            isBounded={true}
            allowOverlap={false}
            // Add optimization for resize performance
            transformScale={1}
            // Use a memoized key that includes isResizing to prevent unnecessary rerenders
            key={`grid-${mounted ? "mounted" : "unmounting"}-${isResizing ? "resizing" : "idle"}-${
              Object.keys(layouts).length
            }`}
            // Validate width constraints during resize to prevent errors
            onResizeStart={(layout, oldItem, newItem, placeholder, e, element) => {
              // Set minConstraints dynamically to avoid constraint warnings
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
              setIsResizing(true);
            }}
          >
            {gridChildren}
          </ResponsiveGridLayoutWithWidth>
        </>
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
