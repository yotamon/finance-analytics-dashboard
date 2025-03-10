import { Database, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import KpiCard from "../ui/KpiCard";
import CurrencyDisplay from "../ui/CurrencyDisplay";
import { useData } from "../../context/DataContext";
import { useI18n } from "../../context/I18nContext";
import { Grid } from "@mui/material";
import React from "react";
import { Box, Paper, Typography, Tooltip, Chip, useTheme, alpha, useMediaQuery } from "@mui/material";
import { useCurrency } from "../../context/CurrencyContext";
import { motion } from "framer-motion";
import { Bolt, TrendingUp as TrendingUpIcon, Architecture, Euro, Factory } from "@mui/icons-material";

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
	const avgEbitdaMargin = projectData.reduce((sum, p) => sum + (p.ebitdaMargin || 0), 0) / totalProjects;

	// Calculate additional metrics
	const uniqueCountriesCount = [...new Set(projectData.map(p => p.country))].length;
	const uniqueTypesCount = [...new Set(projectData.map(p => p.type))].length;

	// Organize metrics with icons for compact view
	const metrics = [
		{
			label: t("metric.projects"),
			value: totalProjects,
			format: value => value,
			icon: Architecture,
			color: theme.palette.primary.main
		},
		{
			label: t("metric.capacity"),
			value: totalCapacity,
			format: value => `${Math.round(value)} MW`,
			icon: Bolt,
			color: theme.palette.success.main
		},
		{
			label: t("metric.investment"),
			value: totalInvestment,
			format: value => `${Math.round(convert(value))} ${currency.symbol}M`,
			icon: Euro,
			color: theme.palette.secondary.main
		},
		{
			label: t("metric.avgIrr"),
			value: avgIrr,
			format: value => `${(value * 100).toFixed(1)}%`,
			icon: TrendingUpIcon,
			color: theme.palette.warning.main
		},
		{
			label: t("metric.type"),
			value: [...new Set(projectData.map(p => p.type))].length,
			format: value => value,
			icon: Factory,
			color: theme.palette.info.main
		}
	];

	// If compact mode, render compact KPI cards with icons
	if (useCompactMode) {
		return (
			<Box sx={{ ...sx }}>
				<Grid container spacing={1}>
					{metrics.map((metric, index) => {
						const Icon = metric.icon;

						return (
							<Grid item xs={4} sm={2.4} key={metric.label}>
								<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
									<Paper
										elevation={2}
										sx={{
											p: 1,
											height: "100%",
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											borderRadius: 1,
											position: "relative",
											overflow: "hidden",
											"&::before": {
												content: '""',
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												height: "4px",
												backgroundColor: metric.color
											}
										}}>
										<Box
											sx={{
												width: 36,
												height: 36,
												borderRadius: "50%",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												mb: 0.5,
												backgroundColor: alpha(metric.color, 0.1),
												color: metric.color
											}}>
											<Icon fontSize="small" />
										</Box>
										<Typography variant="h6" align="center" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
											{metric.format(metric.value)}
										</Typography>
										<Typography variant="caption" color="text.secondary" align="center" noWrap>
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

	// Original full-size KPI view - keep your existing rendering code
	return (
		<Box sx={{ ...sx }}>
			<Paper
				elevation={2}
				sx={{
					borderRadius: 2,
					overflow: "hidden",
					position: "relative",
					"&::before": {
						content: '""',
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						height: "4px",
						backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
					}
				}}>
				<Grid container spacing={0} sx={{ p: 2 }}>
					<Grid item xs={12} sm={6} md={3} sx={{ p: 1 }}>
						<Box sx={{ position: "relative" }}>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								{t("metric.totalInvestment")}
							</Typography>
							<Typography variant="h4" fontWeight="bold" gutterBottom>
								{currency.symbol}
								{Math.round(convert(totalInvestment))}M
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Typography variant="body2" component="span" sx={{ mr: 1 }}>
									{t("metric.projects")}: {totalProjects}
								</Typography>
								<Chip size="small" label={`${Math.round(totalInvestment / totalProjects)}M ${t("metric.average")}`} sx={{ height: 20, fontSize: "0.7rem" }} />
							</Box>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6} md={3} sx={{ p: 1 }}>
						<Box>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								{t("metric.totalCapacity")}
							</Typography>
							<Typography variant="h4" fontWeight="bold" gutterBottom>
								{Math.round(totalCapacity)} MW
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Chip size="small" label={`${(totalCapacity / totalInvestment).toFixed(1)} MW/${t("metric.currencyUnit")}`} sx={{ height: 20, fontSize: "0.7rem" }} />
							</Box>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6} md={3} sx={{ p: 1 }}>
						<Box>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								{t("metric.averageIrr")}
							</Typography>
							<Typography variant="h4" fontWeight="bold" gutterBottom>
								{(avgIrr * 100).toFixed(1)}%
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Tooltip title={t("metric.irrRange")} arrow>
									<Chip
										size="small"
										label={`${(Math.min(...projectData.map(p => p.irr || 0)) * 100).toFixed(1)}% - ${(Math.max(...projectData.map(p => p.irr || 0)) * 100).toFixed(1)}%`}
										sx={{ height: 20, fontSize: "0.7rem" }}
									/>
								</Tooltip>
							</Box>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6} md={3} sx={{ p: 1 }}>
						<Box>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								{t("metric.projectTypes")}
							</Typography>
							<Typography variant="h4" fontWeight="bold" gutterBottom>
								{uniqueTypesCount}
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Chip size="small" label={`${uniqueCountriesCount} ${t("metric.countries")}`} sx={{ height: 20, fontSize: "0.7rem" }} />
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Box>
	);
}
