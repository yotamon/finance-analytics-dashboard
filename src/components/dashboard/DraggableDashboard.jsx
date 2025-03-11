import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
    minHeight: "800px",
    overflow: "visible",
    marginBottom: "30px",

    // Add styles for react-resizable handles
    "& .react-resizable-handle": {
      position: "absolute",
      zIndex: 2,
      opacity: 0,
      transition: "opacity 0.2s ease",
      willChange: "transform",
    },
    "& .react-grid-item:hover .react-resizable-handle": {
      opacity: 1,
    },
    // Styles for specific direction handles
    "& .react-resizable-handle-s": {
      bottom: "0",
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "s-resize",
    },
    "& .react-resizable-handle-w": {
      left: "0",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "w-resize",
    },
    "& .react-resizable-handle-e": {
      right: "0",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "e-resize",
    },
    "& .react-resizable-handle-n": {
      top: "0",
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "n-resize",
    },
    // Add critical styles to ensure the DraggableCore doesn't lose its target
    "& .react-grid-item": {
      transition: "transform 0.2s ease, width 0.2s ease, height 0.2s ease",
      willChange: "transform, width, height",
    },
    "& .react-grid-item.resizing, & .react-grid-item.react-draggable-dragging": {
      transition: "none",
      zIndex: 3,
    },
    "& .react-grid-item.resizing .react-resizable-handle, & .react-grid-item.react-draggable-dragging .react-resizable-handle":
      {
        opacity: 1,
      },
    // Add style to ensure the grid item stays in place during drag
    "& .react-grid-item.dragging": {
      zIndex: 2,
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

// Wrap ResponsiveGridLayout with WidthProvider using useMemo as recommended in the React-Grid-Layout docs
const ResponsiveGridLayoutWithWidth = React.memo((props) => {
  // Create the WidthProvider wrapper using useMemo to prevent re-renders
  const WidthProvidedLayout = useMemo(() => WidthProvider(ResponsiveGridLayout), []);

  return <WidthProvidedLayout {...props} />;
});

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

// Define a custom ResizeHandle component with proper ref forwarding for side handles
const CustomResizeHandle = React.memo(
  React.forwardRef(function CustomResizeHandle(props, ref) {
    const { handleAxis, onMouseDown, onMouseUp, onTouchEnd, style, className, ...restProps } =
      props;

    // Get axis-specific styles for centered side handles
    const getAxisSpecificStyles = () => {
      switch (handleAxis) {
        case "s": // bottom center
          return {
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "s-resize",
            width: "30px",
            height: "14px",
            backgroundColor: "rgba(25, 118, 210, 0.3)",
            borderColor: "rgba(25, 118, 210, 0.7)",
            borderRadius: "0 0 4px 4px",
          };
        case "w": // left center
          return {
            left: "-8px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "w-resize",
            width: "14px",
            height: "30px",
            backgroundColor: "rgba(25, 118, 210, 0.3)",
            borderColor: "rgba(25, 118, 210, 0.7)",
            borderRadius: "4px 0 0 4px",
          };
        case "e": // right center
          return {
            right: "-8px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "e-resize",
            width: "14px",
            height: "30px",
            backgroundColor: "rgba(25, 118, 210, 0.3)",
            borderColor: "rgba(25, 118, 210, 0.7)",
            borderRadius: "0 4px 4px 0",
          };
        case "n": // top center
          return {
            top: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "n-resize",
            width: "30px",
            height: "14px",
            backgroundColor: "rgba(25, 118, 210, 0.3)",
            borderColor: "rgba(25, 118, 210, 0.7)",
            borderRadius: "4px 4px 0 0",
          };
        default:
          return {};
      }
    };

    // Return the handle with appropriate styles for the given axis
    return (
      <div
        ref={ref}
        className={`react-resizable-handle react-resizable-handle-${handleAxis} ${className || ""}`}
        style={{
          position: "absolute",
          background: "transparent",
          border: "2px solid transparent",
          zIndex: 10,
          userSelect: "none",
          touchAction: "none",
          ...getAxisSpecificStyles(),
          ...(style || {}),
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        {...restProps}
      />
    );
  })
);

// Make sure CustomResizeHandle has a displayName for debugging
CustomResizeHandle.displayName = "CustomResizeHandle";

// Add PropTypes for better validation
CustomResizeHandle.propTypes = {
  handleAxis: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onTouchEnd: PropTypes.func,
};

// Improved GridItemWrapper with focus on proper ref forwarding for DraggableCore
const GridItemWrapper = React.forwardRef(function GridItemWrapper(props, ref) {
  const {
    children,
    style,
    className,
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    onTouchStart,
    onDragStart,
    onDragOver,
    onDragEnd,
    sx,
    ...otherProps
  } = props;

  // Use a local ref if one is not provided
  const innerRef = React.useRef(null);
  const combinedRef = useCombinedRefs(ref, innerRef);

  // Proper handling of mouse events is critical for DraggableCore
  const handleMouseDown = useCallback(
    (e) => {
      if (onMouseDown) onMouseDown(e);
      // Add a data attribute to mark active interaction
      if (combinedRef.current) {
        combinedRef.current.setAttribute("data-interacting", "true");
      }
    },
    [onMouseDown, combinedRef]
  );

  const handleMouseUp = useCallback(
    (e) => {
      if (onMouseUp) onMouseUp(e);
      // Clear the interaction marker
      if (combinedRef.current) {
        combinedRef.current.removeAttribute("data-interacting");
      }
    },
    [onMouseUp, combinedRef]
  );

  // This ensures all necessary props are passed to the DOM element
  return (
    <Paper
      ref={combinedRef}
      style={style}
      className={className}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      elevation={2}
      sx={sx}
      {...otherProps}
    >
      {children}
    </Paper>
  );
});

// Utility for combining refs - critical for proper ref forwarding
function useCombinedRefs(...refs) {
  const targetRef = React.useRef();

  React.useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

GridItemWrapper.displayName = "GridItemWrapper";

// Add PropTypes for GridItemWrapper with all the required props
GridItemWrapper.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  className: PropTypes.string,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onTouchEnd: PropTypes.func,
  onTouchStart: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDragEnd: PropTypes.func,
  sx: PropTypes.object,
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
  const location = useLocation();

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
    activeDragElement: null,
    activeResizeElement: null,
    lastDragNode: null,
  });

  // Global handler to cancel operations if components unmount during drag/resize
  useEffect(() => {
    // Function to handle any mouse up event which might indicate end of drag/resize
    const handleGlobalMouseUp = () => {
      // If we were resizing but the resize handle is gone from DOM, end resizing
      if (isResizing) {
        const activeResizeHandles = document.querySelectorAll(
          ".react-resizable-handle.react-draggable-dragging"
        );
        if (activeResizeHandles.length === 0) {
          console.log("Detected potential unmount during resize - cleaning up");
          setIsResizing(false);
          setCurrentResize(null);
          // Force a layout update by triggering resize event
          window.dispatchEvent(new Event("resize"));
        }
      }
    };

    // Add listeners
    document.addEventListener("mouseup", handleGlobalMouseUp);

    // Clean up
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isResizing]);

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

  // Handle resize event with optimized performance for better responsiveness
  const onResize = useCallback(
    (layout, oldItem, newItem, placeholder, e, element) => {
      // Skip processing if element doesn't exist in DOM
      if (!element || !document.body.contains(element)) {
        return;
      }

      // Constrain resize based on the handle being used
      const resizeHandle =
        element.className && element.className.match(/react-resizable-handle-([news])/);
      if (resizeHandle) {
        const direction = resizeHandle[1];

        // For vertical-only handles (n, s), preserve the width
        if (direction === "n" || direction === "s") {
          newItem.w = oldItem.w;
        }
        // For horizontal-only handles (e, w), preserve the height
        else if (direction === "e" || direction === "w") {
          newItem.h = oldItem.h;
        }
      }

      // Find the element being resized for direct DOM manipulation
      const el = document.querySelector(`[data-grid-id="${newItem.i}"]`);
      if (el) {
        el.style.zIndex = "1000";
        el.style.transition = "none"; // Disable transitions during resize
        el.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
      }

      // Throttle state updates for better performance during rapid resize
      if (!currentResize || Date.now() - (currentResize.timestamp || 0) > 60) {
        setCurrentResize({
          chartId: newItem.i,
          w: newItem.w,
          h: newItem.h,
          timestamp: Date.now(),
        });
      }
    },
    [currentResize]
  );

  // Handle resize start with proper DOM checks
  const onResizeStart = useCallback(
    (layout, oldItem, newItem, placeholder, e, element) => {
      // Skip if dashboard isn't ready
      if (!isDashboardReady) {
        console.log("Preventing resize: Dashboard not fully ready");
        if (e && e.preventDefault) e.preventDefault();
        return false;
      }

      // Essential: Ensure element is actually in the DOM before proceeding
      if (!element || !document.body.contains(element)) {
        console.log("Preventing resize: Element not in DOM");
        if (e && e.preventDefault) e.preventDefault();
        return false;
      }

      // Store element reference to track during resize
      gridStabilityRef.current.activeResizeId = oldItem.i;
      gridStabilityRef.current.activeResizeElement = element;

      // Mark element with data attribute and class
      element.setAttribute("data-resize-active", "true");

      // Add resize indicators to grid item
      const gridItem = element.closest(".react-grid-item");
      if (gridItem) {
        gridItem.classList.add("being-resized", "resizing");
        gridItem.setAttribute("data-resize-id", oldItem.i);

        // Force a reflow to ensure classes are applied
        void gridItem.offsetHeight;
      }

      setIsResizing(true);
      return true;
    },
    [isDashboardReady]
  );

  // Handle resize stop with proper cleanup
  const onResizeStop = useCallback(
    (layout, oldItem, newItem, placeholder, e, element) => {
      // Find the element and clean up styling
      const el = document.querySelector(`[data-grid-id="${newItem.i}"]`);
      if (el) {
        el.classList.remove("actively-resizing", "resizing");

        // Use requestAnimationFrame for smooth transition back
        requestAnimationFrame(() => {
          el.style.boxShadow = "";
          el.style.zIndex = "";
          el.style.transition = "all 0.15s ease-out";
        });
      }

      // Update layouts
      const newLayouts = JSON.parse(JSON.stringify(layouts));
      const currentBreakpoint = getCurrentBreakpoint();

      if (newLayouts[currentBreakpoint]) {
        const itemIndex = newLayouts[currentBreakpoint].findIndex((item) => item.i === newItem.i);

        if (itemIndex !== -1) {
          // Update width and height
          newLayouts[currentBreakpoint][itemIndex] = {
            ...newLayouts[currentBreakpoint][itemIndex],
            w: newItem.w,
            h: newItem.h,
            minW: Math.min(newLayouts[currentBreakpoint][itemIndex].minW || 1, newItem.w),
          };

          setLayouts(newLayouts);

          // Notify parent if callback provided
          if (onLayoutChange) {
            setTimeout(() => onLayoutChange(newLayouts), 50);
          }
        }
      }

      // Reset state
      setCurrentResize(null);
      setIsResizing(false);

      // Force redraw of charts
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
      });
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

  // Handle drag start with better DOM checking
  const onDragStart = useCallback(
    (layout, oldItem, newItem, placeholder, e, element) => {
      // Skip if the component isn't fully ready
      if (!isDashboardReady) {
        console.log("Preventing drag: Dashboard not fully ready");
        if (e && e.preventDefault) e.preventDefault();
        return false;
      }

      // Critical: Verify element exists and is in DOM before proceeding
      if (!element || !document.body.contains(element)) {
        console.log("Preventing drag: Element not in DOM");
        if (e && e.preventDefault) e.preventDefault();
        return false;
      }

      // Store a reference to the dragging element to prevent issues with unmounting
      const gridItem = element.closest(".react-grid-item");
      if (gridItem) {
        // Store the element ID to help track it
        gridStabilityRef.current.activeDragId = oldItem.i;

        // Add classes to mark element as being dragged
        gridItem.classList.add("dragging");
        gridItem.setAttribute("data-dragging-id", oldItem.i);

        // Force a reflow to ensure the class is applied before drag starts
        void gridItem.offsetHeight;
      }

      setIsResizing(true);
      return true;
    },
    [isDashboardReady]
  );

  // Add cleanup effect specifically for drag operations
  useEffect(() => {
    // Function to clean up any abandoned drag operations
    const cleanup = () => {
      // Find all elements with drag-related classes
      document
        .querySelectorAll(
          ".react-draggable-dragging, .resizing, .dragging, .being-resized, .actively-resizing"
        )
        .forEach((el) => {
          el.classList.remove("react-draggable-dragging");
          el.classList.remove("resizing");
          el.classList.remove("dragging");
          el.classList.remove("being-resized");
          el.classList.remove("actively-resizing");
          el.removeAttribute("data-resize-id");
          el.removeAttribute("data-dragging-id");
          el.removeAttribute("data-resize-active");

          // Reset any inline styles that might interfere with normal rendering
          el.style.transform = "";
          el.style.transition = "";
          el.style.zIndex = "";
        });

      // Clear any resize state
      setIsResizing(false);
      setCurrentResize(null);
    };

    // Set up event listener for page visibility changes
    // This helps recover from errors when the user switches tabs/windows
    document.addEventListener("visibilitychange", cleanup);

    // Clean up on unmount
    return () => {
      document.removeEventListener("visibilitychange", cleanup);
      cleanup();
    };
  }, []);

  // Enhanced gridStabilityRef to track more state
  useEffect(() => {
    // Reset readiness when route or key props change
    setIsDashboardReady(false);
    gridStabilityRef.current = {
      attemptCount: 0,
      isFullyReady: false,
      isMounted: false,
      activeDragElement: null,
      activeResizeElement: null,
      lastDragNode: null,
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
    }, 400);

    // Step 3: Mark the dashboard as fully ready only after everything else is stable
    const readyTimer = setTimeout(() => {
      if (isMounted && gridStabilityRef.current.isMounted) {
        setIsDashboardReady(true);
        gridStabilityRef.current.isFullyReady = true;
        console.log("Dashboard is now fully ready for interactions");
      }
    }, 800);

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
        activeDragElement: null,
        activeResizeElement: null,
        lastDragNode: null,
      };

      // Cancel any ongoing resize/drag operations when unmounting
      setIsResizing(false);
      setCurrentResize(null);

      // Find and clean up any actively resizing elements
      document
        .querySelectorAll(
          ".react-draggable-dragging, .resizing, .dragging, .being-resized, .actively-resizing"
        )
        .forEach((el) => {
          el.classList.remove("react-draggable-dragging");
          el.classList.remove("resizing");
          el.classList.remove("dragging");
          el.classList.remove("being-resized");
          el.classList.remove("actively-resizing");
          el.style.cursor = "";
          el.style.zIndex = "";
        });
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

  // Inside the component, implement a memoized resize handle component
  const resizeHandleComponent = useCallback(
    (handleAxis) => <CustomResizeHandle handleAxis={handleAxis} />,
    []
  );

  // Cleanup function to reset any lingering resize/drag states
  const cleanupResizeStates = useCallback(() => {
    document
      .querySelectorAll(
        ".react-draggable-dragging, .react-resizable-resizing, .actively-resizing, .dragging, .being-resized"
      )
      .forEach((el) => {
        el.classList.remove("react-draggable-dragging");
        el.classList.remove("react-resizable-resizing");
        el.classList.remove("actively-resizing");
        el.classList.remove("dragging");
        el.classList.remove("being-resized");
        el.style.zIndex = "";
        el.style.transition = "";
      });

    setIsResizing(false);
    setCurrentResize(null);
  }, []);

  // Add an effect to clean up on unmount or when visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        cleanupResizeStates();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cleanupResizeStates();
    };
  }, [cleanupResizeStates]);

  // Improved draggableOpts with safer node handling
  const draggableOpts = useMemo(
    () => ({
      cancel: ".MuiCardContent-root,.MuiIconButton-root",
      grid: [1, 1],
      offsetParent: document.body,
      scale: 1,
      enableUserSelectHack: isDashboardReady,
      // Critical for DraggableCore: Validate node before drag starts
      onStart: (e, ui) => {
        // Verify node exists and is in DOM
        if (!ui || !ui.node || !document.body.contains(ui.node)) {
          console.log("Cancelling drag - component not in DOM");
          if (e && e.preventDefault) e.preventDefault();
          return false;
        }

        // Store ref to node for cleanup if needed
        gridStabilityRef.current.lastDragNode = ui.node;

        // Tag node to track it
        ui.node.setAttribute("data-dragging", "true");

        return true;
      },
      // Handle drag stop properly
      onStop: (e, ui) => {
        if (ui && ui.node) {
          // Clear dragging marker
          ui.node.removeAttribute("data-dragging");
        }

        // Clear stored reference
        gridStabilityRef.current.lastDragNode = null;

        return true;
      },
    }),
    [isDashboardReady]
  );

  // Use useMemo for grid children to prevent unnecessary re-renders
  const gridChildren = useMemo(() => {
    return activeCharts.map((chartId) => (
      <GridItemWrapper
        key={chartId}
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
      </GridItemWrapper>
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
    renderChart,
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

  // Reset all active drag/resize operations when unmounting
  useEffect(() => {
    return () => {
      // Cleanup any active drag operations on unmount
      const activeElements = document.querySelectorAll(
        ".react-draggable-dragging, .react-resizable-resizing, .actively-resizing, .dragging"
      );

      activeElements.forEach((el) => {
        el.classList.remove("react-draggable-dragging");
        el.classList.remove("react-resizable-resizing");
        el.classList.remove("actively-resizing");
        el.classList.remove("dragging");
      });
    };
  }, []);

  // Enhanced cleanup function that handles all drag/resize artifacts
  const cleanup = useCallback(() => {
    // Find all elements with drag-related classes
    document
      .querySelectorAll(
        ".react-draggable-dragging, .resizing, .dragging, .being-resized, .actively-resizing, .react-resizable-resizing"
      )
      .forEach((el) => {
        // Remove all drag/resize related classes
        el.classList.remove("react-draggable-dragging");
        el.classList.remove("react-resizable-resizing");
        el.classList.remove("actively-resizing");
        el.classList.remove("dragging");
        el.classList.remove("being-resized");
        el.classList.remove("resizing");

        // Remove any drag/resize data attributes
        el.removeAttribute("data-resize-id");
        el.removeAttribute("data-dragging-id");
        el.removeAttribute("data-resize-active");
        el.removeAttribute("data-dragging");
        el.removeAttribute("data-interacting");

        // Reset critical inline styles that might interfere
        el.style.transform = "";
        el.style.transition = "";
        el.style.zIndex = "";
      });

    // Reset state
    setIsResizing(false);
    setCurrentResize(null);
  }, []);

  // Enhanced useEffect for stability initialization
  useEffect(() => {
    // Reset readiness when route or key props change
    setIsDashboardReady(false);
    gridStabilityRef.current = {
      attemptCount: 0,
      isFullyReady: false,
      isMounted: false,
      activeDragId: null,
      activeResizeId: null,
      activeResizeElement: null,
      lastDragNode: null,
    };

    let isMounted = true;

    // Handle potential window focus/blur issues
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Browser tab is hidden or unfocused - clean up any ongoing operations
        cleanup();
      }
    };

    // Improved two-stage mounting process
    const mountTimer = setTimeout(() => {
      if (isMounted) {
        setMounted(true);
        gridStabilityRef.current.isMounted = true;
      }
    }, 200);

    const readyTimer = setTimeout(() => {
      if (isMounted && gridStabilityRef.current.isMounted) {
        // Force a layout refresh to ensure everything is calculated
        window.dispatchEvent(new Event("resize"));

        // Mark as fully ready
        setIsDashboardReady(true);
        gridStabilityRef.current.isFullyReady = true;

        console.log("Dashboard is now fully ready for interactions");
      }
    }, 800);

    // Add visibility event listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up
    return () => {
      isMounted = false;
      clearTimeout(mountTimer);
      clearTimeout(readyTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Reset stability tracking
      gridStabilityRef.current = {
        attemptCount: 0,
        isFullyReady: false,
        isMounted: false,
        activeDragId: null,
        activeResizeId: null,
        activeResizeElement: null,
        lastDragNode: null,
      };

      // Full cleanup on unmount
      cleanup();
    };
  }, [location.pathname, cleanup]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        height: "100%",
        mt: 1,
        zIndex: 0,
      }}
    >
      {maximizedChart ? (
        <MaximizedChart
          chartId={maximizedChart}
          data={{ financialData, projectData, countryData }}
          onClose={() => toggleMaximize(null)}
        />
      ) : mounted ? (
        <>
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
            resizeHandles={["s", "w", "e", "n"]}
            isDraggable={editMode && isDashboardReady}
            isResizable={editMode && isDashboardReady}
            margin={[8, 8]}
            containerPadding={[8, 8]}
            measureBeforeMount={false}
            useCSSTransforms={isDashboardReady}
            compactType={null}
            preventCollision={true}
            isBounded={false}
            transformScale={1}
            draggableOpts={draggableOpts}
            key={`dashboard-grid-${location.pathname}-${isDashboardReady ? "ready" : "loading"}`}
            onResizeStart={onResizeStart}
          >
            {gridChildren}
          </ResponsiveGridLayoutWithWidth>
        </>
      ) : (
        // Loading state
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
