import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";

// Create a context to manage the Recharts state
export const RechartsContext = createContext({
  isLoading: false,
  isError: false,
  error: null,
});

// Custom hook to use the Recharts context
export const useRecharts = () => useContext(RechartsContext);

// Recharts doesn't need external loading like Google Charts, so this is a simplified provider
export function RechartsLoader({ children }) {
  // Recharts is bundled with the application, so it's always ready
  const state = {
    isLoading: false,
    isError: false,
    error: null,
  };

  return <RechartsContext.Provider value={state}>{children}</RechartsContext.Provider>;
}

RechartsLoader.propTypes = {
  children: PropTypes.node.isRequired,
};
