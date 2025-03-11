import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  theme?: "light" | "dark" | "system";
}

export declare function ThemeProvider({ children, theme }: ThemeProviderProps): JSX.Element;
export default ThemeProvider;
