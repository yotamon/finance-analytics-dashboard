import { Database, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import KpiCard from "../ui/KpiCard";
import CurrencyDisplay from "../ui/CurrencyDisplay";
import { useData } from "../../context/DataContext";
import { useI18n } from "../../context/I18nContext";
import { Grid } from "@mui/material";
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Tooltip,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Stack,
  Divider,
} from "@mui/material";
import { useCurrency } from "../../context/CurrencyContext";
import { motion } from "framer-motion";
import {
  Bolt,
  TrendingUp as TrendingUpIcon,
  Architecture,
  Euro,
  Factory,
  Public,
  PieChart,
} from "@mui/icons-material";

// Update KpiContainer to support compact mode for mobile
export default function KpiContainer({ projectData, sx = {}, compact = false }) {
  const { convert, format, currency } = useCurrency();
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Automatically use compact mode on small screens
  const useCompactMode = compact || isMobile;

  // Return early if no data
  if (!projectData || !projectData.length) {
    return null;
  }

  // Calculate aggregated KPIs
  const totalProjects = projectData.length;
  const totalCapacity = projectData.reduce((sum, p) => sum + (p.capacity || 0), 0);
  const totalInvestment = projectData.reduce((sum, p) => sum + (p.investmentCost || 0), 0);
  const avgIrr = projectData.reduce((sum, p) => sum + (p.irr || 0), 0) / totalProjects;
  const avgEbitdaMargin =
    projectData.reduce((sum, p) => sum + (p.ebitdaMargin || 0), 0) / totalProjects;

  // Calculate additional metrics
  const uniqueCountriesCount = [...new Set(projectData.map((p) => p.country))].length;
  const uniqueTypesCount = [...new Set(projectData.map((p) => p.type))].length;

  // Organize metrics with icons for compact view
  const metrics = [
    {
      label: t("metric.totalInvestment"),
      value: totalInvestment,
      format: (value) => `${currency.symbol}${Math.round(convert(value))}M`,
      secondaryText: `${t("metric.projects")}: ${totalProjects}`,
      tertiaryText: `${Math.round(totalInvestment / totalProjects)}M ${t("metric.average")}`,
      icon: Euro,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    },
    {
      label: t("metric.totalCapacity"),
      value: totalCapacity,
      format: (value) => `${Math.round(value)} MW`,
      secondaryText: `${(totalCapacity / totalInvestment).toFixed(1)} MW/${t(
        "metric.currencyUnit"
      )}`,
      tertiaryText: `${Math.round(totalCapacity / totalProjects)} MW ${t("metric.average")}`,
      icon: Bolt,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
    },
    {
      label: t("metric.averageIrr"),
      value: avgIrr,
      format: (value) => `${(value * 100).toFixed(1)}%`,
      secondaryText: t("metric.irrRange"),
      tertiaryText: `${(Math.min(...projectData.map((p) => p.irr || 0)) * 100).toFixed(1)}% - ${(
        Math.max(...projectData.map((p) => p.irr || 0)) * 100
      ).toFixed(1)}%`,
      icon: TrendingUpIcon,
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
    },
    {
      label: t("metric.projectTypes"),
      value: uniqueTypesCount,
      format: (value) => value,
      secondaryText: `${uniqueCountriesCount} ${t("metric.countries")}`,
      tertiaryText: "",
      icon: PieChart,
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    },
    {
      label: t("metric.countries"),
      value: uniqueCountriesCount,
      format: (value) => value,
      secondaryText: `${Math.round(totalProjects / uniqueCountriesCount)} ${t(
        "metric.projectsPerCountry"
      )}`,
      tertiaryText: "",
      icon: Public,
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
    },
  ];

  // If compact mode, render compact KPI cards with icons
  if (useCompactMode) {
    return (
      <Box sx={{ ...sx }}>
        <Grid container spacing={1.5}>
          {metrics.map((metric, index) => {
            const Icon = metric.icon;

            return (
              <Grid item xs={4} sm={2.4} key={metric.label}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 1.5,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 3,
                      position: "relative",
                      overflow: "hidden",
                      background: alpha(metric.color, 0.05),
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: metric.gradient,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                        background: metric.gradient,
                        color: "#fff",
                        boxShadow: `0 4px 8px ${alpha(metric.color, 0.3)}`,
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>
                    <Typography
                      variant="h6"
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
                    >
                      {metric.format(metric.value)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      align="center"
                      noWrap
                      sx={{ opacity: 0.8 }}
                    >
                      {metric.label}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }

  // Original full-size KPI view with enhanced styling
  return (
    <Box sx={{ ...sx }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
          },
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <Grid container spacing={0}>
          {metrics.slice(0, 4).map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={metric.label}>
                <motion.div
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      p: 2.5,
                      position: "relative",
                      height: "100%",
                      borderRight:
                        index < 3 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : "none",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "30%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 1.5,
                          background: metric.gradient,
                          color: "#fff",
                          boxShadow: `0 4px 8px ${alpha(metric.color, 0.25)}`,
                        }}
                      >
                        <Icon fontSize="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {metric.label}
                      </Typography>
                    </Box>

                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ mb: 1, letterSpacing: "-0.02em" }}
                    >
                      {metric.format(metric.value)}
                    </Typography>

                    <Stack spacing={0.5}>
                      {metric.secondaryText && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Chip
                            size="small"
                            label={metric.tertiaryText || "N/A"}
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 500,
                              backgroundColor: alpha(metric.color, 0.1),
                              color: metric.color,
                              border: `1px solid ${alpha(metric.color, 0.2)}`,
                            }}
                          />
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
}
