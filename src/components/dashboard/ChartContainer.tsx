import {
  Info,
  MoreHorizontal,
  Maximize2,
  Download,
  FileText,
  EyeOff,
  Layout,
  X,
} from "lucide-react";
import React, { useState, useRef, useEffect, ReactNode, RefObject } from "react";
import html2canvas from "html2canvas";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Paper,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Zoom,
  Theme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { motion } from "framer-motion";
import { useI18n } from "../../context/I18nContext";

// Define types for the component props
export type ChartHeight = "xs" | "sm" | "md" | "lg" | "xl" | "full";

// Define chart size types for resizing
export type ChartSize = "1/3" | "1/2" | "full" | string;

// Define props interface for ChartContainer
interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  height?: ChartHeight;
  icon?: React.ElementType;
  onHide?: () => void;
  onResizeCard?: (size: ChartSize) => void;
  extraActions?: React.ReactNode;
  infoContent?: React.ReactNode;
  autoHeight?: boolean;
  className?: string;
  noPadding?: boolean;
  transparentBg?: boolean;
  exportFileName?: string;
  exportData?: any;
  fullWidth?: boolean;
  minHeight?: number | string;
  maxHeight?: number | string;
  disableOptions?: boolean;
  disableExport?: boolean;
  initialShowInfo?: boolean;
  isTableContent?: boolean;
}

