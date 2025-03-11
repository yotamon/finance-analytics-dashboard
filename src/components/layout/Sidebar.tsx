import React, { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Tooltip,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Receipt as TransactionsIcon,
  CreditCard as AccountsIcon,
  Category as CategoriesIcon,
  SavingsOutlined as BudgetsIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon,
  ImportExport as ImportExportIcon,
  CloudUpload as ImportIcon,
  CloudDownload as ExportIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useFinancialData } from "../../context/FinancialDataContext";

interface SidebarItemProps {
  to?: string;
  icon: React.ReactNode;
  text: string;
  isCollapsed: boolean;
  isActive: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  width: number;
  onClose: () => void;
  onToggleCollapse: () => void;
}

// Individual sidebar item component
const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  icon,
  text,
  isCollapsed,
  isActive,
  onClick,
  disabled = false,
}) => {
  const theme = useTheme();

  // Content for the list item
  const itemContent = (
    <>
      <ListItemIcon
        sx={{
          minWidth: isCollapsed ? "auto" : 40,
          color: isActive ? "primary.main" : "text.primary",
          justifyContent: isCollapsed ? "center" : "flex-start",
        }}
      >
        {icon}
      </ListItemIcon>
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <ListItemText
            primary={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {text}
              </motion.div>
            }
            sx={{
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.2s",
              m: 0,
            }}
          />
        )}
      </AnimatePresence>
    </>
  );

  // Determine if we should render a link or button
  if (to) {
    return (
      <ListItem
        disablePadding
        sx={{
          display: "block",
          mb: 0.5,
        }}
        component={RouterLink}
        to={disabled ? "#" : to}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
          }
          onClick?.();
        }}
      >
        <Tooltip title={isCollapsed ? text : ""} placement="right" arrow>
          <ListItemButton
            selected={isActive}
            disabled={disabled}
            sx={{
              minHeight: 48,
              justifyContent: isCollapsed ? "center" : "flex-start",
              px: isCollapsed ? 2.5 : 3,
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              color: isActive ? "primary.main" : "text.primary",
              "&.Mui-selected": {
                backgroundColor: "background.default",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "25%",
                  height: "50%",
                  width: 4,
                  borderRadius: "0 4px 4px 0",
                  backgroundColor: "primary.main",
                },
              },
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            {itemContent}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  }

  return (
    <ListItem
      disablePadding
      sx={{
        display: "block",
        mb: 0.5,
      }}
    >
      <Tooltip title={isCollapsed ? text : ""} placement="right" arrow>
        <ListItemButton
          onClick={onClick}
          disabled={disabled}
          sx={{
            minHeight: 48,
            justifyContent: isCollapsed ? "center" : "flex-start",
            px: isCollapsed ? 2.5 : 3,
            py: 1.5,
            borderRadius: 1,
            mx: 1,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          {itemContent}
          {!isCollapsed && (onClick ? isActive ? <ExpandLess /> : <ExpandMore /> : null)}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  width,
  onClose,
  onToggleCollapse,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDataLoaded } = useFinancialData();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for nested menu items
  const [importExportOpen, setImportExportOpen] = useState(false);

  // Check if current path matches
  const isPathActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Toggle nested menu
  const toggleImportExport = () => {
    setImportExportOpen(!importExportOpen);
  };

  // Drawer content
  const drawerContent = (
    <>
      {/* Drawer Header with close button for mobile */}
      {isMobile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {isCollapsed ? "" : "Menu"}
          </Typography>
          <IconButton onClick={onClose} sx={{ ml: 1 }}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      )}

      <List sx={{ mt: isMobile ? 0 : 2, px: 1 }}>
        {/* Dashboard */}
        <SidebarItem
          to="/"
          icon={<DashboardIcon />}
          text="Dashboard"
          isCollapsed={isCollapsed}
          isActive={isPathActive("/")}
        />

        {/* Transactions */}
        <SidebarItem
          to="/transactions"
          icon={<TransactionsIcon />}
          text="Transactions"
          isCollapsed={isCollapsed}
          isActive={isPathActive("/transactions")}
        />

        {/* Accounts */}
        <SidebarItem
          to="/accounts"
          icon={<AccountsIcon />}
          text="Accounts"
          isCollapsed={isCollapsed}
          isActive={isPathActive("/accounts")}
        />

        {/* Categories */}
        <SidebarItem
          to="/categories"
          icon={<CategoriesIcon />}
          text="Categories"
          isCollapsed={isCollapsed}
          isActive={isPathActive("/categories")}
        />

        {/* Budgets */}
        <SidebarItem
          to="/budgets"
          icon={<BudgetsIcon />}
          text="Budgets"
          isCollapsed={isCollapsed}
          isActive={isPathActive("/budgets")}
        />

        <Divider sx={{ my: 2, mx: 2 }} />

        {/* Reports */}
        <SidebarItem
          to="/reports"
          icon={<ReportsIcon />}
          text="Reports"
          isCollapsed={isCollapsed}
          isActive={isPathActive("/reports")}
        />

        {/* Import/Export expandable menu */}
        <SidebarItem
          icon={<ImportExportIcon />}
          text="Import & Export"
          isCollapsed={isCollapsed}
          isActive={importExportOpen}
          onClick={isCollapsed ? undefined : toggleImportExport}
        />

        {/* Nested import/export menu items */}
        {!isCollapsed && (
          <Collapse in={importExportOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton
                  component={RouterLink}
                  to="/import"
                  sx={{
                    py: 1,
                    borderRadius: 1,
                    minHeight: 40,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ImportIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Import Data" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton
                  component={RouterLink}
                  to="/export"
                  disabled={!isDataLoaded}
                  sx={{
                    py: 1,
                    borderRadius: 1,
                    minHeight: 40,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ExportIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Export Data" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
        )}

        {/* Settings */}
        <SidebarItem
          to="/settings"
          icon={<SettingsIcon />}
          text="Settings"
          isCollapsed={isCollapsed}
          isActive={isPathActive("/settings")}
        />
      </List>

      {/* App version at bottom */}
      {!isCollapsed && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Finance Analyzer
          </Typography>
          <Typography variant="caption" color="text.disabled">
            v0.1.0
          </Typography>
        </Box>
      )}
    </>
  );

  // For mobile, use temporary drawer
  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          width: width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: width,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // For desktop, use permanent drawer
  return (
    <Drawer
      variant="permanent"
      open={isOpen}
      sx={{
        width: width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          position: "fixed",
          width: width,
          height: "100vh",
          boxSizing: "border-box",
          border: "none",
          borderRight: 1,
          borderColor: "divider",
          overflowX: "hidden",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
