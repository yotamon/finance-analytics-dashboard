import React from "react";
import { Box, useTheme, Typography } from "@mui/material";
import { ScatterChart } from "@mui/x-charts/ScatterChart";
import PropTypes from "prop-types";

export function ProjectPortfolioChart({ data }) {
  const theme = useTheme();

  // Handle empty or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No project data available
        </Typography>
      </Box>
    );
  }

  // Separate wind and solar projects
  const windProjects = data.filter((p) => p?.type?.includes("Wind") || false);
  const solarProjects = data.filter((p) => p?.type?.includes("Solar") || false);

  // Prepare data for MUI X Charts
  const windData = windProjects.map((project) => ({
    x: project.capacity || 0, // Capacity on x-axis
    y: project.investmentCost || 0, // Investment on y-axis
    size: (project.irr || 0) * 100, // IRR determines the bubble size
    id: project.name || `Project-${Math.random().toString(36).substr(2, 5)}`, // Name as ID
    ...project, // Include all project data for tooltip
  }));

  const solarData = solarProjects.map((project) => ({
    x: project.capacity || 0,
    y: project.investmentCost || 0,
    size: (project.irr || 0) * 100,
    id: project.name || `Project-${Math.random().toString(36).substr(2, 5)}`,
    ...project,
  }));

  // Don't render chart if there's no data after filtering
  if (windData.length === 0 && solarData.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No Wind or Solar projects found
        </Typography>
      </Box>
    );
  }

  // Custom tooltip formatter
  const valueFormatter = (value, type) => {
    if (!value)
      return type === "x" ? "0 MW" : type === "y" ? "€0M" : type === "size" ? "0.0%" : "N/A";
    if (type === "x") return `${value} MW`;
    if (type === "y") return `€${value}M`;
    if (type === "size") return `${value.toFixed(1)}%`;
    return value;
  };

  // Function to get the tooltip content (project details)
  const getTooltipContent = (params) => {
    if (!params || !params.item) {
      return ["No data available"];
    }

    const { item } = params;

    return [
      `${item.id || "Unknown Project"}`,
      `${item.type || "Unknown Type"} | ${item.country || "Unknown Country"}`,
      `Capacity: ${item.x || 0} MW`,
      `Investment: €${item.y || 0}M`,
      `IRR: ${(item.size || 0).toFixed(1)}%`,
    ];
  };

  // Get safe max values with fallbacks
  const safeMaxCapacity = Math.max(0, ...data.map((p) => p?.capacity || 0)) * 1.1 || 100;
  const safeMaxInvestment = Math.max(0, ...data.map((p) => p?.investmentCost || 0)) * 1.1 || 100;

  return (
    <Box sx={{ width: "100%", height: 400 }}>
      <ScatterChart
        series={[
          {
            label: "Wind Projects",
            data: windData,
            valueFormatter,
            color: theme.palette.primary.main,
            markerSize: 12, // Base marker size, will be multiplied by the normalized IRR value
          },
          {
            label: "Solar Projects",
            data: solarData,
            valueFormatter,
            color: theme.palette.warning.main,
            markerSize: 12,
          },
        ]}
        xAxis={[
          {
            label: "Capacity (MW)",
            min: 0,
            max: safeMaxCapacity,
          },
        ]}
        yAxis={[
          {
            label: "Investment (€M)",
            min: 0,
            max: safeMaxInvestment,
          },
        ]}
        margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
        height={400}
        slotProps={{
          legend: {
            position: { vertical: "top", horizontal: "right" },
          },
        }}
        tooltip={{
          trigger: "item",
          itemContent: getTooltipContent,
        }}
      />
    </Box>
  );
}

ProjectPortfolioChart.propTypes = {
  data: PropTypes.array.isRequired,
};
