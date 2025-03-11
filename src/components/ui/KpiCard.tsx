import { ArrowUpward, ArrowDownward, HelpOutline } from "@mui/icons-material";
import { Card, CardContent, Typography, Box, alpha, Skeleton, Chip, useTheme } from "@mui/material";
import { ReactElement } from "react";

// Define props interface for the KpiCard component
interface KpiCardProps {
  /** The title or label of the KPI card */
  title: string;
  /** The value to display (used if renderValue not provided) */
  value?: string | number;
  /** Custom render function for the value */
  renderValue?: () => React.ReactNode;
  /** Percentage or text describing the change */
  change?: string;
  /** Direction of the trend (affects the arrow icon and color) */
  trend?: "up" | "down";
  /** Loading state of the card */
  isLoading?: boolean;
  /** Icon component to display */
  icon?: React.ElementType;
  /** Gradient key for styling */
  gradient?: string;
}

// Gradient colors mapping type
type GradientMap = {
  [key: string]: string;
};

function KpiCard({
  title,
  value,
  renderValue,
  change,
  trend,
  isLoading = false,
  icon: Icon,
  gradient = "",
}: KpiCardProps): ReactElement {
  const theme = useTheme();
  const isPositive = trend === "up";

  // Map string gradient descriptors to actual gradient values
  const getGradientColors = (gradientKey: string): string => {
    const gradientMap: GradientMap = {
      "from-blue-500 to-indigo-600": `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      "from-emerald-500 to-green-600": `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
      "from-amber-500 to-yellow-600": `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
      "from-purple-500 to-violet-600": `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    };

    return gradientMap[gradientKey] || gradientMap["from-blue-500 to-indigo-600"];
  };

  // Set default gradient if none provided, using MUI theme colors
  const cardGradient = getGradientColors(gradient);

  // Base card styles to avoid duplication
  const cardStyles = {
    height: "100%",
    p: 3,
    borderRadius: 3,
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: "blur(8px)",
    transition: "box-shadow 0.3s ease, transform 0.3s ease",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      boxShadow: theme.shadows[8],
      transform: "translateY(-4px)",
    },
    "&::before": !isLoading
      ? {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "6px",
          height: "100%",
          background: cardGradient,
          borderTopLeftRadius: "inherit",
          borderBottomLeftRadius: "inherit",
        }
      : {},
  };

  if (isLoading) {
    // Enhanced skeleton loading state
    return (
      <Card elevation={2} sx={cardStyles}>
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* Icon skeleton */}
              <Skeleton
                variant="rounded"
                width={40}
                height={40}
                sx={{
                  mr: 1.5,
                  borderRadius: 1.5,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }}
              />
              {/* Title skeleton */}
              <Skeleton variant="text" width={120} height={20} />
            </Box>
            {/* Change percentage skeleton */}
            <Skeleton
              variant="rounded"
              width={60}
              height={24}
              sx={{
                borderRadius: 1.5,
                backgroundColor: alpha(theme.palette.success.main, 0.1),
              }}
            />
          </Box>

          {/* Value skeleton - pulsing animation */}
          <Skeleton
            variant="text"
            width={160}
            height={40}
            sx={{
              mb: 0.5,
              mt: 2.5,
              animation: `${theme.transitions.create(["opacity"], {
                duration: theme.transitions.duration.complex,
                easing: theme.transitions.easing.easeInOut,
              })} 1.5s infinite`,
            }}
          />

          {/* Accent line skeleton */}
          <Skeleton
            variant="rectangular"
            width={64}
            height={4}
            sx={{
              mt: 1,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            }}
          />

          {/* Tooltip text skeleton */}
          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center" }}>
            <Skeleton variant="circular" width={14} height={14} sx={{ mr: 0.5 }} />
            <Skeleton variant="text" width={140} height={16} />
          </Box>

          {/* Subtle loading indicator */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: `linear-gradient(90deg,
								${alpha(theme.palette.primary.main, 0)},
								${alpha(theme.palette.primary.main, 0.6)},
								${alpha(theme.palette.primary.main, 0)})`,
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite",
              "@keyframes shimmer": {
                "0%": {
                  backgroundPosition: "100% 0",
                },
                "100%": {
                  backgroundPosition: "-100% 0",
                },
              },
            }}
          />
        </Box>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={cardStyles}>
      <CardContent sx={{ p: 0, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {Icon && (
              <Box
                sx={{
                  mr: 1.5,
                  color: "white",
                  background: cardGradient,
                  p: 1.25,
                  borderRadius: 1.5,
                  display: "flex",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <Icon size={20} />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
          </Box>

          {change && (
            <Chip
              size="small"
              icon={
                isPositive ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
              }
              label={change}
              color={isPositive ? "success" : "error"}
              sx={{
                height: 24,
                backgroundColor: alpha(
                  isPositive ? theme.palette.success.main : theme.palette.error.main,
                  0.1
                ),
                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 600,
                borderRadius: 1.5,
                "& .MuiChip-icon": {
                  fontSize: "0.8rem",
                  ml: 0.5,
                },
              }}
            />
          )}
        </Box>

        <Typography variant="h4" component="p" fontWeight="bold" sx={{ mt: 2.5, mb: 1 }}>
          {renderValue ? renderValue() : value}
        </Typography>

        {/* Accent line with gradient */}
        <Box
          sx={{
            width: "4rem",
            height: "0.25rem",
            mt: 1,
            borderRadius: "4px",
            background: cardGradient,
            opacity: 0.75,
          }}
        />

        {/* Tooltip/info text */}
        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center" }}>
          <HelpOutline sx={{ fontSize: 14, mr: 0.5, color: theme.palette.text.disabled }} />
          <Typography variant="caption" color="text.disabled">
            Compared to previous period
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default KpiCard;
