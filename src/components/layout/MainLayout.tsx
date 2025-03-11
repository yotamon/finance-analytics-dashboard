import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, useMediaQuery, useTheme as useMuiTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import useRenderTracker from "../../hooks/useRenderTracker";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_WIDTH_COLLAPSED = 70;

/**
 * MainLayout component that wraps all pages with a common layout
 * including header, sidebar, and footer
 */
const MainLayout: React.FC = () => {
  // Add render tracker to help debug rendering issues
  useRenderTracker("MainLayout");

  const muiTheme = useMuiTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [contentKey, setContentKey] = useState(Date.now());

  // Reset state when route changes to prevent stale state issues
  useEffect(() => {
    setContentKey(Date.now());
  }, [location.pathname]);

  // Close sidebar on mobile when changing routes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Toggle sidebar open/closed (for mobile)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle sidebar between collapsed and expanded (for desktop)
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Calculate content margin based on sidebar state
  const getContentMargin = () => {
    if (isMobile) return 0;
    if (isSidebarCollapsed) return SIDEBAR_WIDTH_COLLAPSED;
    return SIDEBAR_WIDTH;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Header
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebarCollapse={toggleSidebarCollapse}
      />

      <Box sx={{ display: "flex", flexGrow: 1, position: "relative", width: "100%" }}>
        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || !isMobile) && (
            <Box
              component="div"
              sx={{
                position: isMobile ? "fixed" : "relative",
                zIndex: 1200,
                height: isMobile ? "calc(100vh - 64px)" : "auto",
                top: isMobile ? "64px" : "auto",
                boxShadow: isMobile ? 3 : "none",
                width: isSidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
                flexShrink: 0,
              }}
            >
              <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                width={isSidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}
                onClose={() => setIsSidebarOpen(false)}
                onToggleCollapse={toggleSidebarCollapse}
              />
            </Box>
          )}
        </AnimatePresence>

        {/* Main Content - Using key to force re-rendering on route change */}
        <Box
          key={contentKey}
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, sm: 2, md: 3 },
            // Fixed margin and width without transitions
            ml: isMobile ? 0 : isSidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
            width: isMobile
              ? "100%"
              : `calc(100% - ${isSidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px)`,
            // Remove all transitions to prevent animation issues
            transition: "none",
            backgroundColor: muiTheme.palette.background.default,
            overflowX: "hidden",
            position: "relative",
            // Add a border to help visualize the main content area
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          {/* Debug information to help diagnose rendering issues */}
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              p: 1,
              bgcolor: "rgba(0,0,0,0.05)",
              borderRadius: 1,
              fontSize: "10px",
              zIndex: 1000,
            }}
          >
            Path: {location.pathname}
          </Box>
          <Outlet />
        </Box>
      </Box>

      {/* Footer */}
      <Footer
        marginLeft={isMobile ? 0 : isSidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}
      />
    </Box>
  );
};

export default MainLayout;
