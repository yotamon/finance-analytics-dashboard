import React, { useRef, useEffect, useState } from "react";
import { Box } from "@mui/material";

/**
 * ChartAdapter component
 * A wrapper for MUI X charts that converts string dimensions to numeric values
 * required by MUI X chart components
 */
interface ChartAdapterProps {
  children: React.ReactNode;
  chartProps?: Record<string, any>;
}

const ChartAdapter: React.FC<ChartAdapterProps> = ({ children, chartProps = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  // Measure container and update chart dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;

      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    };

    // Initial measurement
    updateDimensions();

    // Setup resize observer for responsive behavior
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    // Clean up
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Clone the child element with numeric dimensions
  const childWithProps = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    // Ensure we pass numeric width and height to MUI X Charts
    // This is crucial as MUI X Charts doesn't handle string dimensions well
    return React.cloneElement(child as React.ReactElement<any>, {
      ...(chartProps || {}),
      width: dimensions.width,
      height: dimensions.height,
      style: {
        width: dimensions.width,
        height: dimensions.height,
      },
      sx: {
        ...(child.props.sx || {}),
        width: dimensions.width,
        height: dimensions.height,
        "& .MuiChartsContainer": {
          width: `${dimensions.width}px !important`,
          height: `${dimensions.height}px !important`,
        },
      },
    });
  });

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {childWithProps}
    </Box>
  );
};

export default ChartAdapter;
