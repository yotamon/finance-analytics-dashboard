import React from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { useI18n } from "../../context/I18nContext";
import { Box, useTheme, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { motion } from "framer-motion";

export function RevenueEbitdaChart({ data }) {
  const { convert, currency } = useCurrency();
  const { t } = useI18n();
  const theme = useTheme();

  // Format years data for x-axis
  const years = data.years.map((year) => year.toString());

  // Format revenue and EBITDA data
  const revenueData = data.years.map((_, index) => convert(data.revenues[index]));
  const ebitdaData = data.years.map((_, index) => convert(data.ebitda[index]));

  // EBITDA percentage for each year
  const ebitdaPercentages = data.years.map((_, index) =>
    data.revenues[index] > 0 ? ((data.ebitda[index] / data.revenues[index]) * 100).toFixed(1) : 0
  );

  // Get a gradient for the bars - adjusted from theme colors
  const revenueColor = theme.palette.success.main;
  const ebitdaColor = theme.palette.success.dark;

  // Value formatter for tooltips
  const valueFormatter = (value) => `${currency.symbol}${value.toFixed(1)}M`;

  // Custom tooltip that shows EBITDA margin percentage
  const customTooltip = (props) => {
    const { itemIndex, series, axisValue } = props;

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

  return (
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
          {t("charts.revenueEbitda.subtitle", {
            defaultValue: "Showing substantial growth from 2024-2029 as projects come online",
          })}
        </Typography>

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
              // Create bar gradient effect
              highlightScope: {
                itemWithDimensions: "item",
                faded: {
                  color: "gray",
                  opacity: 0.3,
                },
              },
            },
            {
              data: ebitdaData,
              label: t("metric.ebitda"),
              valueFormatter,
              color: ebitdaColor,
              highlightScope: {
                itemWithDimensions: "item",
                faded: {
                  color: "gray",
                  opacity: 0.3,
                },
              },
            },
          ]}
          height={400}
          margin={{ top: 50, right: 50, left: 60, bottom: 60 }}
          tooltip={{
            trigger: "item",
            renderer: customTooltip,
          }}
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
    </motion.div>
  );
}
