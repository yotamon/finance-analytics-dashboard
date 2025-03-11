import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useI18n } from "../../context/I18nContext";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Since we need to use hooks in the fallback, we'll create a separate component
const DefaultErrorFallback = ({
  error,
  errorInfo,
  onReset,
  componentName,
}: {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset?: () => void;
  componentName?: string;
}) => {
  const { t } = useI18n();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        m: 2,
        border: "1px solid #f44336",
        borderRadius: 2,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" color="error" gutterBottom>
          {t("errors.componentError", { defaultValue: "Component Error" })}
          {componentName && `: ${componentName}`}
        </Typography>

        <Typography variant="body1" paragraph>
          {t("errors.somethingWentWrong", {
            defaultValue: "Something went wrong while rendering this component.",
          })}
        </Typography>

        {error && (
          <Typography
            variant="body2"
            component="pre"
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "grey.100",
              borderRadius: 1,
              overflow: "auto",
              maxHeight: "200px",
              textAlign: "left",
            }}
          >
            {error.toString()}
          </Typography>
        )}

        {onReset && (
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={onReset}>
            {t("errors.tryAgain", { defaultValue: "Try Again" })}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log error messages to an error reporting service here
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.resetErrorBoundary}
          componentName={this.props.componentName}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
