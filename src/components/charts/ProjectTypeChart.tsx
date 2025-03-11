import React from "react";
import { useI18n } from "../../context/I18nContext";
import { Box, useTheme, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

// Define interfaces for the component
interface Project {
  type: string;
  capacity: number;
  [key: string]: any;
}

interface ProjectTypeChartProps {
  data: Project[];
}

interface ProjectTypeData {
  name: string;
  capacity: number;
  count: number;
}

interface ChartDataPoint {
  id: string;
  value: number;
  label: string;
}

export function ProjectTypeChart({ data }: ProjectTypeChartProps): JSX.Element {
  const { t } = useI18n();
  const theme = useTheme();

  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box
        sx={{
          height: 400,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">{t("charts.noDataAvailable")}</Typography>
      </Box>
    );
  }

  // Group projects by type and calculate total capacity
  const projectTypes: Record<string, ProjectTypeData> = data.reduce((acc, project) => {
    const type = project.type;
    if (!acc[type]) {
      acc[type] = {
        name: type,
        capacity: 0,
        count: 0,
      };
    }
    acc[type].capacity += project.capacity;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, ProjectTypeData>);

  // Convert to array format for MUI X Charts
  const chartData: ChartDataPoint[] = Object.values(projectTypes).map((type) => ({
    id: type.name,
    value: type.capacity,
    label: type.name,
  }));

  // Colors for different project types
  const sliceColors = [
    "#3b82f6", // On-shore Wind
    "#2563eb", // Off-shore Wind
    "#f59e0b", // Solar Ground
    "#d97706", // Solar Rooftop
  ];

  // Value formatter for tooltips and labels
  const valueFormatter = (value: any): string => {
    if (value === undefined || value === null) {
      return "";
    }
    if (typeof value === "number") {
      return `${Math.round(value)} MW`;
    }
    return `${value}`;
  };

  return (
    <Box sx={{ width: "100%", height: 350 }}>
      <PieChart
        series={[
          {
            data: chartData,
            innerRadius: 60,
            outerRadius: 120,
            paddingAngle: 2,
            cornerRadius: 4,
            highlightScope: { faded: "global", highlighted: "item" },
            valueFormatter,
          },
        ]}
        colors={sliceColors}
        margin={{ top: 10, bottom: 50, left: 10, right: 10 }}
        slotProps={{
          legend: {
            position: { vertical: "bottom", horizontal: "middle" },
            labelStyle: {
              fontSize: 14,
              fill: theme.palette.text.primary,
            },
          },
        }}
        height={350}
      />
    </Box>
  );
}

export default ProjectTypeChart;
