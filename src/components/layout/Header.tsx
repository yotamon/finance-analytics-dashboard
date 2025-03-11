import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  NightlightRound as DarkModeIcon,
  WbSunny as LightModeIcon,
  ArrowLeft as CollapseIcon,
  ArrowRight as ExpandIcon,
  Help as HelpIcon,
  MoreVert as MoreIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useTheme as useAppTheme } from "../../context/ThemeContext";
import { useFinancialData } from "../../context/FinancialDataContext";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  isSidebarOpen,
  isSidebarCollapsed,
  toggleSidebarCollapse,
}) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useAppTheme();
  const { isDataLoaded } = useFinancialData();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // User menu
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const isUserMenuOpen = Boolean(userMenuAnchor);

  // Notifications menu
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const isNotificationsOpen = Boolean(notificationsAnchor);

  // Mobile menu
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchor);

  // Handle menu openings
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  // Handle menu closings
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left section: Logo and menu toggle */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isMobile ? (
            <IconButton color="inherit" edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton color="inherit" edge="start" onClick={toggleSidebarCollapse} sx={{ mr: 2 }}>
              {isSidebarCollapsed ? <ExpandIcon /> : <CollapseIcon />}
            </IconButton>
          )}

          <Box
            component={RouterLink}
            to="/"
            sx={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}
          >
            <Box
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontWeight: 700,
                  letterSpacing: ".1rem",
                  color: "primary.main",
                }}
              >
                FINANCE ANALYZER
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center section: Main navigation (hide on mobile) */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{
                minWidth: "auto",
                fontWeight: 500,
                px: 2,
              }}
            >
              Dashboard
            </Button>
            <Button
              component={RouterLink}
              to="/transactions"
              color="inherit"
              sx={{
                minWidth: "auto",
                fontWeight: 500,
                px: 2,
              }}
            >
              Transactions
            </Button>
            <Button
              component={RouterLink}
              to="/reports"
              color="inherit"
              sx={{
                minWidth: "auto",
                fontWeight: 500,
                px: 2,
              }}
            >
              Reports
            </Button>
          </Box>
        )}

        {/* Right section: Action buttons */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Desktop menu items */}
          {!isMobile && (
            <>
              <Tooltip title="Import Data">
                <IconButton component={RouterLink} to="/import" color="inherit" sx={{ ml: 1 }}>
                  <ImportIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Export Data">
                <IconButton
                  component={RouterLink}
                  to="/export"
                  color="inherit"
                  sx={{ ml: 1 }}
                  disabled={!isDataLoaded}
                >
                  <ExportIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={mode === "light" ? "Dark Mode" : "Light Mode"}>
                <IconButton onClick={toggleColorMode} color="inherit" sx={{ ml: 1 }}>
                  {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={handleNotificationsOpen} sx={{ ml: 1 }}>
                  <Badge badgeContent={3} color="error">
                    <NotificationIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* User avatar - always shown */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={isUserMenuOpen ? "user-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen ? "true" : undefined}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "primary.main",
                }}
              >
                U
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Mobile menu toggle */}
          {isMobile && (
            <IconButton color="inherit" onClick={handleMobileMenuOpen} sx={{ ml: 1 }}>
              <MoreIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {/* User Menu */}
      <Menu
        id="user-menu"
        anchorEl={userMenuAnchor}
        open={isUserMenuOpen}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            minWidth: 200,
            borderRadius: 2,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            User Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            user@example.com
          </Typography>
        </Box>
        <Divider />
        <MenuItem component={RouterLink} to="/settings">
          <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <HelpIcon fontSize="small" sx={{ mr: 1.5 }} />
          Help & Support
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleUserMenuClose}>
          <Typography color="error">Sign out</Typography>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        id="notifications-menu"
        anchorEl={notificationsAnchor}
        open={isNotificationsOpen}
        onClose={handleNotificationsClose}
        PaperProps={{
          elevation: 0,
          sx: {
            minWidth: 280,
            maxWidth: 320,
            borderRadius: 2,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        <MenuItem>
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" fontWeight={500}>
              New data imported
            </Typography>
            <Typography variant="caption" color="text.secondary">
              5 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" fontWeight={500}>
              Monthly report ready
            </Typography>
            <Typography variant="caption" color="text.secondary">
              2 hours ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" fontWeight={500}>
              Budget threshold exceeded
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Yesterday
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
          <Link component={Button} underline="none" sx={{ width: "100%", textAlign: "center" }}>
            View All
          </Link>
        </Box>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        id="mobile-menu"
        anchorEl={mobileMenuAnchor}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            minWidth: 200,
            borderRadius: 2,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={toggleColorMode}>
          {mode === "light" ? (
            <DarkModeIcon fontSize="small" sx={{ mr: 1.5 }} />
          ) : (
            <LightModeIcon fontSize="small" sx={{ mr: 1.5 }} />
          )}
          {mode === "light" ? "Dark Mode" : "Light Mode"}
        </MenuItem>
        <MenuItem onClick={handleNotificationsOpen}>
          <Badge badgeContent={3} color="error" sx={{ mr: 1.5 }}>
            <NotificationIcon fontSize="small" />
          </Badge>
          Notifications
        </MenuItem>
        <MenuItem component={RouterLink} to="/import" onClick={handleMobileMenuClose}>
          <ImportIcon fontSize="small" sx={{ mr: 1.5 }} />
          Import Data
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to="/export"
          onClick={handleMobileMenuClose}
          disabled={!isDataLoaded}
        >
          <ExportIcon fontSize="small" sx={{ mr: 1.5 }} />
          Export Data
        </MenuItem>
        <MenuItem component={RouterLink} to="/settings" onClick={handleMobileMenuClose}>
          <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
          Settings
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
