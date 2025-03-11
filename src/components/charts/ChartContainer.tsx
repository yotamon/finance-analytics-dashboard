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
import { useState, useRef, useEffect, ReactNode } from "react";
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

// Define types for the component props
export type ChartHeight = "xs" | "sm" | "md" | "lg" | "xl";

export interface ChartContainerProps {
  title: string;
  description: string;
  children: ReactNode;
  height?: ChartHeight;
  width?: string | number;
  icon: any; // This should be improved to a more specific type if possible
  onHide?: () => void;
  onResizeCard?: (size: ChartHeight) => void;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  children,
  height = "sm",
  width = "100%",
  icon: Icon,
  onHide,
  onResizeCard,
}) => {
  const theme = useTheme();

  // Add state for menu visibility
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [maximized, setMaximized] = useState<boolean>(false);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement | null>(null);

  const menuOpen = Boolean(menuAnchorEl);
  const sizeMenuOpen = Boolean(sizeMenuAnchorEl);

  // Handle ESC key to close maximized view
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape" && maximized) {
        setMaximized(false);
      }
    }

    if (maximized) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [maximized]);

  // Function to download chart as image
  const downloadAsImage = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-chart.png`;
      link.click();
    } catch (error) {
      console.error("Error exporting chart as image:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  // Function to export chart data
  const exportData = () => {
    // Since we don't have direct access to the chart data here,
    // we'll dispatch a custom event that the parent can listen for
    const exportEvent = new CustomEvent("exportChartData", {
      detail: { title },
    });
    document.dispatchEvent(exportEvent);
    handleMenuClose();
  };

  // Function to handle card size changes
  const handleSizeChange = (size: ChartHeight) => {
    if (onResizeCard) {
      onResizeCard(size);
    }
    handleSizeMenuClose();
  };

  // Function to maximize the chart
  const handleMaximize = () => {
    setMaximized(true);
    handleMenuClose();
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Size menu handlers
  const handleSizeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSizeMenuAnchorEl(event.currentTarget);
    if (menuAnchorEl) {
      setMenuAnchorEl(null);
    }
  };

  const handleSizeMenuClose = () => {
    setSizeMenuAnchorEl(null);
  };

  // Function to hide the chart
  const handleHide = () => {
    if (onHide) {
      onHide();
    }
    handleMenuClose();
  };

  // Get height based on size
  const getHeightFromSize = (): string => {
    switch (height) {
      case "xs":
        return "300px";
      case "sm":
        return "400px";
      case "md":
        return "500px";
      case "lg":
        return "600px";
      case "xl":
        return "700px";
      default:
        return "400px";
    }
  };

  // Toggle info dialog
  const handleInfoToggle = () => {
    setInfoOpen(!infoOpen);
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
            borderRadius: 3,
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
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {Icon && (
              <Box
                sx={{
                  mr: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "30%",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: "#fff",
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
              >
                <Icon fontSize="small" />
              </Box>
            )}
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Download as Image">
              <IconButton edge="end" onClick={downloadAsImage} size="small" sx={{ mx: 0.5 }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton edge="end" onClick={exportData} size="small" sx={{ mx: 0.5 }}>
                <TextSnippetIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton
                edge="end"
                onClick={() => setMaximized(false)}
                size="small"
                sx={{ ml: 0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <div
            ref={chartRef}
            style={{
              height: "calc(100vh - 200px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {children}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Regular card view
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 3,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 4px 20px rgba(0, 0, 0, 0.25)"
            : "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: `1px solid ${alpha(
          theme.palette.divider,
          theme.palette.mode === "dark" ? 0.1 : 0.05
        )}`,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 6px 25px rgba(0, 0, 0, 0.3)"
              : "0 6px 25px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)",
        },
      }}
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {Icon && (
              <Box
                sx={{
                  mr: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "30%",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: "#fff",
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
              >
                <Icon fontSize="small" />
              </Box>
            )}
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
        }
        action={
          <Box>
            <Tooltip title="Chart Info">
              <IconButton size="small" onClick={handleInfoToggle} sx={{ mx: 0.25 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Change Size">
              <IconButton size="small" onClick={handleSizeMenuOpen} sx={{ mx: 0.25 }}>
                <AspectRatioIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chart Options">
              <IconButton size="small" onClick={handleMenuOpen} sx={{ mx: 0.25 }}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
        }}
      />

      <CardContent
        sx={{
          flex: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Paper
          ref={chartRef}
          elevation={1}
          sx={{
            height: maximized ? "calc(100vh - 64px)" : getHeightFromSize(),
            width: maximized ? "100%" : width,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            transition: "height 0.3s ease",
          }}
        >
          <div
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              flex: 1,
              minHeight: 0,
            }}
          >
            {children}
          </div>
        </Paper>
      </CardContent>

      {/* Information Dialog */}
      <Dialog
        open={infoOpen}
        onClose={handleInfoToggle}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="h6">{title} - Information</Typography>
          <IconButton size="small" onClick={handleInfoToggle}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
            {description}
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Menu for Options */}
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 20px rgba(0, 0, 0, 0.25)"
                : "0 4px 20px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <MenuItem onClick={handleMaximize}>
          <ListItemIcon>
            <AspectRatioIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Maximize</ListItemText>
        </MenuItem>
        <MenuItem onClick={downloadAsImage}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as Image</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportData}>
          <ListItemIcon>
            <TextSnippetIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Data</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleHide}>
          <ListItemIcon>
            <VisibilityOffIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hide Chart</ListItemText>
        </MenuItem>
      </Menu>

      {/* Menu for Size Options */}
      <Menu
        anchorEl={sizeMenuAnchorEl}
        open={sizeMenuOpen}
        onClose={handleSizeMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 20px rgba(0, 0, 0, 0.25)"
                : "0 4px 20px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <MenuItem onClick={() => handleSizeChange("xs")} selected={height === "xs"}>
          <ListItemText>Extra Small</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSizeChange("sm")} selected={height === "sm"}>
          <ListItemText>Small</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSizeChange("md")} selected={height === "md"}>
          <ListItemText>Medium</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSizeChange("lg")} selected={height === "lg"}>
          <ListItemText>Large</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSizeChange("xl")} selected={height === "xl"}>
          <ListItemText>Extra Large</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ChartContainer;
