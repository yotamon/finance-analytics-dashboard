import React from "react";
import { Box } from "@mui/material";

/**
 * ChartDebugWrapper component
 * A wrapper for MUI X charts that ensures proper width and height are set
 */
interface ChartDebugWrapperProps {
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
}

const ChartDebugWrapper: React.FC<ChartDebugWrapperProps> = ({
  children,
  width = "100%",
  height = 400,
}) => {
  return (
    <Box
      sx={{
        width: width,
        height: height,
        display: "flex",
        position: "relative",
        "& .MuiChartsContainer": {
          width: "100% !important",
          height: "100% !important",
        },
        "& .MuiBaseChart-root": {
          width: "100% !important",
          height: "100% !important",
        },
      }}
    >
      {children}
    </Box>
  );
};

export default ChartDebugWrapper;
