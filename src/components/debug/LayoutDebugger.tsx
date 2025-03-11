import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, IconButton, Tooltip } from "@mui/material";
import { useLocation } from "react-router-dom";

interface LayoutDebuggerProps {
  name?: string;
  color?: string;
  children?: React.ReactNode;
}

/**
 * LayoutDebugger component for visualizing layout structure
 * Adds colored borders and labels to help debug layout issues
 */
const LayoutDebugger: React.FC<LayoutDebuggerProps> = ({
  name = "Component",
  color = "#2196f3",
  children,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const location = useLocation();

  useEffect(() => {
    const updateDimensions = () => {
      const element = document.getElementById(`layout-debugger-${name}`);
      if (element) {
        setDimensions({
          width: element.offsetWidth,
          height: element.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Update dimensions when route changes
    const timer = setTimeout(updateDimensions, 100);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timer);
    };
  }, [name, location.pathname, children]);

  return (
    <Box
      id={`layout-debugger-${name}`}
      sx={{
        position: "relative",
        border: isVisible ? `2px dashed ${color}` : "none",
        padding: isVisible ? 1 : 0,
        margin: isVisible ? 1 : 0,
        borderRadius: 1,
        width: "100%",
        height: "100%",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {isVisible && (
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            top: -15,
            left: 10,
            padding: "2px 8px",
            backgroundColor: color,
            color: "#fff",
            borderRadius: "4px",
            fontSize: "10px",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="caption">{name}</Typography>
          <Typography variant="caption">
            {dimensions.width}x{dimensions.height}
          </Typography>
          <Tooltip title="Toggle visibility">
            <IconButton
              size="small"
              onClick={() => setIsVisible(false)}
              sx={{
                width: 14,
                height: 14,
                color: "#fff",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              }}
            >
              <span style={{ fontSize: "10px" }}>×</span>
            </IconButton>
          </Tooltip>
        </Paper>
      )}
      {children}
    </Box>
  );
};

export default LayoutDebugger;
