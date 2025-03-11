import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
  RefObject,
} from "react";
import {
  Responsive as ResponsiveGridLayout,
  WidthProvider,
  Layout,
  Layouts,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  useTheme as useMuiTheme,
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
import { useTheme } from "../../context/ThemeContext";
import useRenderTracker from "../../hooks/useRenderTracker";
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
import { alpha, Theme } from "@mui/material/styles";
import { debounce } from "lodash";
import { useLocation } from "react-router-dom";
import { TransitionProps } from "@mui/material/transitions";
import ChartAdapter from "../debug/ChartAdapter";
import ErrorBoundary from "../debug/ErrorBoundary";

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
// Import ChartContainer
import ChartContainer from "./ChartContainer";

// Import shared types
import { DraggableDashboardProps, ChartSize, GridStabilityRef } from "../../types/dashboard";

// Define types for break points and columns
interface BreakpointsType {
  lg: number;
  md: number;
  sm: number;
  xs: number;
  xxs: number;
}

interface ColsType {
  lg: number;
  md: number;
  sm: number;
  xs: number;
  xxs: number;
}

// Define chart info type
interface ChartInfo {
  id: string;
  title: string;
  icon: JSX.Element;
  description: string;
  component: (props: any) => JSX.Element;
  defaultWidth?: number;
  defaultHeight?: string;
  containerProps?: Record<string, any>;
}

// Define chart size type that combines height options
// type ChartSize = "1/3" | "1/2" | "full" | ContainerChartHeight;

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
      padding: "6px", // Add padding around all grid items
    },
    "& .react-grid-item.resizing, & .react-grid-item.react-draggable-dragging": {
      transition: "none",
      zIndex: 30,
      cursor: "grabbing",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
    },
    "& .react-grid-item.resizing .react-resizable-handle, & .react-grid-item.react-draggable-dragging .react-resizable-handle":
      {
        opacity: 1,
      },
    // Add style to ensure the grid item stays in place during drag
    "& .react-grid-item.dragging": {
      zIndex: 20,
    },
    // Edit mode indicator styles
    "& .grid-item-edit-mode .drag-handle": {
      cursor: "grab",
      position: "relative",
    },
    // Add a subtle indicator for drag handle in edit mode
    "& .grid-item-edit-mode .drag-handle::after": {
      content: '""',
      position: "absolute",
      right: "8px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "30px",
      height: "6px",
      background:
        "repeating-linear-gradient(90deg, currentColor, currentColor 2px, transparent 2px, transparent 6px)",
      opacity: 0.3,
      borderRadius: "3px",
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
    background: (theme: Theme) => theme.palette.background.paper,
    // Add a gradient line at the top similar to ProjectTableCard
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "4px",
      background: (theme: Theme) =>
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
    color: (theme: Theme) => theme.palette.primary.main,
    backgroundColor: (theme: Theme) => alpha(theme.palette.primary.light, 0.2),
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.05)",
      backgroundColor: (theme: Theme) => alpha(theme.palette.primary.light, 0.3),
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
    background: (theme: Theme) => alpha(theme.palette.primary.main, 0.2),
    border: (theme: Theme) => `2px solid ${theme.palette.primary.main}`,
    borderRadius: "50%",
    zIndex: 10,
    transition: "opacity 0.2s ease, transform 0.2s ease, background 0.2s ease",
    opacity: 0,
    "&:hover": {
      opacity: "1 !important",
      transform: "scale(1.2)",
      background: (theme: Theme) => alpha(theme.palette.primary.main, 0.4),
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

// Type-safe version of the Transition component
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Create a type-safe resize handle component
interface CustomResizeHandleProps {
  handleAxis: string;
  [key: string]: any;
}

const CustomResizeHandle = React.forwardRef<HTMLDivElement, CustomResizeHandleProps>(
  ({ handleAxis, ...rest }, ref) => {
    // Create an axis-specific style function
    const getAxisSpecificStyles = () => {
      // Apply custom styles based on the handle axis
      return {
        // Common styles
        width: "20px",
        height: "20px",
        position: "absolute" as const,
        cursor: handleAxis === "s" ? "s-resize" : handleAxis === "e" ? "e-resize" : "se-resize",
      };
    };

    return (
      <div
        ref={ref}
        className={`react-resizable-handle react-resizable-handle-${handleAxis}`}
        {...rest}
        style={getAxisSpecificStyles()}
      />
    );
  }
);

// Type for the GridItemWrapper props
interface GridItemWrapperProps {
  children: ReactNode;
  className?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  sx?: object;
}

// Type-safe version of the GridItemWrapper component
const GridItemWrapper = React.forwardRef<HTMLDivElement, GridItemWrapperProps>(
  function GridItemWrapper(props, ref) {
    const { children, className, ...rest } = props;
    const theme = useTheme();

    return (
      <Box
        ref={ref}
        className={className}
        {...rest}
        sx={{
          height: "100%",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2, // Add border radius to the wrapper
          transition: "all 0.2s ease",
          // No border/shadow needed here as the ChartContainer provides them
          ...(props.sx || {}),
        }}
      >
        {children}
      </Box>
    );
  }
);

function useCombinedRefs<T>(...refs: Array<React.Ref<T> | null | undefined>) {
  const targetRef = useRef<T>(null);

  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        (ref as React.MutableRefObject<T | null>).current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

// Create the enhanced grid layout component once at module level
const EnhancedResponsiveGridLayout = WidthProvider(ResponsiveGridLayout);

// Wrap ResponsiveGridLayout with WidthProvider
const ResponsiveGridLayoutWithWidth = (props: any) => {
  return <EnhancedResponsiveGridLayout {...props} />;
};

// Define the main component
export default function DraggableDashboard({
  financialData,
  projectData,
  countryData,
  editMode = false,
  onLayoutChange,
  savedLayouts = null,
}: DraggableDashboardProps) {
  const { mode } = useTheme();
  const muiTheme = useMuiTheme();
  const isDarkMode = mode === "dark";
  const { t } = useI18n();
  const location = useLocation();

  // Add render tracker to help debug rendering issues
  useRenderTracker("DraggableDashboard");

  // Define breakpoints and columns with TypeScript types
  const BREAKPOINTS: BreakpointsType = {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0,
  };

  const COLS: ColsType = {
    lg: 12,
    md: 10,
    sm: 6,
    xs: 4,
    xxs: 2,
  };

  // Default layouts for dashboard charts
  const DEFAULT_LAYOUTS: Layouts = {
    lg: [
      { i: "revenue-ebitda", x: 0, y: 0, w: 6, h: 5 },
      { i: "project-portfolio", x: 6, y: 0, w: 6, h: 5 },
      { i: "project-type", x: 0, y: 5, w: 3, h: 5 },
      { i: "investment-returns", x: 3, y: 5, w: 5, h: 5 },
      { i: "ebitda-margin", x: 8, y: 5, w: 4, h: 5 },
      { i: "country-comparison", x: 0, y: 10, w: 7, h: 5 },
      { i: "geographic-map", x: 7, y: 10, w: 5, h: 5 },
    ],
    md: [
      { i: "revenue-ebitda", x: 0, y: 0, w: 5, h: 5 },
      { i: "project-portfolio", x: 5, y: 0, w: 5, h: 5 },
      { i: "project-type", x: 0, y: 5, w: 4, h: 5 },
      { i: "investment-returns", x: 4, y: 5, w: 6, h: 5 },
      { i: "ebitda-margin", x: 0, y: 10, w: 5, h: 5 },
      { i: "country-comparison", x: 5, y: 10, w: 5, h: 5 },
      { i: "geographic-map", x: 0, y: 15, w: 10, h: 5 },
    ],
    sm: [
      { i: "revenue-ebitda", x: 0, y: 0, w: 6, h: 5 },
      { i: "project-portfolio", x: 0, y: 5, w: 6, h: 5 },
      { i: "project-type", x: 0, y: 10, w: 6, h: 5 },
      { i: "investment-returns", x: 0, y: 15, w: 6, h: 5 },
      { i: "ebitda-margin", x: 0, y: 20, w: 6, h: 5 },
      { i: "country-comparison", x: 0, y: 25, w: 6, h: 5 },
      { i: "geographic-map", x: 0, y: 30, w: 6, h: 5 },
    ],
    xs: [
      { i: "revenue-ebitda", x: 0, y: 0, w: 4, h: 5 },
      { i: "project-portfolio", x: 0, y: 5, w: 4, h: 5 },
      { i: "project-type", x: 0, y: 10, w: 4, h: 5 },
      { i: "investment-returns", x: 0, y: 15, w: 4, h: 5 },
      { i: "ebitda-margin", x: 0, y: 20, w: 4, h: 5 },
      { i: "country-comparison", x: 0, y: 25, w: 4, h: 5 },
      { i: "geographic-map", x: 0, y: 30, w: 4, h: 5 },
    ],
    xxs: [
      { i: "revenue-ebitda", x: 0, y: 0, w: 2, h: 5 },
      { i: "project-portfolio", x: 0, y: 5, w: 2, h: 5 },
      { i: "project-type", x: 0, y: 10, w: 2, h: 5 },
      { i: "investment-returns", x: 0, y: 15, w: 2, h: 5 },
      { i: "ebitda-margin", x: 0, y: 20, w: 2, h: 5 },
      { i: "country-comparison", x: 0, y: 25, w: 2, h: 5 },
      { i: "geographic-map", x: 0, y: 30, w: 2, h: 5 },
    ],
  };

  // Initialize with savedLayouts if provided, otherwise use defaults
  // Use useState with callback to ensure proper initial state
  const [layouts, setLayouts] = useState<Layouts>(() => {
    if (savedLayouts && Object.keys(savedLayouts).length > 0) {
      // eslint-disable-next-line no-console
      console.log("Initializing with savedLayouts:", savedLayouts);
      return savedLayouts;
    }
    // eslint-disable-next-line no-console
    console.log("Using DEFAULT_LAYOUTS");
    return DEFAULT_LAYOUTS;
  });

  const [maximizedChart, setMaximizedChart] = useState<string | null>(null);
  const [activeCharts, setActiveCharts] = useState<string[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  // Add state to track the complete readiness of the dashboard
  const [isDashboardReady, setIsDashboardReady] = useState<boolean>(false);

  // Menu state for chart options
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Add state for size submenu
  const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Track resize operations
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Add a useWidth hook to get the container width
  const containerRef = useRef<HTMLDivElement>(null);

  // Add state for current resize dimensions
  const [currentResize, setCurrentResize] = useState<any>(null);

  // Reference to track grid stability
  const gridStabilityRef = useRef<GridStabilityRef>({
    attemptCount: 0,
    isFullyReady: false,
    isMounted: false,
    activeDragElement: null,
    activeResizeElement: null,
    lastDragNode: null,
  });

  // Initialization state ref to track initialization status
  const initializationStateRef = useRef({ initialized: false });

  // Track chart sizes
  const [chartSizes, setChartSizes] = useState<Record<string, ChartSize>>({});

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
          // eslint-disable-next-line no-console
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

  // Enhanced gridStabilityRef to track more state
  useEffect(() => {
    // Declare timers at the top level of the effect for proper cleanup
    let mountTimer: ReturnType<typeof setTimeout>;
    let prepTimer: ReturnType<typeof setTimeout>;
    let verifyTimer: ReturnType<typeof setTimeout>;
    let readyTimer: ReturnType<typeof setTimeout>;

    // Reset readiness when route or key props change
    if (!initializationStateRef.current.initialized) {
      gridStabilityRef.current = {
        attemptCount: 0,
        isFullyReady: false,
        isMounted: false,
        activeDragElement: null,
        activeResizeElement: null,
        lastDragNode: null,
      };
    }

    let isMounted = true;

    // Setup sequence - define all timers unconditionally to follow React Rules of Hooks
    // but only execute logic if not initialized

    // Step 1: Mark component as mounted
    mountTimer = setTimeout(() => {
      if (isMounted && !initializationStateRef.current.initialized) {
        setMounted(true);
        gridStabilityRef.current.isMounted = true;
      }
    }, 200);

    // Step 2: Prepare the layout calculations with a delay
    prepTimer = setTimeout(() => {
      if (
        isMounted &&
        gridStabilityRef.current.isMounted &&
        !initializationStateRef.current.initialized
      ) {
        // Force a layout refresh to ensure everything is properly calculated
        window.dispatchEvent(new Event("resize"));
        gridStabilityRef.current.attemptCount++;
      }
    }, 400);

    // Step 3: Verify that all DraggableCore elements are properly mounted
    verifyTimer = setTimeout(() => {
      if (
        isMounted &&
        gridStabilityRef.current.isMounted &&
        !initializationStateRef.current.initialized
      ) {
        // Check if all necessary components are in the DOM
        const allItemsReady = document.querySelectorAll(".react-grid-item").length > 0;
        const allDraggablesReady = document.querySelectorAll(".react-draggable").length > 0;

        if (!allItemsReady || !allDraggablesReady) {
          // If not all components are ready, force another refresh
          // eslint-disable-next-line no-console
          console.log("Not all grid components are ready, refreshing...");
          window.dispatchEvent(new Event("resize"));
          // This may help re-trigger the component mounting process without causing full re-render
          if (containerRef.current) {
            containerRef.current.style.opacity = "0.99";
            setTimeout(() => {
              if (containerRef.current) containerRef.current.style.opacity = "1";
            }, 10);
          }
        }
      }
    }, 600);

    // Step 4: Mark the dashboard as fully ready only after everything else is stable
    readyTimer = setTimeout(() => {
      if (isMounted && !initializationStateRef.current.initialized) {
        setIsDashboardReady(true);
        gridStabilityRef.current.isFullyReady = true;
        initializationStateRef.current.initialized = true;
        // eslint-disable-next-line no-console
        console.log("Dashboard is now fully ready for interactions");
      }
    }, 800);

    return () => {
      isMounted = false;

      // Always clear timers regardless of initialization state
      clearTimeout(mountTimer);
      clearTimeout(prepTimer);
      clearTimeout(verifyTimer);
      clearTimeout(readyTimer);

      // Reset the stability tracking only if we're fully unmounting, not just updating
      if (!initializationStateRef.current.initialized) {
        gridStabilityRef.current = {
          attemptCount: 0,
          isFullyReady: false,
          isMounted: false,
          activeDragElement: null,
          activeResizeElement: null,
          lastDragNode: null,
        };
      }

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
          (el as HTMLElement).style.cursor = "";
          (el as HTMLElement).style.zIndex = "";
        });
    };
  }, []);

  // Set up available chart components
  const CHART_REGISTRY: Record<string, any> = {
    "revenue-ebitda": RevenueEbitdaChart,
    "project-portfolio": ProjectPortfolioChart,
    "project-type": ProjectTypeChart,
    "investment-returns": InvestmentReturnsChart,
    "ebitda-margin": EbitdaMarginChart,
    "country-comparison": CountryComparisonChart,
    "geographic-map": GeographicMap,
    "project-table": ProjectTableCard,
    // Add new charts
    "cash-flow-sankey": CashFlowSankey,
    "metrics-heatmap": MetricsHeatMap,
    "correlation-matrix": CorrelationMatrix,
  };

  // Chart configuration
  const CHART_INFO: Record<string, ChartInfo> = {
    "revenue-ebitda": {
      id: "revenue-ebitda",
      title: t("charts.revenueEbitda.title"),
      icon: <BarChartIcon />,
      description: t("charts.revenueEbitda.description"),
      component: (props) => <RevenueEbitdaChart data={financialData} {...props} />,
    },
    "project-portfolio": {
      id: "project-portfolio",
      title: t("charts.portfolioOverview.title"),
      icon: <PieChartIcon />,
      description: t("charts.portfolioOverview.description"),
      component: (props) => <ProjectPortfolioChart data={projectData} {...props} />,
    },
    "project-type": {
      id: "project-type",
      title: t("charts.projectType.title"),
      icon: <BubbleChartIcon />,
      description: t("charts.projectType.description"),
      component: (props) => <ProjectTypeChart data={projectData} {...props} />,
    },
    "investment-returns": {
      id: "investment-returns",
      title: t("charts.investmentReturns.title"),
      icon: <ShowChartIcon />,
      description: t("charts.investmentReturns.description"),
      component: (props) => <InvestmentReturnsChart data={financialData} {...props} />,
    },
    "ebitda-margin": {
      id: "ebitda-margin",
      title: t("charts.ebitdaMargin.title"),
      icon: <TimelineIcon />,
      description: t("charts.ebitdaMargin.description"),
      component: (props) => <EbitdaMarginChart data={financialData} {...props} />,
    },
    "country-comparison": {
      id: "country-comparison",
      title: t("charts.countryComparison.title"),
      icon: <BarChartIcon />,
      description: t("charts.countryComparison.description"),
      component: (props) => <CountryComparisonChart data={countryData} {...props} />,
    },
    "geographic-map": {
      id: "geographic-map",
      title: t("charts.geographicMap.title"),
      icon: <MapIcon />,
      description: t("charts.geographicMap.description"),
      component: (props) => <GeographicMap data={countryData} {...props} />,
    },
    "project-table": {
      id: "project-table",
      title: t("charts.projectTable.title"),
      icon: <TableChartIcon />,
      description: t("charts.projectTable.description"),
      component: (props) => <ProjectTableCard {...props} inDashboard={true} />,
      defaultWidth: 12,
      defaultHeight: "lg",
      containerProps: {
        isTableContent: true,
        autoHeight: true,
      },
    },
    // Add new charts
    "cash-flow-sankey": {
      id: "cash-flow-sankey",
      title: t("charts.cashFlowSankey.title"),
      icon: <AccountTreeIcon />,
      description: t("charts.cashFlowSankey.description"),
      component: (props) => <CashFlowSankey data={financialData} {...props} />,
    },
    "metrics-heatmap": {
      id: "metrics-heatmap",
      title: t("charts.metricsHeatmap.title"),
      icon: <GridOnIcon />,
      description: t("charts.metricsHeatmap.description"),
      component: (props) => <MetricsHeatMap data={financialData} {...props} />,
    },
    "correlation-matrix": {
      id: "correlation-matrix",
      title: t("charts.correlationMatrix.title"),
      icon: <InsertChartOutlined />,
      description: t("charts.correlationMatrix.description"),
      component: (props) => <CorrelationMatrix data={financialData} {...props} />,
    },
  };

  // Create the resize handle component
  const resizeHandleComponent = useMemo(
    () => (handleAxis: string) => <CustomResizeHandle handleAxis={handleAxis} />,
    []
  );

  // Add enhanced draggable options that prevent issues with unmounted components
  const draggableOpts = useMemo(
    () => ({
      // Only allow dragging using the handle
      handle: ".drag-handle",
      // Cancel drag if target element loses focus or gets unmounted
      cancel: ".react-resizable-handle",
      // Ensure we prevent DraggableCore not mounted errors with these settings
      enableUserSelectHack: false,
      // Extend grid bounds slightly to avoid edge detection issues
      grid: [10, 10],
      // Add safety checks for unmounting during drag operations
      onStart: (e: React.MouseEvent<HTMLElement>) => {
        // Check if component is still in DOM before proceeding
        const isElementAttached = document.body.contains(e.target as HTMLElement);
        if (!isElementAttached) {
          // eslint-disable-next-line no-console
          console.log("Prevented drag on detached element");
          return false;
        }
        return true;
      },
      // Add safety before drag move happens
      onDrag: (e: React.MouseEvent<HTMLElement>) => {
        // Abort drag if element is no longer in DOM
        if (!document.body.contains(e.target as HTMLElement)) {
          // eslint-disable-next-line no-console
          console.log("Abort drag - element detached");
          return false;
        }
        return true;
      },
    }),
    []
  );

  // Get the current breakpoint based on window width
  const getCurrentBreakpoint = useCallback(() => {
    const width = window.innerWidth;
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    if (width >= BREAKPOINTS.xs) return "xs";
    return "xxs";
  }, [BREAKPOINTS]);

  // Get the visible charts from the layout
  const visibleCharts = useMemo(() => {
    // Helper function to determine breakpoint safely within this scope
    const getActiveBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS.lg) return "lg";
      if (width >= BREAKPOINTS.md) return "md";
      if (width >= BREAKPOINTS.sm) return "sm";
      if (width >= BREAKPOINTS.xs) return "xs";
      return "xxs";
    };

    // Build the list of all charts to render
    const activeBreakpoint = Object.keys(layouts).includes(getActiveBreakpoint())
      ? getActiveBreakpoint()
      : "lg";

    const currentLayouts = layouts[activeBreakpoint] || [];
    return currentLayouts.map((item) => item.i);
  }, [layouts, BREAKPOINTS]);

  // Callback when ReactGridLayout changes
  const handleLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    if (!isDashboardReady) {
      // eslint-disable-next-line no-console
      console.log("Layout changed but dashboard not ready, skipping...");
      return;
    }

    // Don't update layout during resize operations
    if (isResizing) {
      // eslint-disable-next-line no-console
      console.log("Layout changed but resize in progress, skipping...");
      return;
    }

    // Update the layouts
    setLayouts(allLayouts);

    // Notify parent
    if (onLayoutChange) {
      onLayoutChange(allLayouts);
    }
  };

  // Handle chart size change
  const handleChangeCardSize = useCallback(
    (chartId: string, size: ChartSize) => {
      const chartSizeSettings = { ...chartSizes };
      chartSizeSettings[chartId] = size;
      setChartSizes(chartSizeSettings);
    },
    [chartSizes]
  );

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

  // Hide a chart
  const handleHideChart = useCallback((chartId: string) => {
    // Update the list of active charts
    setActiveCharts((prev) => prev.filter((id) => id !== chartId));

    // Close any open menus
    setMenuAnchorEl(null);
    setActiveMenu(null);
  }, []);

  // Toggle a chart between maximized and normal state
  const toggleMaximize = useCallback((chartId: string) => {
    setMaximizedChart((prevMaximized) => (prevMaximized === chartId ? null : chartId));
    setMenuAnchorEl(null);
  }, []);

  // Menu handlers
  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, chartId: string) => {
      event.stopPropagation();
      setMenuAnchorEl(event.currentTarget);
      setActiveMenu(chartId);
    },
    []
  );

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  // Handle menu operations related to chart size
  const handleSizeMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setSizeMenuAnchorEl(event.currentTarget);
  }, []);

  const handleSizeMenuClose = useCallback(() => {
    setSizeMenuAnchorEl(null);
  }, []);

  // Get the appropriate data for each chart type
  const getChartData = (chartId: string, chartInfo: any) => {
    switch (chartId) {
      case "revenue-ebitda":
        return financialData;
      case "project-portfolio":
      case "project-type":
      case "investment-returns":
      case "ebitda-margin":
      case "project-table":
        return projectData;
      case "country-comparison":
      case "geographic-map":
        return countryData;
      case "cash-flow-sankey":
      case "metrics-heatmap":
      case "correlation-matrix":
        return financialData;
      default:
        return [];
    }
  };

  const renderChart = (chartId: string) => {
    if (!chartId) return null;

    // Get chart info from the chart registry
    const chartInfo = CHART_INFO[chartId];
    if (!chartInfo) return null;

    // Prepare props for the chart
    const selectedData = getChartData(chartId, chartInfo);

    // Determine size based on chart type for better visualization
    const getChartSizeForType = () => {
      switch (chartId) {
        case "geographic-map":
          return { width: "100%", height: "100%", minHeight: 260 };
        case "revenue-ebitda":
        case "cash-flow-sankey":
          return { width: "100%", height: "100%", minHeight: 250 };
        case "project-portfolio":
        case "project-type":
          return { width: "100%", height: "100%", minHeight: 220 };
        case "investment-returns":
        case "ebitda-margin":
        case "country-comparison":
          return { width: "100%", height: "100%", minHeight: 230 };
        case "metrics-heatmap":
        case "correlation-matrix":
          return { width: "100%", height: "100%", minHeight: 240 };
        default:
          return { width: "100%", height: "100%", minHeight: 200 };
      }
    };

    // Get optimal size for this chart
    const chartSize = getChartSizeForType();

    // Create chart props with responsive dimensions
    const chartProps = {
      data: selectedData,
      ...chartSize,
      responsive: true,
    };

    // Create chart component
    const ChartComponent = chartInfo.component;

    // Get icon component type
    const IconComponent = chartInfo.icon.type;

    return (
      <ErrorBoundary componentName={chartId}>
        <ChartContainer
          title={chartInfo.title}
          description={chartInfo.description}
          icon={IconComponent}
          onHide={() => handleHideChart(chartId)}
          onResizeCard={(size) => handleChangeCardSize(chartId, size)}
          exportFileName={`${chartId}-export`}
          exportData={selectedData}
          className="chart-container"
          minHeight={chartSize.minHeight}
          // Determine if chart needs padding based on type
          noPadding={chartId === "geographic-map" || chartId === "project-table"}
          fullWidth={true}
          disableExport={false}
        >
          <ChartAdapter chartProps={chartProps}>
            <ChartComponent {...chartProps} />
          </ChartAdapter>
        </ChartContainer>
      </ErrorBoundary>
    );
  };

  // Render the grid children
  const gridChildren = useMemo(() => {
    // Generate grid items for each chart
    if (!visibleCharts || !visibleCharts.length) {
      return [];
    }

    return visibleCharts.map((chartId) => {
      // Skip the maximized chart if we have one
      if (maximizedChart && chartId !== maximizedChart) {
        return null;
      }

      // Get chart info for menu options
      const chartInfo = CHART_INFO[chartId];
      if (!chartInfo) return null;

      return (
        <GridItemWrapper
          key={chartId}
          className={`grid-item ${editMode ? "grid-item-edit-mode" : ""}`}
        >
          {renderChart(chartId)}
        </GridItemWrapper>
      );
    });
  }, [visibleCharts, maximizedChart, renderChart, editMode]);

  // Create dashboard class name
  const dashboardClassName = `dashboard-grid ${editMode ? "edit-mode" : ""}`;

  // Return to the updated code that includes the actual dashboard content
  return (
    <Box
      data-testid="draggable-dashboard"
      className={dashboardClassName}
      ref={containerRef}
      sx={{
        ...customStyles.dashboardContainer,
        minHeight: "800px",
        // Force dimensions to be visible
        display: "block",
        width: "100%",
        // Very light gray background like in the screenshot
        backgroundColor: "#fbfbfc",
        borderRadius: 1,
        p: editMode ? 1.5 : 0, // Only add padding in edit mode
        pb: editMode ? 3 : 0, // Only add padding in edit mode
      }}
    >
      {mounted ? (
        <>
          {editMode && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                border: (theme) => `1px dashed ${theme.palette.primary.main}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" color="primary" fontWeight={500} sx={{ mr: 2 }}>
                  {t("dashboard.editModeActive")} - {t("dashboard.dragResizeEnabled")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("dashboard.dragFromCorners")}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => {
                  if (onLayoutChange) {
                    onLayoutChange(layouts);
                    // Display a notification that layout was saved
                    alert(t("dashboard.layoutSaved") || "Dashboard layout saved");
                  }
                }}
                sx={{
                  fontWeight: 500,
                  boxShadow: 1,
                  "&:hover": {
                    boxShadow: 2,
                  },
                }}
              >
                {t("dashboard.saveLayout") || "Save Layout"}
              </Button>
            </Box>
          )}

          <Box
            sx={{
              width: "100%",
              position: "relative",
              "& .react-grid-layout": {
                width: "100% !important",
              },
            }}
          >
            <ResponsiveGridLayoutWithWidth
              className={`layout ${editMode ? "edit-mode" : ""}`}
              layouts={layouts}
              onLayoutChange={handleLayoutChange}
              breakpoints={BREAKPOINTS}
              cols={COLS}
              rowHeight={70}
              draggableHandle=".drag-handle"
              resizeHandle={editMode ? resizeHandleComponent : null}
              resizeHandles={["s", "w", "e", "n"]}
              isDraggable={editMode && isDashboardReady}
              isResizable={editMode && isDashboardReady}
              margin={[14, 14]}
              containerPadding={[12, 12]}
              measureBeforeMount={false}
              useCSSTransforms={isDashboardReady}
              compactType={null}
              preventCollision={true}
              isBounded={false}
              transformScale={1}
              draggableOpts={draggableOpts}
              key={`dashboard-grid-${location.pathname}-${isDashboardReady ? "ready" : "loading"}`}
            >
              {gridChildren}
            </ResponsiveGridLayoutWithWidth>
          </Box>
        </>
      ) : (
        // Loading state
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {t("dashboard.loading")}
          </Typography>
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
        <MenuItem onClick={handleSizeMenuOpen}>
          <ListItemIcon>
            <ViewColumnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("dashboard.cardSize")} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            toggleMaximize(activeMenu!);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <AspectRatioIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("dashboard.maximize")} />
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
            boxShadow: muiTheme.shadows[4],
            "& .MuiMenuItem-root": {
              py: 1,
              "&:hover": {
                bgcolor: alpha(muiTheme.palette.primary.main, 0.08),
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Size options with visual indicator for current size */}
        <MenuItem onClick={() => handleChangeCardSize(activeMenu!, "1/3")}>
          <ListItemIcon>
            <ViewColumnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Extra Small</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleChangeCardSize(activeMenu!, "1/2")}>
          <ListItemIcon>
            <ViewColumnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Small</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleChangeCardSize(activeMenu!, "1/2")}>
          <ListItemIcon>
            <ViewColumnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Medium</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleChangeCardSize(activeMenu!, "full")}>
          <ListItemIcon>
            <ViewColumnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Large</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleChangeCardSize(activeMenu!, "full")}>
          <ListItemIcon>
            <ViewColumnIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Extra Large</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

// Define DEFAULT_LAYOUTS as a constant of the correct type
const DEFAULT_LAYOUTS: Layouts = {
  lg: [
    // Default layout for large screens
    { i: "revenue-ebitda", x: 0, y: 0, w: 6, h: 3, minW: 3, minH: 2 },
    { i: "project-portfolio", x: 6, y: 0, w: 6, h: 3, minW: 3, minH: 2 },
    { i: "project-type", x: 0, y: 3, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "investment-returns", x: 4, y: 3, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "ebitda-margin", x: 8, y: 3, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "country-comparison", x: 0, y: 6, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "geographic-map", x: 6, y: 6, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "project-table", x: 0, y: 10, w: 12, h: 4, minW: 6, minH: 3 },
    // Add new charts
    { i: "cash-flow-sankey", x: 0, y: 14, w: 12, h: 4, minW: 6, minH: 3 },
    { i: "metrics-heatmap", x: 0, y: 18, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "correlation-matrix", x: 6, y: 18, w: 6, h: 4, minW: 3, minH: 3 },
  ],
  md: [
    // Default layout for medium screens
    { i: "revenue-ebitda", x: 0, y: 0, w: 5, h: 3, minW: 3, minH: 2 },
    { i: "project-portfolio", x: 5, y: 0, w: 5, h: 3, minW: 3, minH: 2 },
    { i: "project-type", x: 0, y: 3, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "investment-returns", x: 3, y: 3, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "ebitda-margin", x: 7, y: 3, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "country-comparison", x: 0, y: 6, w: 5, h: 4, minW: 3, minH: 3 },
    { i: "geographic-map", x: 5, y: 6, w: 5, h: 4, minW: 3, minH: 3 },
    { i: "project-table", x: 0, y: 10, w: 10, h: 4, minW: 5, minH: 3 },
    // Add new charts with responsive layouts
    { i: "cash-flow-sankey", x: 0, y: 14, w: 10, h: 4, minW: 5, minH: 3 },
    { i: "metrics-heatmap", x: 0, y: 18, w: 5, h: 4, minW: 3, minH: 3 },
    { i: "correlation-matrix", x: 5, y: 18, w: 5, h: 4, minW: 3, minH: 3 },
  ],
  sm: [
    // Default layout for small screens
    { i: "revenue-ebitda", x: 0, y: 0, w: 6, h: 3, minW: 3, minH: 2 },
    { i: "project-portfolio", x: 0, y: 3, w: 6, h: 3, minW: 3, minH: 2 },
    { i: "project-type", x: 0, y: 6, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "investment-returns", x: 3, y: 6, w: 3, h: 3, minW: 2, minH: 2 },
    { i: "ebitda-margin", x: 0, y: 9, w: 6, h: 3, minW: 3, minH: 2 },
    { i: "country-comparison", x: 0, y: 12, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "geographic-map", x: 0, y: 16, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "project-table", x: 0, y: 20, w: 6, h: 4, minW: 3, minH: 3 },
    // Add new charts
    { i: "cash-flow-sankey", x: 0, y: 24, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "metrics-heatmap", x: 0, y: 28, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "correlation-matrix", x: 0, y: 32, w: 6, h: 4, minW: 3, minH: 3 },
  ],
  xs: [
    // Default layout for extra small screens
    { i: "revenue-ebitda", x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "project-portfolio", x: 0, y: 3, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "project-type", x: 0, y: 6, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "investment-returns", x: 0, y: 9, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "ebitda-margin", x: 0, y: 12, w: 4, h: 3, minW: 2, minH: 2 },
    { i: "country-comparison", x: 0, y: 15, w: 4, h: 4, minW: 2, minH: 3 },
    { i: "geographic-map", x: 0, y: 19, w: 4, h: 4, minW: 2, minH: 3 },
    { i: "project-table", x: 0, y: 23, w: 4, h: 4, minW: 2, minH: 3 },
    // Add new charts
    { i: "cash-flow-sankey", x: 0, y: 27, w: 4, h: 4, minW: 2, minH: 3 },
    { i: "metrics-heatmap", x: 0, y: 31, w: 4, h: 4, minW: 2, minH: 3 },
    { i: "correlation-matrix", x: 0, y: 35, w: 4, h: 4, minW: 2, minH: 3 },
  ],
  xxs: [
    // Default layout for extra extra small screens
    { i: "revenue-ebitda", x: 0, y: 0, w: 2, h: 3, minW: 1, minH: 2 },
    { i: "project-portfolio", x: 0, y: 3, w: 2, h: 3, minW: 1, minH: 2 },
    { i: "project-type", x: 0, y: 6, w: 2, h: 3, minW: 1, minH: 2 },
    { i: "investment-returns", x: 0, y: 9, w: 2, h: 3, minW: 1, minH: 2 },
    { i: "ebitda-margin", x: 0, y: 12, w: 2, h: 3, minW: 1, minH: 2 },
    { i: "country-comparison", x: 0, y: 15, w: 2, h: 4, minW: 1, minH: 3 },
    { i: "geographic-map", x: 0, y: 19, w: 2, h: 4, minW: 1, minH: 3 },
    { i: "project-table", x: 0, y: 23, w: 2, h: 4, minW: 1, minH: 3 },
    // Add new charts
    { i: "cash-flow-sankey", x: 0, y: 27, w: 2, h: 4, minW: 1, minH: 3 },
    { i: "metrics-heatmap", x: 0, y: 31, w: 2, h: 4, minW: 1, minH: 3 },
    { i: "correlation-matrix", x: 0, y: 35, w: 2, h: 4, minW: 1, minH: 3 },
  ],
};
