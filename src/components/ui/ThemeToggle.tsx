import { useState, useEffect } from "react";
import { IconButton, Tooltip, useTheme, alpha } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useUi } from "../../context/UiContext";

/**
 * Props for the ThemeToggle component
 */
interface ThemeToggleProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * ThemeToggle - A component for toggling between light and dark themes
 *
 * This component provides a simple interface for users to switch between
 * light and dark modes. It uses the UiContext for theme management and
 * persists the user's preference.
 */
function ThemeToggle({ className = "" }: ThemeToggleProps): JSX.Element {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useUi();

  return (
    <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        onClick={toggleDarkMode}
        color="inherit"
        className={className}
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, darkMode ? 0.15 : 0.1),
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, darkMode ? 0.25 : 0.2),
          },
          color: theme.palette.primary.main,
          transition: "all 0.3s ease",
        }}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
