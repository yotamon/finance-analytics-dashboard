import React from "react";
import { Button as MuiButton, ButtonProps as MuiButtonProps, styled } from "@mui/material";

export interface ButtonProps extends Omit<MuiButtonProps, "color"> {
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning" | "default";
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  loadingPosition?: "start" | "end" | "center";
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== "loading" && prop !== "loadingPosition",
})<ButtonProps>(({ theme, loading, loadingPosition }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 600,
  boxShadow: "none",
  position: "relative",
  "&:hover": {
    boxShadow: "none",
  },
  ...(loading && {
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "inherit",
      backgroundColor: "rgba(255, 255, 255, 0.4)",
    },
  }),
}));

const Button: React.FC<ButtonProps> = ({
  children,
  color = "primary",
  variant = "contained",
  size = "medium",
  fullWidth = false,
  startIcon,
  endIcon,
  loading = false,
  loadingPosition = "center",
  disabled = false,
  ...props
}) => {
  return (
    <StyledButton
      color={color}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      disabled={disabled || loading}
      loading={loading}
      loadingPosition={loadingPosition}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
