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
import { useState, useRef, useEffect } from "react";
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

function ChartContainer({
  title,
  description,
  children,
  height = "sm",
  icon: Icon,
  onHide,
  onResizeCard,
}) {
  const theme = useTheme();

  // Add state for menu visibility
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = useState(null);
  const [maximized, setMaximized] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const chartRef = useRef(null);

  const menuOpen = Boolean(menuAnchorEl);
  const sizeMenuOpen = Boolean(sizeMenuAnchorEl);

  // Handle ESC key to close maximized view
  useEffect(() => {
    function handleEscKey(event) {
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
      /* eslint-disable-next-line no-console */
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
  const handleSizeChange = (size) => {
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
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Size menu handlers
  const handleSizeMenuOpen = (event) => {
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
  const getHeightFromSize = () => {
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
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
          )}
          <Box ref={chartRef} sx={{ width: "100%", height: "600px" }}>
            {children}
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Render the normal card view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
    >
      <Card
        elevation={3}
        sx={{
          height: getHeightFromSize(),
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          transition: "box-shadow 0.3s ease",
          backgroundImage: "none",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.07)",
          "&:hover": {
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "4px",
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(
              theme.palette.primary.main,
              0.7
            )})`,
          },
        }}
      >
        <CardHeader
          avatar={
            Icon && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "30%",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: "#fff",
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Icon fontSize="small" />
              </Box>
            )
          }
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {description && (
                <Tooltip title={description} arrow TransitionComponent={Zoom}>
                  <IconButton
                    size="small"
                    onClick={handleInfoToggle}
                    sx={{ ml: 0.5, color: theme.palette.text.secondary }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          }
          action={
            <Box sx={{ display: "flex" }}>
              <IconButton
                aria-label="resize"
                size="small"
                onClick={handleSizeMenuOpen}
                sx={{ color: theme.palette.text.secondary }}
              >
                <AspectRatioIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="more"
                size="small"
                onClick={handleMenuOpen}
                sx={{ color: theme.palette.text.secondary }}
              >
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{
            p: 2,
            pb: 0,
            "& .MuiCardHeader-action": { m: 0 },
          }}
        />
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
            elevation: 3,
            sx: {
              borderRadius: 2,
              minWidth: 180,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              "& .MuiList-root": {
                py: 1,
              },
              "& .MuiMenuItem-root": {
                py: 1,
                px: 2,
              },
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
            <ListItemText>Download</ListItemText>
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
            <ListItemText>Hide</ListItemText>
          </MenuItem>
        </Menu>
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
            elevation: 3,
            sx: {
              borderRadius: 2,
              minWidth: 180,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              "& .MuiList-root": {
                py: 1,
              },
              "& .MuiMenuItem-root": {
                py: 1,
                px: 2,
              },
            },
          }}
        >
          <MenuItem onClick={() => handleSizeChange("xs")}>
            <ListItemIcon>
              <ViewColumnIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Extra Small</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSizeChange("sm")}>
            <ListItemIcon>
              <ViewColumnIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Small</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSizeChange("md")}>
            <ListItemIcon>
              <ViewColumnIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Medium</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSizeChange("lg")}>
            <ListItemIcon>
              <ViewColumnIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Large</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSizeChange("xl")}>
            <ListItemIcon>
              <ViewColumnIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Extra Large</ListItemText>
          </MenuItem>
        </Menu>
        <CardContent sx={{ height: "calc(100% - 72px)", p: 2, pt: 1 }}>
          <Box
            ref={chartRef}
            sx={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {children}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ChartContainer;
