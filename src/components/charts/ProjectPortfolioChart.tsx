import React from "react";
import { Box, useTheme, Typography } from "@mui/material";
import { ScatterChart, ChartsTooltip } from "@mui/x-charts";
import { useI18n } from "../../context/I18nContext";

// Import Project interface from types
import { Project } from "../../types/project-types";

interface ProjectPortfolioChartProps {
  data: Project[];
  height?: number;
  width?: number;
  showValues?: boolean;
  colors?: {
    wind?: string;
    solar?: string;
  };
  options?: Record<string, any>;
}

export function ProjectPortfolioChart({
  data,
  height = 400,
  width,
  showValues = true,
  colors,
  options,
}: ProjectPortfolioChartProps): JSX.Element {
  const { t } = useI18n();
  const theme = useTheme();

  // Check if data is valid
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography color="text.secondary">{t("charts.noDataAvailable")}</Typography>
        <Typography variant="caption" color="text.secondary">
          Please upload project data to view this portfolio overview.
        </Typography>
      </Box>
    );
  }

  // Transform project data for scatter chart
  const scatterData = data.map((project, index) => ({
    id: project.name || `project-${index}`,
    x: project.investmentCost || 0,
    y: project.capacity || 0,
    size: (project.irr || 0) * 1000, // Make IRR more visible by scaling
    name: project.name,
    type: project.type,
    country: project.country,
    irr: project.irr,
    status: project.status,
  }));

  // Group projects by type
  const projectTypes = [...new Set(data.map((project) => project.type))];

  // Create series for each project type
  const series = projectTypes.map((type) => ({
    type: "scatter" as const,
    label: type,
    data: scatterData.filter((d) => {
      const projectType = data.find((p) => p.name === d.name)?.type;
      return projectType === type;
    }),
    valueFormatter: (value: any) => {
      if (typeof value === "number") {
        return value.toFixed(0);
      }
      return String(value);
    },
  }));

  return (
    <Box
      sx={{
        width: width || "100%",
        height,
        position: "relative",
      }}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{
          fontStyle: "italic",
          position: "absolute",
          top: 0,
          left: 20,
          opacity: 0.7,
        }}
      >
        {t("charts.projectPortfolio.subtitle") || "Project distribution by capacity and investment"}
      </Typography>

      <ScatterChart
        series={series}
        width={width || 500}
        height={height}
        xAxis={[
          {
            label: "Investment Cost (million)",
            min: 0,
          },
        ]}
        yAxis={[
          {
            label: "Capacity (MW)",
            min: 0,
          },
        ]}
        sx={{
          "& .MuiChartsAxis-label": {
            fill: theme.palette.text.secondary,
          },
          "& .MuiChartsAxis-tick": {
            stroke: theme.palette.divider,
          },
        }}
      />
    </Box>
  );
}

export default ProjectPortfolioChart;
