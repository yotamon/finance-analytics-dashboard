import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { ThemeProvider as MUIThemeProvider, PaletteMode } from "@mui/material";
import { createAppTheme } from "../theme/theme";

interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
  setMode: (mode: PaletteMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleColorMode: () => {},
  setMode: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Try to get the theme mode from localStorage or use light as default
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem("themeMode");
    return (savedMode as PaletteMode) || "light";
  });

  // Effect to update body class and localStorage when theme changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("themeMode", mode);

    // Update body class for global CSS selectors
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(`${mode}-mode`);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", mode === "light" ? "#F7F9FC" : "#1F2327");
    }
  }, [mode]);

  // Function to toggle between light and dark mode
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Create the current theme
  const theme = createAppTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode, setMode }}>
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => useContext(ThemeContext);

export default ThemeProvider;
