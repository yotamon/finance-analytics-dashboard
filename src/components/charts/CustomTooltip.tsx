/**
 * CustomTooltip - A reusable tooltip component for charts
 *
 * Provides a consistent tooltip style and formatting for all chart types
 * in the application. Follows Material UI styling and theming.
 */

import React from "react";
import { Paper, Typography, Box, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CommonComponentProps } from "@/types/ui-types";

/**
 * Payload item from chart libraries like Recharts
 */
export interface TooltipPayloadItem {
  /**
   * Value to display
   */
  value: number | string;

  /**
   * Series name
   */
  name: string;

  /**
   * Color of the data point/series
   */
  color: string;

  /**
   * Data key in the original dataset
   */
  dataKey: string;

  /**
   * Full data object
   */
  payload: Record<string, any>;
}

/**
 * Props for the CustomTooltip component
 */
export interface CustomTooltipProps extends CommonComponentProps {
  /**
   * Whether the tooltip is active/visible
   */
  active?: boolean;

  /**
   * Data to display in the tooltip
   */
  payload?: TooltipPayloadItem[];

  /**
   * Label for the tooltip (usually x-axis value)
   */
  label?: string | number;

  /**
   * Function to format values
   */
  valueFormatter?: (value: any, dataKey?: string, payload?: Record<string, any>) => React.ReactNode;

  /**
   * Function to format the tooltip title/label
   */
  labelFormatter?: (label: string | number, payload?: TooltipPayloadItem[]) => React.ReactNode;

  /**
   * Chart type for type-specific formatting
   */
  chartType?: "line" | "bar" | "pie" | "area" | "scatter" | "radar" | "composed";
}

/**
 * A custom tooltip component for charts that provides consistent styling
 * and formatting across the application's charts
 */
export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  valueFormatter = (value) => value,
  labelFormatter = (label) => label,
  chartType = "line",
  sx,
  ...otherProps
}) => {
  const theme = useTheme();

  // Don't render if tooltip is inactive or has no data
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Get tooltip title based on chart type and label
  const getTitle = () => {
    return labelFormatter(label as string | number, payload);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        bgcolor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.95)
            : "rgba(255, 255, 255, 0.98)",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        padding: "12px 14px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        minWidth: 150,
        maxWidth: 300,
        zIndex: 9999,
        fontFamily: theme.typography.fontFamily,
        backdropFilter: "blur(2px)",
        "& *": {
          fontFamily: theme.typography.fontFamily,
        },
        ...sx,
      }}
      {...otherProps}
    >
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1.25,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          fontWeight: 600,
          fontSize: {
            xs: "13px",
            sm: "14px",
          },
        }}
      >
        {getTitle()}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {payload.map((entry, index) => (
          <Box
            key={`item-${index}`}
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: {
                xs: "12px",
                sm: "13px",
              },
              color: theme.palette.text.secondary,
            }}
          >
            <Box
              component="span"
              sx={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "2px",
                bgcolor: entry.color,
                mr: 1,
              }}
            />
            <Typography
              component="span"
              sx={{
                fontWeight: 500,
                mr: 0.5,
                fontSize: "inherit",
              }}
            >
              {entry.name}:
            </Typography>
            <Typography
              component="span"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: "inherit",
              }}
            >
              {valueFormatter(entry.value, entry.dataKey, entry.payload)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default CustomTooltip;
