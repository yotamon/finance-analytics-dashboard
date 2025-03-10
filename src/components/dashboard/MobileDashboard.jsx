import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  useTheme,
  Tabs,
  Tab,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Checkbox,
  FormControlLabel,
  Button,
  SwipeableDrawer,
  useMediaQuery,
  ListItemButton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../../context/I18nContext";
import {
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Map as MapIcon,
  Timeline as TimelineIcon,
  FilterList as FilterListIcon,
  Settings as SettingsIcon,
  SwapVert as SwapVertIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// Import chart components
import { RevenueEbitdaChart } from "../charts/RevenueEbitdaChart";
import { ProjectPortfolioChart } from "../charts/ProjectPortfolioChart";
import { ProjectTypeChart } from "../charts/ProjectTypeChart";
import { InvestmentReturnsChart } from "../charts/InvestmentReturnsChart";
import { EbitdaMarginChart } from "../charts/EbitdaMarginChart";
import { CountryComparisonChart } from "../charts/CountryComparisonChart";
import { GeographicMap } from "../charts/GeographicMap";
import CashFlowSankey from "../charts/CashFlowSankey";
import MetricsHeatMap from "../charts/MetricsHeatMap";
import CorrelationMatrix from "../charts/CorrelationMatrix";
import KpiContainer from "./KpiContainer";

const CHART_COMPONENTS = {
  "revenue-ebitda": {
    component: RevenueEbitdaChart,
    icon: TrendingUpIcon,
    name: "Revenue & EBITDA",
  },
  "project-portfolio": {
    component: ProjectPortfolioChart,
    icon: BarChartIcon,
    name: "Portfolio Overview",
  },
  "project-type": {
    component: ProjectTypeChart,
    icon: PieChartIcon,
    name: "Project Types",
  },
  "geographic-map": {
    component: GeographicMap,
    icon: MapIcon,
    name: "Map",
  },
  "cash-flow-sankey": {
    component: CashFlowSankey,
    icon: SwapVertIcon,
    name: "Cash Flow",
  },
  "investment-returns": {
    component: InvestmentReturnsChart,
    icon: TrendingUpIcon,
    name: "Returns",
  },
  "ebitda-margin": {
    component: EbitdaMarginChart,
    icon: TimelineIcon,
    name: "EBITDA Margin",
  },
  "country-comparison": {
    component: CountryComparisonChart,
    icon: BarChartIcon,
    name: "Countries",
  },
  "metrics-heatmap": {
    component: MetricsHeatMap,
    icon: TimelineIcon,
    name: "Heat Map",
  },
  "correlation-matrix": {
    component: CorrelationMatrix,
    icon: TimelineIcon,
    name: "Correlation",
  },
};

export default function MobileDashboard({
  financialData,
  projectData,
  countryData,
  onFilter,
  onSettings,
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const [activeChart, setActiveChart] = useState("revenue-ebitda");
  const [menuOpen, setMenuOpen] = useState(false);
  const [favoriteCharts, setFavoriteCharts] = useState([
    "revenue-ebitda",
    "project-portfolio",
    "geographic-map",
    "cash-flow-sankey",
  ]);
  const touchStartY = useRef(0);
  const isLargePhone = useMediaQuery("(min-height: 700px)");

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveChart(newValue);
    setMenuOpen(false);
  };

  // Toggle favorite status of a chart
  const toggleFavorite = (chartId) => {
    setFavoriteCharts((prev) => {
      if (prev.includes(chartId)) {
        return prev.filter((id) => id !== chartId);
      } else {
        return [...prev, chartId];
      }
    });
  };

  // Get current chart component
  const CurrentChart = CHART_COMPONENTS[activeChart]?.component;

  // Determine data for current chart
  const getChartData = (chartId) => {
    switch (chartId) {
      case "revenue-ebitda":
      case "ebitda-margin":
        return financialData;
      case "geographic-map":
      case "project-portfolio":
      case "project-type":
      case "investment-returns":
      case "metrics-heatmap":
      case "correlation-matrix":
        return projectData;
      case "country-comparison":
        return countryData;
      case "cash-flow-sankey":
        return null; // Uses internal data
      default:
        return projectData;
    }
  };

  // Touch handling for swipe navigation
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    // Only respond to significant vertical swipes
    if (Math.abs(diff) > 50) {
      const chartIds = Object.keys(CHART_COMPONENTS);
      const currentIndex = chartIds.indexOf(activeChart);

      if (diff > 0 && currentIndex < chartIds.length - 1) {
        // Swipe up, go to next chart
        setActiveChart(chartIds[currentIndex + 1]);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down, go to previous chart
        setActiveChart(chartIds[currentIndex - 1]);
      }
    }
  };

  return (
    <Box>
      {/* KPI Summary */}
      <Box sx={{ mb: 2 }}>
        <KpiContainer projectData={projectData} compact={true} />
      </Box>

      {/* Chart Navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <IconButton onClick={() => setMenuOpen(true)}>
          <MenuIcon />
        </IconButton>

        <Tabs
          value={activeChart}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              minWidth: "auto",
              px: 1.5,
              py: 1,
            },
          }}
        >
          {favoriteCharts.map((chartId) => {
            const chart = CHART_COMPONENTS[chartId];
            if (!chart) return null;

            const Icon = chart.icon;

            return (
              <Tab
                key={chartId}
                value={chartId}
                icon={<Icon fontSize="small" />}
                iconPosition="start"
                label={chart.name}
              />
            );
          })}
        </Tabs>

        <IconButton onClick={onSettings}>
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* Active Chart */}
      <Box
        sx={{
          height: isLargePhone ? "75vh" : "65vh",
          position: "relative",
          overflow: "hidden",
          borderRadius: 1,
          boxShadow: 1,
          mb: 2,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChart}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%" }}
          >
            {CurrentChart && <CurrentChart data={getChartData(activeChart)} />}
          </motion.div>
        </AnimatePresence>

        {/* Subtle swipe indicator */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "background.paper",
            px: 2,
            py: 0.5,
            borderRadius: 8,
            opacity: 0.7,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("mobile.swipeToNavigate")}
          </Typography>
        </Box>
      </Box>

      {/* Chart Selection Menu */}
      <SwipeableDrawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={() => setMenuOpen(true)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <Typography variant="h6">{t("mobile.charts")}</Typography>
            <IconButton onClick={() => setMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {t("mobile.selectCharts")}
          </Typography>

          <List>
            {Object.entries(CHART_COMPONENTS).map(([chartId, chart]) => {
              const Icon = chart.icon;
              const isFavorite = favoriteCharts.includes(chartId);

              return (
                <ListItem
                  key={chartId}
                  component="div"
                  disablePadding
                  selected={activeChart === chartId}
                  onClick={() => {
                    setActiveChart(chartId);
                    setMenuOpen(false);
                  }}
                >
                  <ListItemButton>
                    <ListItemIcon>
                      <Icon color={activeChart === chartId ? "primary" : "inherit"} />
                    </ListItemIcon>
                    <ListItemText primary={chart.name} />
                    <Checkbox
                      edge="end"
                      checked={isFavorite}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(chartId);
                      }}
                      size="small"
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ my: 2 }} />

          <Button
            fullWidth
            startIcon={<FilterListIcon />}
            variant="outlined"
            onClick={() => {
              onFilter();
              setMenuOpen(false);
            }}
            sx={{ mb: 1 }}
          >
            {t("action.filter")}
          </Button>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
}
