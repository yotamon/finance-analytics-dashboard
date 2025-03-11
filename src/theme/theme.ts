import { createTheme, Theme, ThemeOptions } from "@mui/material/styles";
import { PaletteMode } from "@mui/material";

// Declare module augmentation for custom theme properties
declare module "@mui/material/styles" {
  interface Palette {
    tertiary: Palette["primary"];
    chart: {
      blue: string;
      green: string;
      orange: string;
      purple: string;
      teal: string;
      red: string;
      yellow: string;
      gray: string;
      [key: string]: string;
    };
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions["primary"];
    chart?: {
      blue: string;
      green: string;
      orange: string;
      purple: string;
      teal: string;
      red: string;
      yellow: string;
      gray: string;
      [key: string]: string;
    };
  }
}

// Color constants
const CHART_COLORS = {
  blue: "#4285F4",
  green: "#34A853",
  orange: "#FBBC05",
  purple: "#A142F4",
  teal: "#41D9D9",
  red: "#EA4335",
  yellow: "#FDD663",
  gray: "#9AA0A6",
};

// Light theme palette
const lightPalette = {
  mode: "light" as PaletteMode,
  primary: {
    main: "#336CFB",
    light: "#5C88FF",
    dark: "#0044CC",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#FF9800",
    light: "#FFB547",
    dark: "#C77700",
    contrastText: "#000000",
  },
  tertiary: {
    main: "#00C853",
    light: "#5EFF8B",
    dark: "#009624",
    contrastText: "#FFFFFF",
  },
  error: {
    main: "#F44336",
    light: "#FF7961",
    dark: "#BA000D",
    contrastText: "#FFFFFF",
  },
  warning: {
    main: "#FF9800",
    light: "#FFB74D",
    dark: "#F57C00",
    contrastText: "#000000",
  },
  info: {
    main: "#2196F3",
    light: "#64B5F6",
    dark: "#0D47A1",
    contrastText: "#FFFFFF",
  },
  success: {
    main: "#4CAF50",
    light: "#81C784",
    dark: "#388E3C",
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#F7F9FC",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#1F2327",
    secondary: "#5A6478",
    disabled: "#9AA0A6",
  },
  divider: "rgba(0, 0, 0, 0.12)",
  chart: CHART_COLORS,
};

// Dark theme palette
const darkPalette = {
  mode: "dark" as PaletteMode,
  primary: {
    main: "#5C88FF",
    light: "#90B4FF",
    dark: "#3C6CFF",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#FFB547",
    light: "#FFCB75",
    dark: "#FF9800",
    contrastText: "#000000",
  },
  tertiary: {
    main: "#5EFF8B",
    light: "#8FFFAD",
    dark: "#00C853",
    contrastText: "#000000",
  },
  error: {
    main: "#FF5252",
    light: "#FF7F7F",
    dark: "#C50E29",
    contrastText: "#FFFFFF",
  },
  warning: {
    main: "#FFB74D",
    light: "#FFCC80",
    dark: "#F57C00",
    contrastText: "#000000",
  },
  info: {
    main: "#64B5F6",
    light: "#90CAF9",
    dark: "#1976D2",
    contrastText: "#000000",
  },
  success: {
    main: "#81C784",
    light: "#A5D6A7",
    dark: "#388E3C",
    contrastText: "#000000",
  },
  background: {
    default: "#1F2327",
    paper: "#2D3748",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#CBD5E0",
    disabled: "#718096",
  },
  divider: "rgba(255, 255, 255, 0.12)",
  chart: {
    ...CHART_COLORS,
    blue: "#5C88FF",
    green: "#5EFF8B",
    orange: "#FFB547",
    red: "#FF5252",
  },
};

// Common theme options
const commonOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          fontWeight: 600,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "12px 16px",
        },
        head: {
          fontWeight: 600,
        },
      },
    },
  },
};

// Create theme function
export const createAppTheme = (mode: PaletteMode): Theme => {
  return createTheme({
    ...commonOptions,
    palette: mode === "dark" ? darkPalette : lightPalette,
  });
};

// Default export - light theme
export default createAppTheme("light");
