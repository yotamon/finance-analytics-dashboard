import React from "react";
import { Box, Typography, Button, CircularProgress, Paper } from "@mui/material";
import { useI18n } from "../../context/I18nContext";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";

interface DashboardFallbackProps {
  status: "loading" | "error" | "no-data";
  errorMessage?: string;
  alternateView?: React.ReactNode; // Optional alternate view for demo/sample data
}

/**
 * DashboardFallback component
 *
 * Provides a user-friendly fallback UI for different dashboard states
 * like loading, error, or no data situations.
 */
const DashboardFallback: React.FC<DashboardFallbackProps> = ({
  status,
  errorMessage,
  alternateView,
}) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  // Translate with fallbacks
  const translate = (key: string, fallback: string): string => {
    try {
      const translated = t(key);
      return translated === key ? fallback : translated;
    } catch (err) {
      console.warn(`Translation error for key ${key}:`, err);
      return fallback;
    }
  };

  // If there's an alternate view (for demo purposes), show it with a notice bar
  if (alternateView) {
    return (
      <Box sx={{ width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: "info.light",
            color: "info.contrastText",
            borderRadius: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2">
            {translate("dashboard.demoMode", "Demo Mode: Sample data is being displayed.")}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => navigate("/upload")}
            startIcon={<UploadFileIcon />}
          >
            {translate("nav.upload", "Upload Data")}
          </Button>
        </Paper>
        {alternateView}
      </Box>
    );
  }

  // Loading state
  if (status === "loading") {
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
          {translate("common.loading", "Loading dashboard components...")}
        </Typography>
      </Box>
    );
  }

  // Error state
  if (status === "error") {
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
          {errorMessage || translate("dashboard.errorLoading", "Error loading dashboard")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {translate("charts.tryRefreshing", "Please check your data or refresh the page.")}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          {translate("dashboard.refresh", "Refresh")}
        </Button>
      </Box>
    );
  }

  // No data state
  if (status === "no-data") {
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
          {translate("charts.noDataAvailable", "No data available")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mb: 2 }}>
          {translate(
            "charts.pleaseUpload",
            "Please upload project data to view this portfolio overview."
          )}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/upload")}
          startIcon={<UploadFileIcon />}
        >
          {translate("nav.upload", "Upload Data")}
        </Button>
      </Box>
    );
  }

  // Fallback (shouldn't reach here)
  return null;
};

export default DashboardFallback;
