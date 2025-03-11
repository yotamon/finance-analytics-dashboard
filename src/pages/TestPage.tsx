import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, CircularProgress, Grid } from "@mui/material";
import { useLocation } from "react-router-dom";
import LayoutDebugger from "../components/debug/LayoutDebugger";
import useRenderTracker from "../hooks/useRenderTracker";

/**
 * TestPage component for diagnosing rendering issues
 */
const TestPage: React.FC = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Track renders
  useRenderTracker("TestPage");

  useEffect(() => {
    setMounted(true);
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LayoutDebugger name="TestPage" color="#e91e63">
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          position: "relative",
        }}
      >
        <Typography variant="h3" color="primary">
          Test Page
        </Typography>
        <Typography variant="h5" color="textSecondary">
          This is a simple test page to verify rendering
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <LayoutDebugger name="Content Panel" color="#4caf50">
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  backgroundColor: "#f8f9fa",
                  height: "100%",
                }}
              >
                <Typography variant="h6">Content Test</Typography>
                <Typography variant="body1" paragraph>
                  If you can see this content, the page is rendering correctly.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => alert("Button clicked!")}
                >
                  Test Button
                </Button>
              </Paper>
            </LayoutDebugger>
          </Grid>

          <Grid item xs={12} md={6}>
            <LayoutDebugger name="Debug Panel" color="#ff9800">
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  backgroundColor: "#fff8e1",
                  height: "100%",
                }}
              >
                <Typography variant="h6">Debug Information</Typography>
                <Box sx={{ textAlign: "left", mt: 2 }}>
                  <Typography variant="body2">Path: {location.pathname}</Typography>
                  <Typography variant="body2">Viewport Width: {dimensions.width}px</Typography>
                  <Typography variant="body2">Viewport Height: {dimensions.height}px</Typography>
                  <Typography variant="body2">Component Mounted: {String(mounted)}</Typography>
                </Box>
              </Paper>
            </LayoutDebugger>
          </Grid>
        </Grid>

        <Box
          sx={{
            position: "absolute",
            top: 5,
            right: 5,
            p: 1,
            backgroundColor: "rgba(255,0,0,0.1)",
            borderRadius: 1,
          }}
        >
          <Typography variant="caption">Absolute positioned element</Typography>
        </Box>
      </Box>
    </LayoutDebugger>
  );
};

export default TestPage;
