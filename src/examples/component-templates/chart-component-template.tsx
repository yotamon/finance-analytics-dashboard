/**
 * ChartComponentTemplate - A template for creating new chart components
 *
 * This file demonstrates the recommended structure for chart components.
 * Use this as a starting point for new visualizations.
 */

import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { ChartOptions } from "@/types/chart-types";
import { CommonComponentProps } from "@/types/ui-types";

// Define props specific to this chart type
export interface ChartComponentProps extends CommonComponentProps, ChartOptions {
  /**
   * Data to be visualized
   */
  data: Array<{
    id: string;
    label: string;
    value: number;
    [key: string]: any;
  }>;

  /**
   * Optional error message
   */
  error?: string | null;
}

/**
 * Chart component template demonstrating best practices
 */
const ChartComponentTemplate: React.FC<ChartComponentProps> = ({
  // Destructure props with defaults
  data,
  title = "Chart Title",
  subtitle,
  height = 400,
  width = "100%",
  isLoading = false,
  error = null,
  valuePrefix = "",
  valueSuffix = "",
  showGridLines = true,
  animationDuration = 1000,
  sx,
  ...otherProps
}) => {
  // Get theme for styling
  const theme = useTheme();

  // Memoize processed data to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    // This is where you would transform your data for visualization
    return data.map((item) => ({
      ...item,
      // Add additional computed properties here
      formattedValue: `${valuePrefix}${item.value.toLocaleString()}${valueSuffix}`,
    }));
  }, [data, valuePrefix, valueSuffix]);

  // Handle loading state
  if (isLoading) {
    return (
      <Card sx={{ ...sx }}>
        <CardHeader title={title} subheader={subtitle} />
        <CardContent>
          <Box
            sx={{
              height,
              width,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={40} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card sx={{ ...sx }}>
        <CardHeader title={title} subheader={subtitle} />
        <CardContent>
          <Box
            sx={{
              height,
              width,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="error">{error}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <Card sx={{ ...sx }}>
        <CardHeader title={title} subheader={subtitle} />
        <CardContent>
          <Box
            sx={{
              height,
              width,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Main render with data
  return (
    <Card sx={{ ...sx }}>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent>
        <Box
          sx={{
            height,
            width,
            // Additional styling here
          }}
        >
          {/*
            This is where your actual chart implementation goes.
            For example:

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          */}
          <Typography>Implement chart visualization here</Typography>
          <Typography>Data sample: {processedData[0]?.formattedValue}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChartComponentTemplate;
