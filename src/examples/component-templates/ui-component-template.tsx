/**
 * UIComponentTemplate - A template for creating new UI components
 *
 * This file demonstrates the recommended structure for UI components.
 * Use this as a starting point for new UI elements.
 */

import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { CommonComponentProps } from "@/types/ui-types";

// Define props specific to this component
export interface UIComponentProps extends CommonComponentProps {
  /**
   * Primary content text
   */
  label: string;

  /**
   * Secondary descriptive text
   */
  description?: string;

  /**
   * Whether component is in disabled state
   */
  disabled?: boolean;

  /**
   * Function to call when component is clicked
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

  /**
   * Size variant
   */
  size?: "small" | "medium" | "large";

  /**
   * Visual variant
   */
  variant?: "default" | "outlined" | "filled";
}

/**
 * UI component template demonstrating best practices
 */
const UIComponentTemplate: React.FC<UIComponentProps> = ({
  // Destructure props with defaults
  label,
  description,
  disabled = false,
  onClick,
  size = "medium",
  variant = "default",
  className,
  style,
  sx,
  id,
  ...otherProps
}) => {
  // Get theme for styling
  const theme = useTheme();

  // Determine component styling based on props
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          padding: 1,
          fontSize: theme.typography.body2.fontSize,
        };
      case "large":
        return {
          padding: 3,
          fontSize: theme.typography.h6.fontSize,
        };
      case "medium":
      default:
        return {
          padding: 2,
          fontSize: theme.typography.body1.fontSize,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "outlined":
        return {
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: "transparent",
        };
      case "filled":
        return {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        };
      case "default":
      default:
        return {
          backgroundColor: theme.palette.background.paper,
        };
    }
  };

  // Event handlers
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled && onClick) {
      onClick(event);
    }
  };

  // Base styles
  const baseStyles = {
    borderRadius: 1,
    transition: "all 0.2s ease",
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : onClick ? "pointer" : "default",
    "&:hover":
      !disabled && onClick
        ? {
            boxShadow: 1,
            backgroundColor:
              variant === "filled" ? theme.palette.primary.dark : theme.palette.action.hover,
          }
        : {},
    ...getSizeStyles(),
    ...getVariantStyles(),
  };

  return (
    <Box
      id={id}
      className={className}
      style={style}
      sx={{
        ...baseStyles,
        ...sx,
      }}
      onClick={handleClick}
      aria-disabled={disabled}
      {...otherProps}
    >
      <Typography
        variant={size === "large" ? "h6" : size === "small" ? "body2" : "body1"}
        component="div"
        fontWeight="medium"
      >
        {label}
      </Typography>

      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default UIComponentTemplate;
