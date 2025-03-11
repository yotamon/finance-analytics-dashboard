import React, { useState, useEffect, memo, useMemo, useRef } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import DraggableDashboard from "./DraggableDashboard";
import { DraggableDashboardProps } from "../../types/dashboard";
import { useI18n } from "../../context/I18nContext";
import RefreshIcon from "@mui/icons-material/Refresh";
import useRenderTracker from "../../hooks/useRenderTracker";

/**
 * DashboardWrapper component
 *
 * This component wraps the DraggableDashboard to handle initialization,
 * loading states, and error handling.
 */
const DashboardWrapper: React.FC<DraggableDashboardProps> = (props) => {
  const { t } = useI18n();

  // Use a single state object to reduce state changes
  const [dashboardState, setDashboardState] = useState({
    loading: true,
    error: null as string | null,
    dataAvailable: true,
  });

  // Track initialization with a ref to prevent unnecessary re-renders
  const isInitialized = useRef(false);

  // Add render tracker to help debug rendering issues - removed props dependency
  useRenderTracker("DashboardWrapper");

  // IMPORTANT: Always define hooks at the top level before any conditionals
  // Provide sensible defaults for any missing props to prevent crashes
  const safeProps = useMemo(
    () => ({
      ...props,
      projectData: props.projectData || [],
      countryData: props.countryData || [],
      editMode: props.editMode || false,
      onLayoutChange: props.onLayoutChange || (() => {}),
      savedLayouts: props.savedLayouts || null,
    }),
    [
      props.projectData,
      props.countryData,
      props.editMode,
      props.onLayoutChange,
      props.savedLayouts,
      props, // Include props to capture any other props changes
    ]
  );

  // Function to check for data availability and render appropriate feedback
  const checkDataAvailability = () => {
    // For demo/dev purposes, consider the default projects as valid data
    const hasData = !!(
      (props.projectData && props.projectData.length > 0) ||
      (props.financialData &&
        props.financialData.projects &&
        props.financialData.projects.length > 0)
    );

    return hasData;
  };

  // Initialize dashboard with a delay to ensure all components are ready
  useEffect(() => {
    if (isInitialized.current) return;

    const timer = setTimeout(() => {
      try {
        // Check if we have the minimum required data
        const hasAvailableData = checkDataAvailability();

        if (!hasAvailableData) {
          setDashboardState({
            loading: false,
            error: null,
            dataAvailable: false,
          });
        } else if (!props.financialData || !props.projectData) {
          setDashboardState({
            loading: false,
            error: "Missing required data for dashboard",
            dataAvailable: true,
          });
        } else {
          setDashboardState({
            loading: false,
            error: null,
            dataAvailable: true,
          });
        }
        isInitialized.current = true;
      } catch (err) {
        console.error("Error initializing dashboard:", err);
        setDashboardState({
          loading: false,
          error: "Failed to initialize dashboard components",
          dataAvailable: false,
        });
        isInitialized.current = true;
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [props.financialData, props.projectData]);

  // Display loading state
  if (dashboardState.loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          {t("common.loading") || "Loading dashboard components..."}
        </Typography>
      </Box>
    );
  }

  // Display error state
  if (dashboardState.error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">
          {dashboardState.error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("charts.tryRefreshing") || "Please check your data or refresh the page."}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          {t("dashboard.refresh") || "Refresh"}
        </Button>
      </Box>
    );
  }

  // Display "no data" state
  if (!dashboardState.dataAvailable) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          gap: 2,
          textAlign: "center",
          p: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {t("charts.noDataAvailable") || "No data available"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mb: 2 }}>
          {t("charts.pleaseUpload") ||
            "Please upload project data to view this portfolio overview."}
        </Typography>
      </Box>
    );
  }

  // Render the dashboard component when ready
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "800px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: process.env.NODE_ENV === "development" ? "1px dashed #ccc" : "none",
      }}
    >
      <DraggableDashboard {...safeProps} />
    </Box>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(DashboardWrapper);
