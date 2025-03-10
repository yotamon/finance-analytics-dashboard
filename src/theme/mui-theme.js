import { createTheme, alpha } from "@mui/material/styles";
import { useTheme } from "../context/ThemeContext";

// MUI theme factory that creates a theme based on our application theme
export const createMuiTheme = (isDark, customColors) => {
  // Helper to convert RGB string to hex
  const rgbToHex = (rgbString) => {
    if (!rgbString) return "#000000";
    const [r, g, b] = rgbString.split(",").map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Define primary color shades - using a more vibrant blue
  const primaryMain = customColors?.primary || "#3b82f6"; // More vibrant blue
  const primaryLight =
    rgbToHex(document.documentElement.style.getPropertyValue("--color-primary-300")) || "#93c5fd";
  const primaryDark =
    rgbToHex(document.documentElement.style.getPropertyValue("--color-primary-700")) || "#1d4ed8";

  // Create the MUI theme
  return createTheme({
    shape: {
      borderRadius: 12, // Increased border radius for more modern look
    },
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark,
        contrastText: "#ffffff",
      },
      secondary: {
        main: customColors?.secondary || "#8b5cf6", // Purple as secondary color
        light: "#a78bfa",
        dark: "#7c3aed",
      },
      success: {
        main: customColors?.success || "#10b981",
        light: "#34d399",
        dark: "#059669",
      },
      warning: {
        main: customColors?.warning || "#f59e0b",
        light: "#fbbf24",
        dark: "#d97706",
      },
      error: {
        main: customColors?.error || "#ef4444",
        light: "#f87171",
        dark: "#dc2626",
      },
      info: {
        main: "#06b6d4", // Added vibrant cyan for info
        light: "#22d3ee",
        dark: "#0891b2",
      },
      background: {
        default: isDark ? "#0f172a" : "#f8fafc", // Lighter background in light mode
        paper: isDark ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f9fafb" : "#0f172a", // Darker text in light mode for better contrast
        secondary: isDark ? "#cbd5e1" : "#475569",
      },
      // Set of colors for charts and visualizations
      chart: {
        primary: ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"],
        secondary: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
        categorical: [
          "#3b82f6", // blue
          "#10b981", // green
          "#f59e0b", // orange
          "#8b5cf6", // purple
          "#ef4444", // red
          "#06b6d4", // cyan
          "#ec4899", // pink
          "#84cc16", // lime
          "#14b8a6", // teal
          "#f97316", // dark orange
        ],
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 600,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
      body1: {
        lineHeight: 1.6,
      },
      body2: {
        lineHeight: 1.6,
      },
    },
    shadows: [
      "none",
      "0px 2px 4px rgba(0,0,0,0.05), 0px 1px 2px rgba(0,0,0,0.05)",
      "0px 4px 6px -1px rgba(0,0,0,0.08), 0px 2px 4px -1px rgba(0,0,0,0.05)",
      "0px 10px 15px -3px rgba(0,0,0,0.08), 0px 4px 6px -2px rgba(0,0,0,0.05)",
      "0px 20px 25px -5px rgba(0,0,0,0.08), 0px 10px 10px -5px rgba(0,0,0,0.04)",
      "0px 25px 30px -6px rgba(0,0,0,0.1), 0px 12px 15px -6px rgba(0,0,0,0.05)",
      "0px 28px 35px -7px rgba(0,0,0,0.12), 0px 14px 18px -7px rgba(0,0,0,0.06)",
      "0px 30px 38px -8px rgba(0,0,0,0.14), 0px 16px 20px -8px rgba(0,0,0,0.07)",
      "0px 32px 40px -8px rgba(0,0,0,0.16), 0px 18px 22px -8px rgba(0,0,0,0.08)",
      "0px 34px 42px -10px rgba(0,0,0,0.18), 0px 20px 24px -10px rgba(0,0,0,0.09)",
      "0px 36px 44px -10px rgba(0,0,0,0.2), 0px 22px 26px -10px rgba(0,0,0,0.1)",
      "0px 38px 46px -12px rgba(0,0,0,0.22), 0px 24px 28px -12px rgba(0,0,0,0.11)",
      "0px 40px 48px -12px rgba(0,0,0,0.24), 0px 26px 30px -12px rgba(0,0,0,0.12)",
      "0px 42px 50px -14px rgba(0,0,0,0.26), 0px 28px 32px -14px rgba(0,0,0,0.13)",
      "0px 44px 52px -14px rgba(0,0,0,0.28), 0px 30px 34px -14px rgba(0,0,0,0.14)",
      "0px 46px 54px -16px rgba(0,0,0,0.3), 0px 32px 36px -16px rgba(0,0,0,0.15)",
      "0px 48px 56px -16px rgba(0,0,0,0.32), 0px 34px 38px -16px rgba(0,0,0,0.16)",
      "0px 50px 58px -18px rgba(0,0,0,0.34), 0px 36px 40px -18px rgba(0,0,0,0.17)",
      "0px 52px 60px -18px rgba(0,0,0,0.36), 0px 38px 42px -18px rgba(0,0,0,0.18)",
      "0px 54px 62px -20px rgba(0,0,0,0.38), 0px 40px 44px -20px rgba(0,0,0,0.19)",
      "0px 56px 64px -20px rgba(0,0,0,0.4), 0px 42px 46px -20px rgba(0,0,0,0.2)",
      "0px 58px 66px -22px rgba(0,0,0,0.42), 0px 44px 48px -22px rgba(0,0,0,0.21)",
      "0px 60px 68px -22px rgba(0,0,0,0.44), 0px 46px 50px -22px rgba(0,0,0,0.22)",
      "0px 62px 70px -24px rgba(0,0,0,0.46), 0px 48px 52px -24px rgba(0,0,0,0.23)",
      "0px 64px 72px -24px rgba(0,0,0,0.48), 0px 50px 54px -24px rgba(0,0,0,0.24)",
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "*": {
            boxSizing: "border-box",
          },
          "html, body": {
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
          "@keyframes fadeIn": {
            from: {
              opacity: 0,
              transform: "translateY(10px)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
          "@keyframes slideUp": {
            from: {
              opacity: 0,
              transform: "translateY(20px)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
          "@keyframes pulse": {
            "0%": {
              boxShadow: `0 0 0 0 ${alpha(primaryMain, 0.4)}`,
            },
            "70%": {
              boxShadow: `0 0 0 10px ${alpha(primaryMain, 0)}`,
            },
            "100%": {
              boxShadow: `0 0 0 0 ${alpha(primaryMain, 0)}`,
            },
          },
          body: {
            scrollbarWidth: "thin",
            scrollbarColor: isDark ? "#4b5563 #1f2937" : "#cbd5e1 #f1f5f9",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: isDark ? "#1f2937" : "#f1f5f9",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isDark ? "#4b5563" : "#cbd5e1",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: isDark ? "#6b7280" : "#94a3b8",
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "0.5rem",
            textTransform: "none",
            fontWeight: 500,
            padding: "0.5rem 1.25rem",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          },
          outlined: {
            borderWidth: "1.5px",
            "&:hover": {
              borderWidth: "1.5px",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            boxShadow: isDark
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: "1.5rem",
            "&:last-child": {
              paddingBottom: "1.5rem",
            },
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: "1.5rem 1.5rem 0.75rem",
          },
          title: {
            fontSize: "1.25rem",
            fontWeight: 600,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "0.5rem",
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: isDark
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          },
          elevation1: {
            boxShadow: isDark
              ? "0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)"
              : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          },
          elevation2: {
            boxShadow: isDark
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          },
          elevation4: {
            boxShadow: isDark
              ? "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)"
              : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            color: isDark ? "#f9fafb" : "#111827",
            borderBottom: `1px solid ${
              isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
            }`,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
          },
          switchBase: {
            padding: 1,
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: "#fff",
            },
          },
          thumb: {
            width: 24,
            height: 24,
          },
          track: {
            borderRadius: 13,
            opacity: "0.8 !important",
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: "0.5rem",
            "&.Mui-selected": {
              backgroundColor: alpha(primaryMain, 0.1),
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: "0.375rem",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            margin: "0.75rem 0",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
              backgroundColor: alpha(primaryMain, 0.08),
            },
          },
        },
      },
    },
  });
};

// Hook to use MUI theme with our application theme
export const useMuiTheme = () => {
  const { /* eslint-disable-next-line no-unused-vars */ theme, isDark, currentTheme } = useTheme();

  // Default colors as fallback
  const defaultColors = {
    primary: "#6366f1",
    secondary: "#6b7280",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  };

  return createMuiTheme(isDark, currentTheme || defaultColors);
};
