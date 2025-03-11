import React, { createContext, useContext, ReactNode, FC } from "react";

/**
 * Interface for the Recharts context state
 */
export interface RechartsContextState {
  /**
   * Whether Recharts is loading
   */
  isLoading: boolean;

  /**
   * Whether there was an error loading Recharts
   */
  isError: boolean;

  /**
   * Error message if there was an error
   */
  error: string | null;
}

/**
 * Interface for RechartsLoader props
 */
export interface RechartsLoaderProps {
  /**
   * Child components that will have access to Recharts context
   */
  children: ReactNode;
}

/**
 * Default context state
 */
const defaultContextState: RechartsContextState = {
  isLoading: false,
  isError: false,
  error: null,
};

/**
 * Context for managing Recharts state
 */
export const RechartsContext = createContext<RechartsContextState>(defaultContextState);

/**
 * Custom hook to use the Recharts context
 * @returns The current Recharts context state
 */
export const useRecharts = (): RechartsContextState => useContext(RechartsContext);

/**
 * RechartsLoader component provides a context provider for Recharts
 * Unlike other chart libraries, Recharts is bundled with the application so it's always ready
 */
export const RechartsLoader: FC<RechartsLoaderProps> = ({ children }) => {
  // Recharts is bundled with the application, so it's always ready
  const state: RechartsContextState = {
    isLoading: false,
    isError: false,
    error: null,
  };

  return <RechartsContext.Provider value={state}>{children}</RechartsContext.Provider>;
};
