import React from "react";
import { LinearProgress, Box, Typography, styled } from "@mui/material";

export interface LoadingProgressBarProps {
  value?: number;
  label?: string;
  showPercentage?: boolean;
  height?: number;
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  variant?: "determinate" | "indeterminate" | "buffer" | "query";
  sx?: any;
}

const StyledLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== "height",
})<{ height?: number }>(({ theme, height }) => ({
  height: height || 8,
  borderRadius: (height || 8) / 2,
  backgroundColor:
    theme.palette.mode === "light" ? theme.palette.grey[200] : theme.palette.grey[800],
  "& .MuiLinearProgress-bar": {
    borderRadius: (height || 8) / 2,
  },
}));

const LoadingProgressBar: React.FC<LoadingProgressBarProps> = ({
  value = 0,
  label,
  showPercentage = false,
  height = 8,
  color = "primary",
  variant = "determinate",
  sx = {},
}) => {
  return (
    <Box sx={{ width: "100%", ...sx }}>
      {label && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {showPercentage && variant === "determinate" && (
            <Typography variant="body2" color="text.secondary">
              {Math.round(value)}%
            </Typography>
          )}
        </Box>
      )}
      <StyledLinearProgress variant={variant} value={value} color={color} height={height} />
    </Box>
  );
};

export default LoadingProgressBar;
