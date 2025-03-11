import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  Box,
  Typography,
  useTheme as useMuiTheme,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { TimeSeriesDataPoint } from "@/types/financial";
import { useTheme } from "@/context/ThemeContext";
import { format } from "date-fns";

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  series: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  title: string;
  subtitle?: string;
  height?: number | string;
  dateFormat?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  connectNulls?: boolean;
  isLoading?: boolean;
  showGridLines?: boolean;
  animationDuration?: number;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  series,
  title,
  subtitle,
  height = 400,
  dateFormat = "MMM d, yyyy",
  valuePrefix = "",
  valueSuffix = "",
  connectNulls = true,
  isLoading = false,
  showGridLines = true,
  animationDuration = 1000,
}) => {
  const { mode } = useTheme();
  const muiTheme = useMuiTheme();
  const chartColors = muiTheme.palette.chart;

  // Format dates and ensure data is sorted chronologically
  const formattedData = useMemo(() => {
    return data
      .map((item) => {
        const dateObj = item.date instanceof Date ? item.date : new Date(item.date);
        return {
          ...item,
          formattedDate: format(dateObj, dateFormat),
          // Convert date to timestamp for proper sorting
          timestamp: dateObj.getTime(),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [data, dateFormat]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ boxShadow: 3, p: 1, bgcolor: "background.paper", maxWidth: 300 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box
              key={`tooltip-item-${index}`}
              sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
            >
              <Box
                component="span"
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: entry.color,
                  mr: 1,
                  display: "inline-block",
                }}
              />
              <Typography variant="body2" sx={{ mr: 1 }}>
                {entry.name}:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {valuePrefix}
                {entry.value.toLocaleString()}
                {valueSuffix}
              </Typography>
            </Box>
          ))}
        </Card>
      );
    }
    return null;
  };

  // Loading state or empty data state
  if (isLoading) {
    return (
      <Card>
        <CardHeader title={title} subheader={subtitle} />
        <CardContent>
          <Box sx={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography color="text.secondary">Loading data...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (formattedData.length === 0) {
    return (
      <Card>
        <CardHeader title={title} subheader={subtitle} />
        <CardContent>
          <Box sx={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={title} subheader={subtitle} />
      <CardContent sx={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGridLines && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
              />
            )}
            <XAxis
              dataKey="formattedDate"
              stroke={muiTheme.palette.text.secondary}
              tick={{ fill: muiTheme.palette.text.secondary }}
              tickLine={{ stroke: muiTheme.palette.text.secondary }}
            />
            <YAxis
              stroke={muiTheme.palette.text.secondary}
              tick={{ fill: muiTheme.palette.text.secondary }}
              tickLine={{ stroke: muiTheme.palette.text.secondary }}
              tickFormatter={(value) => `${valuePrefix}${value.toLocaleString()}${valueSuffix}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {series.map((s, index) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={
                  s.color ||
                  chartColors[Object.keys(chartColors)[index % Object.keys(chartColors).length]]
                }
                activeDot={{ r: 8 }}
                connectNulls={connectNulls}
                strokeWidth={2}
                dot={{
                  stroke:
                    s.color ||
                    chartColors[Object.keys(chartColors)[index % Object.keys(chartColors).length]],
                  strokeWidth: 2,
                  r: 4,
                  fill: muiTheme.palette.background.paper,
                }}
                animationDuration={animationDuration}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TimeSeriesChart;