function ChartContainer({
  title,
  description,
  children,
  height = "sm",
  icon: Icon,
  onHide,
  onResizeCard,
  extraActions,
  infoContent,
  autoHeight = false,
  className = "",
  noPadding = false,
  transparentBg = false,
  exportFileName = "chart-export",
  exportData: exportDataProp,
  fullWidth = false,
  minHeight,
  maxHeight,
  disableOptions = false,
  disableExport = false,
  initialShowInfo = false,
  isTableContent = false,
}: ChartContainerProps) {
  const theme = useTheme();
  const { t } = useI18n();
  const chartRef = useRef<HTMLDivElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [maximized, setMaximized] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(initialShowInfo);
  const [chartError, setChartError] = useState<boolean>(false);
  const [fallbackTitle, setFallbackTitle] = useState<string>(title); // For missing translations

  // Try to get translation or use fallback
  useEffect(() => {
    try {
      // Check if the title is a translation key
      if (title.includes(".")) {
        const translatedTitle = t(title);
        // If translation returns the key itself, use the fallback
        if (translatedTitle === title) {
          // Try to create a more user-friendly fallback from the key
          const parts = title.split(".");
          if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            // Convert camelCase to Title Case
            const formatted = lastPart
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            setFallbackTitle(formatted);
          }
        } else {
          setFallbackTitle(translatedTitle);
        }
      }
    } catch (err) {
      console.error("Error processing title:", err);
    }
  }, [title, t]);

  // Handle escape key to exit maximized mode
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape" && maximized) {
        setMaximized(false);
      }
    }

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [maximized]);

  // Error boundary for chart rendering
  useEffect(() => {
    setChartError(false);
  }, [children]);

  // Download chart as image
  const downloadAsImage = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: theme.palette.background.paper,
        scale: 2,
        useCORS: true, // Enable CORS for images
        allowTaint: true, // Allow tainted canvas
        logging: false, // Disable logging
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${exportFileName || fallbackTitle.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.click();
    } catch (error) {
      console.error("Error exporting chart as image:", error);
    }
  };

  // Export data
  const exportData = () => {
    if (!exportDataProp) {
      console.warn("No export data provided");
      return;
    }

    try {
      // Convert data to JSON string
      const dataStr = JSON.stringify(exportDataProp, null, 2);
      // Create a blob from the data
      const blob = new Blob([dataStr], { type: "application/json" });
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      // Create a link element
      const link = document.createElement("a");
      link.href = url;
      link.download = `${exportFileName || fallbackTitle.toLowerCase().replace(/\s+/g, "-")}.json`;
      // Append the link to the body
      document.body.appendChild(link);
      // Click the link
      link.click();
      // Remove the link
      document.body.removeChild(link);
      // Release the URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  // Handle chart card size change
  const handleSizeChange = (size: ChartSize) => {
    if (onResizeCard) {
      onResizeCard(size);
    }

    handleMenuClose();
    handleSizeMenuClose();
  };

  // Handle maximize/restore
  const handleMaximize = () => {
    setMaximized(!maximized);
    handleMenuClose();
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Size submenu handlers
  const handleSizeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSizeMenuAnchorEl(event.currentTarget);
    // Don't close the main menu
    event.stopPropagation();
  };

  const handleSizeMenuClose = () => {
    setSizeMenuAnchorEl(null);
  };

  // Handle hide chart
  const handleHide = () => {
    if (onHide) {
      onHide();
    }

    handleMenuClose();
  };

  // Get height based on size
  const getHeightFromSize = (): string | number => {
    if (typeof height === "number") {
      return height;
    }

    // Return height based on size
    switch (height) {
      case "xs":
        return 180;
      case "sm":
        return 240;
      case "md":
        return 320;
      case "lg":
        return 400;
      case "xl":
        return 500;
      case "full":
        return "100%";
      default:
        return 240; // Default to small
    }
  };

  // Toggle info panel
  const handleInfoToggle = () => {
    setShowInfo(!showInfo);
  };

  // Determine if we should try to translate description
  const getDescription = () => {
    if (!description) return "";
    if (description.includes(".")) {
      return t(description);
    }
    return description;
  };

  // Try to translate menu items or provide fallbacks
  const translateMenuItem = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  // If maximized, render in a dialog
  if (maximized) {
    return (
      <Dialog
        open={maximized}
        onClose={() => setMaximized(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {Icon && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                <Icon size={18} />
              </Box>
            )}
            <Typography variant="h6" component="div">
              {fallbackTitle}
            </Typography>
          </Box>
          <IconButton onClick={() => setMaximized(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: noPadding ? 0 : 3,
            height: "calc(90vh - 64px)",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, px: noPadding ? 3 : 0 }}
            >
              {getDescription()}
            </Typography>
          )}
          <Box
            ref={chartRef}
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: minHeight || "auto",
              maxHeight: maxHeight || "none",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {children}
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Regular card view
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      elevation={1}
      sx={{
        height: autoHeight ? "auto" : "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        borderRadius: 1.5,
        border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
        backgroundColor: "#ffffff",
        position: "relative",
        width: fullWidth ? "100%" : "auto",
        boxShadow: `0 1px 3px 0 ${alpha(theme.palette.common.black, 0.04)}`,
        transform: "translateY(0px)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: `0 3px 8px 0 ${alpha(theme.palette.common.black, 0.06)}`,
          transform: "translateY(-2px)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(
              theme.palette.primary.light,
              0.7
            )})`,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          zIndex: 1,
        },
      }}
    >
      <CardHeader
        className="drag-handle"
        sx={{
          p: 1.5,
          paddingLeft: 2,
          paddingRight: 1.5,
          borderBottom: showInfo ? `1px solid ${theme.palette.divider}` : "none",
          cursor: "move", // Add cursor to indicate draggable
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
          },
          "& .MuiCardHeader-action": {
            margin: 0,
            display: "flex",
            alignItems: "center",
          },
          "& .MuiCardHeader-content": {
            overflow: "hidden",
          },
        }}
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            {Icon && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  flexShrink: 0,
                }}
              >
                {React.isValidElement(Icon) ? Icon : <Icon size={16} />}
              </Box>
            )}
            <Typography
              variant="subtitle1"
              component="div"
              noWrap
              sx={{
                fontWeight: 500,
                fontSize: "0.95rem",
                color: theme.palette.text.primary,
              }}
            >
              {fallbackTitle}
            </Typography>
          </Box>
        }
        action={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {extraActions}
            {infoContent && (
              <Tooltip title={translateMenuItem("common.info", "Information")}>
                <IconButton
                  size="small"
                  onClick={handleInfoToggle}
                  sx={{
                    padding: 0.5,
                    color: showInfo ? theme.palette.primary.main : theme.palette.text.secondary,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <InfoIcon fontSize="small" style={{ fontSize: "1.2rem" }} />
                </IconButton>
              </Tooltip>
            )}
            {!disableOptions && (
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                aria-label="chart options"
                aria-controls="chart-menu"
                aria-haspopup="true"
                sx={{
                  padding: 0.5,
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <MoreHorizIcon fontSize="small" style={{ fontSize: "1.2rem" }} />
              </IconButton>
            )}
            <Menu
              id="chart-menu"
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {!disableExport && (
                <MenuItem onClick={downloadAsImage}>
                  <ListItemIcon>
                    <DownloadIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    {translateMenuItem("common.downloadImage", "Download as Image")}
                  </ListItemText>
                </MenuItem>
              )}
              {exportDataProp && !disableExport && (
                <MenuItem onClick={exportData}>
                  <ListItemIcon>
                    <TextSnippetIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    {translateMenuItem("common.exportData", "Export Data")}
                  </ListItemText>
                </MenuItem>
              )}
              <MenuItem onClick={handleMaximize}>
                <ListItemIcon>
                  <AspectRatioIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {maximized
                    ? translateMenuItem("common.restore", "Restore")
                    : translateMenuItem("common.maximize", "Maximize")}
                </ListItemText>
              </MenuItem>
              {onResizeCard && (
                <MenuItem onClick={handleSizeMenuOpen}>
                  <ListItemIcon>
                    <ViewColumnIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{translateMenuItem("common.resize", "Resize")}</ListItemText>
                  <ExpandMoreIcon fontSize="small" />
                </MenuItem>
              )}
              {onHide && (
                <MenuItem onClick={handleHide}>
                  <ListItemIcon>
                    <VisibilityOffIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{translateMenuItem("common.hide", "Hide")}</ListItemText>
                </MenuItem>
              )}
            </Menu>
            {onResizeCard && (
              <Menu
                id="size-menu"
                anchorEl={sizeMenuAnchorEl}
                open={Boolean(sizeMenuAnchorEl)}
                onClose={handleSizeMenuClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <MenuItem onClick={() => handleSizeChange("1/3")}>
                  <ListItemText>{translateMenuItem("common.small", "Small")}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleSizeChange("1/2")}>
                  <ListItemText>{translateMenuItem("common.medium", "Medium")}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleSizeChange("full")}>
                  <ListItemText>{translateMenuItem("common.large", "Large")}</ListItemText>
                </MenuItem>
              </Menu>
            )}
          </Box>
        }
      />

      {/* Card content area with info panel or chart content */}
      {showInfo && infoContent ? (
        <CardContent
          sx={{
            flexGrow: 1,
            p: noPadding ? 0 : 2,
            pb: noPadding ? 0 : "16px !important",
            overflow: "auto",
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            borderTop: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          }}
        >
          <Box sx={{ p: noPadding ? 2 : 0 }}>{infoContent}</Box>
        </CardContent>
      ) : null}

      {/* Main chart content */}
      <CardContent
        sx={{
          flexGrow: 1,
          p: noPadding ? 0 : isTableContent ? 0 : 1.5,
          paddingTop: noPadding ? 0 : isTableContent ? 0 : 1,
          paddingBottom: noPadding ? 0 : "12px !important",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          height: height === "full" ? "100%" : "auto",
          minHeight: minHeight || 280,
          maxHeight: maxHeight || "none",
        }}
      >
        {description && !showInfo && !isTableContent && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              pb: 0.5,
              borderBottom: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
              lineHeight: 1.5,
              fontSize: "0.8rem",
              opacity: 0.85,
            }}
          >
            {getDescription()}
          </Typography>
        )}

        <Box
          ref={chartRef}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: isTableContent ? "flex-start" : "center",
            alignItems: isTableContent ? "stretch" : "center",
            width: "100%",
            height: "100%",
            minHeight: "100px",
            position: "relative",
            overflow: chartError ? "auto" : "hidden",
            pt: isTableContent ? 0 : undefined,
          }}
        >
          {/* Error fallback */}
          {chartError ? (
            <Box
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle1" color="error" gutterBottom>
                {t("common.chartRenderError")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("common.contactSupport")}
              </Typography>
            </Box>
          ) : (
            children
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default ChartContainer;
