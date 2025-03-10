import React, { useRef, useEffect, useState } from "react";
import { Box, Paper, Typography, useTheme, CircularProgress, Tooltip, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { useI18n } from "../../context/I18nContext";

/**
 * Correlation Matrix Component
 *
 * This component creates a correlation matrix to visualize relationships between different metrics.
 * It helps identify which metrics have positive, negative, or no correlation with each other.
 */
export const CorrelationMatrix = ({ data }) => {
	const svgRef = useRef(null);
	const containerRef = useRef(null);
	const theme = useTheme();
	const { t } = useI18n();
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [loading, setLoading] = useState(true);
	const [hoveredCell, setHoveredCell] = useState(null);
	const [metricGroup, setMetricGroup] = useState("financial");

	// Sample data if none provided
	const sampleData = {
		projects: [
			{ name: "Project A", irr: 0.281, yieldOnCost: 0.15, ebitdaMargin: 0.85, debtServiceCoverage: 1.8, investmentCost: 102, equity: 31, capacity: 78, revenue: 16, profit: 9 },
			{ name: "Project B", irr: 0.318, yieldOnCost: 0.14, ebitdaMargin: 0.92, debtServiceCoverage: 2.1, investmentCost: 166, equity: 50, capacity: 132, revenue: 26, profit: 14 },
			{ name: "Project C", irr: 0.282, yieldOnCost: 0.13, ebitdaMargin: 0.87, debtServiceCoverage: 1.9, investmentCost: 65, equity: 19, capacity: 111, revenue: 9, profit: 5 },
			{ name: "Project D", irr: 0.268, yieldOnCost: 0.13, ebitdaMargin: 0.83, debtServiceCoverage: 1.7, investmentCost: 36, equity: 11, capacity: 57, revenue: 5, profit: 3 },
			{ name: "Project E", irr: 0.264, yieldOnCost: 0.13, ebitdaMargin: 0.82, debtServiceCoverage: 1.6, investmentCost: 62, equity: 19, capacity: 86, revenue: 9, profit: 6 },
			{ name: "Project F", irr: 0.293, yieldOnCost: 0.14, ebitdaMargin: 0.88, debtServiceCoverage: 2.0, investmentCost: 75, equity: 23, capacity: 125, revenue: 10, profit: 6 }
		]
	};

	// Use provided data or fallback to sample data
	const projectData = data?.projects || sampleData.projects;

	// Define metric groups
	const metricGroups = {
		financial: [
			{ id: "irr", name: t("metric.irr") },
			{ id: "yieldOnCost", name: t("metric.yieldOnCost") },
			{ id: "ebitdaMargin", name: t("metric.ebitdaMargin") },
			{ id: "debtServiceCoverage", name: t("metric.debtServiceCoverage") },
			{ id: "profit", name: t("metric.profit") }
		],
		operational: [
			{ id: "capacity", name: t("metric.capacity") },
			{ id: "investmentCost", name: t("metric.investmentCost") },
			{ id: "equity", name: t("metric.equity") },
			{ id: "revenue", name: t("metric.revenue") },
			{ id: "profit", name: t("metric.profit") }
		]
	};

	// Calculate Pearson correlation coefficient between two arrays
	const calculateCorrelation = (x, y) => {
		const n = x.length;

		// Calculate means
		const xMean = x.reduce((sum, val) => sum + val, 0) / n;
		const yMean = y.reduce((sum, val) => sum + val, 0) / n;

		// Calculate variances and covariance
		let xxVar = 0;
		let yyVar = 0;
		let xyVar = 0;

		for (let i = 0; i < n; i++) {
			const xDiff = x[i] - xMean;
			const yDiff = y[i] - yMean;
			xxVar += xDiff * xDiff;
			yyVar += yDiff * yDiff;
			xyVar += xDiff * yDiff;
		}

		// Calculate Pearson's r
		const r = xyVar / (Math.sqrt(xxVar) * Math.sqrt(yyVar));
		return isNaN(r) ? 0 : r;
	};

	// Calculate correlation matrix
	const calculateCorrelationMatrix = (data, metrics) => {
		const matrix = [];

		// Extract metric values from data
		const metricValues = {};
		metrics.forEach(metric => {
			metricValues[metric.id] = data.map(item => item[metric.id] || 0);
		});

		// Calculate correlation for each pair of metrics
		metrics.forEach((metric1, i) => {
			const row = [];
			metrics.forEach((metric2, j) => {
				if (i === j) {
					// Diagonal - perfect correlation with self
					row.push(1);
				} else {
					const correlation = calculateCorrelation(metricValues[metric1.id], metricValues[metric2.id]);
					row.push(correlation);
				}
			});
			matrix.push(row);
		});

		return matrix;
	};

	// Update dimensions when container size changes
	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver(entries => {
			const { width, height } = entries[0].contentRect;
			setDimensions({
				width: Math.max(width, 100),
				height: Math.max(height, 100)
			});
		});

		resizeObserver.observe(containerRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	// Create correlation matrix visualization
	useEffect(() => {
		const renderCorrelationMatrix = async () => {
			try {
				setLoading(true);

				// Validate required data and dimensions
				if (!dimensions.width || !dimensions.height || !svgRef.current) {
					console.warn("Missing dimensions or SVG ref for correlation matrix");
					setLoading(false);
					return;
				}

				// Clear existing SVG content
				d3.select(svgRef.current).selectAll("*").remove();

				// Get current metrics based on selected group
				const metrics = metricGroups[metricGroup] || metricGroups.financial;
				if (!metrics || metrics.length === 0) {
					console.warn("No metrics available for correlation matrix");
					setLoading(false);
					return;
				}

				// Calculate correlation matrix
				const correlationMatrix = calculateCorrelationMatrix(projectData, metrics);

				// Define chart dimensions with margins
				const margin = { top: 70, right: 20, bottom: 20, left: 70 };
				const width = Math.max(dimensions.width - margin.left - margin.right, 50);
				const height = Math.max(dimensions.height - margin.top - margin.bottom, 50);

				// Cell dimensions - ensure metrics.length is valid
				const cellSize = Math.floor(Math.min(width, height) / Math.max(metrics.length, 1));

				// Color scale for correlation values (-1 to 1)
				const colorScale = d3.scaleLinear().domain([-1, 0, 1]).range([theme.palette.error.main, theme.palette.grey[400], theme.palette.success.main]);

				// Create SVG with safe dimensions
				const svg = d3
					.select(svgRef.current)
					.attr("width", Math.max(dimensions.width, 100))
					.attr("height", Math.max(dimensions.height, 100))
					.append("g")
					.attr("transform", `translate(${margin.left},${margin.top})`);

				// Add column labels
				svg
					.selectAll(".column-label")
					.data(metrics)
					.enter()
					.append("text")
					.attr("class", "column-label")
					.attr("x", (d, i) => i * cellSize + cellSize / 2)
					.attr("y", -10)
					.attr("text-anchor", "start")
					.attr("dominant-baseline", "middle")
					.attr("transform", (d, i) => `rotate(-45, ${i * cellSize + cellSize / 2}, -10)`)
					.attr("fill", theme.palette.text.primary)
					.attr("font-size", "12px")
					.text(d => d.name);

				// Add row labels
				svg
					.selectAll(".row-label")
					.data(metrics)
					.enter()
					.append("text")
					.attr("class", "row-label")
					.attr("x", -10)
					.attr("y", (d, i) => i * cellSize + cellSize / 2)
					.attr("text-anchor", "end")
					.attr("dominant-baseline", "middle")
					.attr("fill", theme.palette.text.primary)
					.attr("font-size", "12px")
					.text(d => d.name);

				// Create correlation cells
				const rows = svg
					.selectAll(".row")
					.data(correlationMatrix)
					.enter()
					.append("g")
					.attr("class", "row")
					.attr("transform", (d, i) => `translate(0, ${i * cellSize})`);

				// Add cells to each row
				const cells = rows
					.selectAll(".cell")
					.data((d, i) => d.map((value, j) => ({ value, i, j })))
					.enter()
					.append("rect")
					.attr("class", "cell")
					.attr("x", (d, i) => i * cellSize)
					.attr("width", cellSize)
					.attr("height", cellSize)
					.attr("fill", d => colorScale(d.value))
					.attr("stroke", theme.palette.divider)
					.attr("stroke-width", 1)
					.attr("opacity", 0)
					.on("mouseover", (event, d) => {
						setHoveredCell({
							metric1: metrics[d.i].name,
							metric2: metrics[d.j].name,
							correlation: d.value
						});

						// Highlight row and column
						d3.selectAll(".cell")
							.filter(cell => cell.i === d.i || cell.j === d.j)
							.attr("stroke", theme.palette.primary.main)
							.attr("stroke-width", 2);
					})
					.on("mouseout", () => {
						setHoveredCell(null);

						// Reset highlights
						d3.selectAll(".cell").attr("stroke", theme.palette.divider).attr("stroke-width", 1);
					})
					.transition()
					.duration(500)
					.delay((d, i) => i * 10)
					.attr("opacity", 1);

				// Add correlation values to cells
				rows
					.selectAll(".cell-text")
					.data((d, i) => d.map((value, j) => ({ value, i, j })))
					.enter()
					.append("text")
					.attr("class", "cell-text")
					.attr("x", (d, i) => i * cellSize + cellSize / 2)
					.attr("y", cellSize / 2)
					.attr("text-anchor", "middle")
					.attr("dominant-baseline", "middle")
					.attr("font-size", "11px")
					.attr("fill", d => (Math.abs(d.value) > 0.7 ? "#fff" : theme.palette.text.primary))
					.text(d => d.value.toFixed(2))
					.attr("opacity", 0)
					.transition()
					.duration(500)
					.delay((d, i) => 300 + i * 10)
					.attr("opacity", 1);

				setLoading(false);
			} catch (error) {
				console.error("Error rendering correlation matrix:", error);
				setLoading(false);
			}
		};

		// Only run if container is mounted and dimensions are set
		if (containerRef.current && dimensions.width > 0 && dimensions.height > 0) {
			renderCorrelationMatrix();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dimensions, metricGroup, projectData, theme]);

	// Interpret correlation strength
	const interpretCorrelation = value => {
		const absValue = Math.abs(value);

		if (absValue > 0.9) return t("charts.correlation.veryStrong");
		if (absValue > 0.7) return t("charts.correlation.strong");
		if (absValue > 0.5) return t("charts.correlation.moderate");
		if (absValue > 0.3) return t("charts.correlation.weak");
		return t("charts.correlation.none");
	};

	// Get correlation type (positive/negative)
	const correlationType = value => {
		if (value > 0.1) return t("charts.correlation.positive");
		if (value < -0.1) return t("charts.correlation.negative");
		return t("charts.correlation.no");
	};

	return (
		<Paper
			sx={{
				height: "100%",
				position: "relative",
				display: "flex",
				flexDirection: "column",
				p: 2,
				borderRadius: 1
			}}>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
				<Typography variant="h6">{t("charts.correlation.title")}</Typography>

				<FormControl variant="outlined" size="small">
					<InputLabel id="metric-group-label">{t("charts.correlation.metricGroup")}</InputLabel>
					<Select labelId="metric-group-label" value={metricGroup} onChange={e => setMetricGroup(e.target.value)} label={t("charts.correlation.metricGroup")} sx={{ minWidth: 150 }}>
						<MenuItem value="financial">{t("charts.correlation.financial")}</MenuItem>
						<MenuItem value="operational">{t("charts.correlation.operational")}</MenuItem>
					</Select>
				</FormControl>
			</Box>

			<Box
				ref={containerRef}
				sx={{
					flexGrow: 1,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					position: "relative"
				}}>
				{loading ? (
					<CircularProgress size={40} />
				) : (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center" }}>
						<svg ref={svgRef} width="100%" height="100%" style={{ minWidth: "100px", minHeight: "100px" }} />
					</motion.div>
				)}
			</Box>

			{hoveredCell && (
				<Box
					sx={{
						mt: 2,
						p: 2,
						bgcolor: "background.paper",
						border: 1,
						borderColor: "divider",
						borderRadius: 1
					}}>
					<Typography variant="subtitle2">
						{hoveredCell.metric1} & {hoveredCell.metric2}
					</Typography>

					<Typography variant="body2" sx={{ mt: 0.5 }}>
						{correlationType(hoveredCell.correlation)} {t("charts.correlation.correlation")} ({hoveredCell.correlation.toFixed(2)})
					</Typography>

					<Typography variant="body2" sx={{ mt: 0.5 }}>
						{t("charts.correlation.strength")}: {interpretCorrelation(hoveredCell.correlation)}
					</Typography>
				</Box>
			)}

			{!hoveredCell && (
				<Box sx={{ mt: 2 }}>
					<Typography variant="caption" color="text.secondary">
						{t("charts.correlation.explanation")}
					</Typography>
				</Box>
			)}
		</Paper>
	);
};

export default CorrelationMatrix;
