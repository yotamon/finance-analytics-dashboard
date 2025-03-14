import React from "react";
import { Box, useTheme, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { useI18n } from "../../context/I18nContext";

// Define interfaces for the component
interface Project {
  name: string;
  irr?: number;
  investmentCost?: number;
  type?: string;
  status?: string;
  [key: string]: any;
}

interface InvestmentReturnsChartProps {
  data: Project[];
}

interface ChartDataPoint {
  name: string;
  fullName: string;
  irr: number;
  investment: number;
  type: string;
  status: string;
}

export function InvestmentReturnsChart({ data }: InvestmentReturnsChartProps): JSX.Element {
  const theme = useTheme();
  const { t } = useI18n();

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

  // Sort projects by IRR in descending order and take top 5
  const topProjects = [...data].sort((a, b) => (b.irr || 0) - (a.irr || 0)).slice(0, 5);

  // Format data for the chart, shorten project names if needed
  const chartData: ChartDataPoint[] = topProjects.map((project) => {
    // Shorten project name if it's too long
    const displayName =
      project.name.length > 12 ? project.name.substring(0, 10) + "..." : project.name;

    return {
      name: displayName,
      fullName: project.name,
      irr: project.irr || 0,
      investment: project.investmentCost || 0,
      type: project.type || "Unknown",
      status: project.status || "Unknown",
    };
  });

  // Extract project names for x-axis
  const projectNames = chartData.map((project) => project.name);

  // Extract IRR and investment data
  const irrData = chartData.map((project) => project.irr);
  const investmentData = chartData.map((project) => project.investment);

  // Calculate max values for y-axes scale
  const maxIrr = Math.max(...irrData) * 1.2;
  const maxInvestment = Math.max(...investmentData) * 1.2;

  // Generate colors for IRR bars based on project index
  const irrColors = chartData.map((_, index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.primary.dark,
      theme.palette.secondary.main,
      theme.palette.secondary.dark,
      theme.palette.info.main,
    ];
    return colors[index % colors.length];
  });

  // Value formatters for tooltips and axis labels
  const formatIrr = (value: number | null): string => {
    if (value === null || isNaN(value)) return "0.0%";
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatInvestment = (value: number | null): string => {
    if (value === null || isNaN(value)) return "$0M";
    return `$${value.toLocaleString()}M`;
  };

  return (
    <Box sx={{ width: "100%", height: 400 }}>
      <BarChart
        dataset={chartData}
        xAxis={[
          {
            scaleType: "band",
            data: projectNames,
            tickLabelStyle: {
              angle: 0,
              textAnchor: "middle",
              fontSize: 11,
              fill: theme.palette.text.secondary,
            },
          },
        ]}
        yAxis={[
          {
            id: "irrAxis",
            scaleType: "linear",
            valueFormatter: formatIrr,
            min: 0,
            max: maxIrr,
            tickNumber: 5,
            labelStyle: {
              fontSize: 12,
              fill: theme.palette.text.secondary,
            },
            tickLabelStyle: {
              fontSize: 10,
              fill: theme.palette.text.secondary,
            },
            label: "IRR (%)",
          },
          {
            id: "investmentAxis",
            scaleType: "linear",
            valueFormatter: formatInvestment,
            min: 0,
            max: maxInvestment,
            tickNumber: 5,
            labelStyle: {
              fontSize: 12,
              fill: theme.palette.text.secondary,
            },
            tickLabelStyle: {
              fontSize: 10,
              fill: theme.palette.text.secondary,
            },
            label: "Investment ($M)",
          },
        ]}
        series={[
          {
            id: "irr",
            data: irrData,
            label: "IRR (%)",
            valueFormatter: formatIrr,
            yAxisKey: "irrAxis",
            color: theme.palette.primary.main,
            highlightScope: {
              highlighted: "item",
              faded: "global",
            },
          },
          {
            id: "investment",
            data: investmentData,
            label: "Investment ($M)",
            valueFormatter: formatInvestment,
            yAxisKey: "investmentAxis",
            color: theme.palette.secondary.main,
            highlightScope: {
              highlighted: "item",
              faded: "global",
            },
            opacity: 0.6,
          },
        ]}
        slotProps={{
          legend: {
            position: { vertical: "top", horizontal: "middle" },
            labelStyle: {
              fontSize: 12,
              fill: theme.palette.text.primary,
            },
          },
          bar: {
            radius: 4,
          },
        }}
        margin={{ top: 30, right: 40, left: 60, bottom: 40 }}
        height={400}
      />
    </Box>
  );
}

export default InvestmentReturnsChart;
