import React from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { useI18n } from "../../context/I18nContext";
import { Box, useTheme, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { motion } from "framer-motion";
import { RevenueEbitdaChartProps, RevenueEbitdaTooltipProps } from "../../types/chart-types";
import ChartDebugWrapper from "../debug/ChartDebugWrapper";

export function RevenueEbitdaChart({
  data,
  height = 400,
  width,
  showValues = true,
  showGrowth = false,
  colors,
  options,
}: RevenueEbitdaChartProps): JSX.Element {
  const { convert, currency } = useCurrency();
  const { t } = useI18n();
  const theme = useTheme();

  // Check if data is valid
  if (
    !data ||
    !data.years ||
    !data.revenues ||
    !data.ebitda ||
    data.years.length === 0 ||
    data.revenues.length === 0 ||
    data.ebitda.length === 0
  ) {
    console.warn("RevenueEbitdaChart: Invalid or missing data", data);
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
          Please upload financial projection data to view this chart.
        </Typography>
      </Box>
    );
  }

  // Format years data for x-axis
  const years = data.years.map((year) => year.toString());

  // Format revenue and EBITDA data
  const revenueData = data.revenues.map((value) => (value !== null ? convert(value) : null));
  const ebitdaData = data.ebitda.map((value) => (value !== null ? convert(value) : null));

  // Calculate year-over-year growth rates if enabled
  const revenueGrowth = showGrowth
    ? revenueData.map((value, index) => {
        if (index === 0 || value === null || revenueData[index - 1] === null) return null;
        const prevValue = revenueData[index - 1];
        return prevValue !== null && prevValue !== 0
          ? ((value - prevValue) / prevValue) * 100
          : null;
      })
    : [];

  // EBITDA percentage for each year
  const ebitdaPercentages = data.years.map((_, index) => {
    if (data.revenues[index] === 0 || data.revenues[index] === null) return "0";
    return data.revenues[index] > 0
      ? ((data.ebitda[index] / data.revenues[index]) * 100).toFixed(1)
      : "0";
  });

  // Get a gradient for the bars - adjusted from theme colors
  const revenueColor = theme.palette.success.main;
  const ebitdaColor = theme.palette.success.dark;

  const valueFormatter = (value: number | null): string => {
    if (value === null || isNaN(Number(value))) return "-";
    return `${currency.code} ${value.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
  };

  /**
   * Custom tooltip that shows EBITDA margin percentage
   * @param props - The tooltip props
   * @returns The tooltip component
   */
  const customTooltip = (props: RevenueEbitdaTooltipProps): React.ReactNode => {
    // Destructure only the props we need to avoid unused variable warnings
    const { itemIndex } = props;

    // If item index is undefined, don't render tooltip
    if (itemIndex === undefined) return null;

    // Get the year
    const year = years[itemIndex];

    // Get values for this year
    const revenue = revenueData[itemIndex];
    const ebitda = ebitdaData[itemIndex];
    const ebitdaPercentage = ebitdaPercentages[itemIndex];

    return (
      <Box
        sx={{
          p: 1.5,
          bgcolor: "background.paper",
          boxShadow: theme.shadows[4],
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          minWidth: 180,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {year}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <span>{t("metric.revenue")}:</span>
            <span style={{ fontWeight: 600, color: revenueColor }}>{valueFormatter(revenue)}</span>
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <span>{t("metric.ebitda")}:</span>
            <span style={{ fontWeight: 600, color: ebitdaColor }}>{valueFormatter(ebitda)}</span>
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 0.5,
              pt: 0.5,
              borderTop: `1px dashed ${theme.palette.divider}`,
            }}
          >
            <span>{t("metric.ebitdaMargin")}:</span>
            <span style={{ fontWeight: 600, color: theme.palette.warning.main }}>
              {ebitdaPercentage}%
            </span>
          </Typography>
        </Box>
      </Box>
    );
  };

  // Prepare chart content
  return (
    <ChartDebugWrapper height={height} width={width || "100%"}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{
              mb: 2,
              fontStyle: "italic",
              position: "absolute",
              top: 0,
              left: 20,
              opacity: 0.8,
            }}
          >
            {t("charts.revenueEbitda.subtitle") ||
              "Showing substantial growth from 2024-2029 as projects come online"}
          </Typography>

          <Box sx={{ width: "100%", height: height || 400 }}>
            <BarChart
              xAxis={[
                {
                  data: years,
                  scaleType: "band",
                  label: t("charts.axis.year"),
                  labelStyle: {
                    fontSize: 12,
                    fill: theme.palette.text.secondary,
                  },
                  tickLabelStyle: {
                    fontSize: 11,
                    fill: theme.palette.text.secondary,
                    fontWeight: 500,
                  },
                },
              ]}
              yAxis={[
                {
                  label: `${t("charts.axis.value")} (${currency.code} Millions)`,
                  labelStyle: {
                    fontSize: 12,
                    fill: theme.palette.text.secondary,
                  },
                  tickLabelStyle: {
                    fontSize: 11,
                    fill: theme.palette.text.secondary,
                  },
                },
              ]}
              series={[
                {
                  data: revenueData,
                  label: t("metric.revenue"),
                  valueFormatter,
                  color: revenueColor,
                  // Highlight options
                  highlightScope: {
                    item: true,
                  },
                },
                {
                  data: ebitdaData,
                  label: t("metric.ebitda"),
                  valueFormatter,
                  color: ebitdaColor,
                  highlightScope: {
                    item: true,
                  },
                },
              ]}
              height={height || 400}
              width={width || "100%"}
              margin={{ top: 50, right: 50, left: 60, bottom: 60 }}
              tooltip={{ trigger: "item" }}
              sx={{
                "& .MuiChartsAxis-tickLabel": {
                  fontSize: "0.75rem",
                },
                "& .MuiChartsAxis-line": {
                  stroke: theme.palette.divider,
                },
                "& .MuiChartsAxis-tick": {
                  stroke: theme.palette.divider,
                },
                "& .MuiBarElement-root:hover": {
                  filter: "brightness(1.1)",
                },
              }}
              slotProps={{
                legend: {
                  position: { vertical: "bottom", horizontal: "middle" },
                  padding: 20,
                  labelStyle: {
                    fontSize: 12,
                    fill: theme.palette.text.primary,
                  },
                },
              }}
            />
          </Box>
        </Box>
      </motion.div>
    </ChartDebugWrapper>
  );
}

export default RevenueEbitdaChart;
