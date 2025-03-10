import React, { useState, useEffect } from "react";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	ComposedChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	ScatterChart,
	Scatter,
	Cell,
	LabelList,
	Text,
	Sector
} from "recharts";
import { ChartTheme, getChartColors, createGradient, getDashPattern } from "./ChartTheme";
import { CustomTooltip } from "./CustomTooltip";
import { Box, CircularProgress, Typography, Paper, useTheme, Alert } from "@mui/material";

export function ChartWrapper({ chartType, data, options, width = "100%", height = "100%", chartName = "Chart" }) {
	const theme = useTheme();
	const [isChartLoading, setIsChartLoading] = useState(true);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [error, setError] = useState(null);

	// Handle chart load state
	useEffect(() => {
		try {
			// Check if data is valid
			if (!data || !Array.isArray(data) || data.length === 0) {
				console.warn("Chart data is empty or invalid");
			}

			const timer = setTimeout(() => setIsChartLoading(false), 500);
			return () => clearTimeout(timer);
		} catch (err) {
			console.error("Error initializing chart:", err);
			setError(err.message || "Failed to initialize chart");
			setIsChartLoading(false);
		}
	}, [data]);

	// Handle pie/donut chart hover
	const handlePieEnter = (_, index) => {
		setActiveIndex(index);
	};

	// Custom tick renderer to prevent overlapping
	const CustomizedXAxisTick = ({ x, y, payload, angle = 0, verticalAnchor = "middle", textAnchor = "middle" }) => {
		return (
			<g transform={`translate(${x},${y})`}>
				<text x={0} y={0} dy={16} textAnchor={textAnchor} verticalAnchor={verticalAnchor} transform={`rotate(${angle})`} fontSize={12} fill="#666">
					{typeof payload.value === "string" && payload.value.length > 10 ? `${payload.value.substring(0, 10)}...` : payload.value}
				</text>
			</g>
		);
	};

	// Setup chart with enhanced styling
	const renderChart = () => {
		try {
			// If error occurred, show error message
			if (error) {
				return (
					<div className="flex items-center justify-center h-full">
						<div className="text-[rgb(var(--color-error-500))]">Chart Error: {error}</div>
					</div>
				);
			}

			// Validate data
			if (!data || !Array.isArray(data) || data.length === 0) {
				return (
					<div className="flex items-center justify-center h-full">
						<div className="text-[rgb(var(--color-error-500))]">No data available for chart</div>
					</div>
				);
			}

			// Extract dataKey from data (assuming first row contains headers)
			const headers = Array.isArray(data) && data.length > 0 ? data[0] : [];
			const dataKeys = headers.slice(1); // First column is usually labels

			// Transform Google Charts data format to Recharts format
			const transformedData =
				Array.isArray(data) && data.length > 1
					? data.slice(1).map(row => {
							const obj = { name: row[0] };
							dataKeys.forEach((key, index) => {
								obj[key] = row[index + 1];
							});
							return obj;
					  })
					: [];

			// Get colors from theme based on chart type
			const colors = options?.series ? Object.values(options.series).map(s => s.color) : getChartColors(chartType.toLowerCase().replace("chart", ""), dataKeys.length);

			// Common props for all chart types
			const commonProps = {
				margin: { top: 30, right: 40, left: 30, bottom: 50 }
			};

			// Custom formatter for tooltips
			const valueFormatter = (value, name) => {
				if (options?.vAxis?.format) {
					const format = options.vAxis.format;
					if (format.includes("%")) return `${(value * 100).toFixed(1)}%`;
					if (format.includes("#M")) return `${format.replace("#M", value)}M`;
					return format.replace("#", value);
				}
				return value;
			};

			// Label formatter for tooltips
			const labelFormatter = label => `${options?.hAxis?.title || "Year"}: ${label}`;

			// Calculate how many ticks we can display without overlap
			const calculateOptimalTickCount = dataLength => {
				// Determine optimal tick count based on data length
				if (dataLength <= 3) return dataLength;
				if (dataLength <= 7) return Math.floor(dataLength / 2) + 1;
				if (dataLength <= 15) return Math.ceil(dataLength / 3);
				return Math.ceil(dataLength / 5);
			};

			// Calculate tick values to prevent overlapping
			const calculateTickValues = (data, dataKey = "name") => {
				if (!data || data.length === 0) return [];

				const ticks = data.map(item => item[dataKey]);

				// If we have few datapoints, show all ticks
				if (ticks.length <= 5) return ticks;

				// Otherwise, calculate optimal spacing
				const optimalCount = calculateOptimalTickCount(ticks.length);
				const step = Math.max(1, Math.floor(ticks.length / optimalCount));

				// Create array of evenly spaced tick indices
				const tickIndices = [];
				for (let i = 0; i < ticks.length; i += step) {
					tickIndices.push(i);
				}

				// Always include the last tick if it's not already included
				if (tickIndices[tickIndices.length - 1] !== ticks.length - 1) {
					tickIndices.push(ticks.length - 1);
				}

				return tickIndices.map(index => ticks[index]);
			};

			// Normalized chart type to handle case variations
			const normalizedChartType = chartType.toLowerCase();

			// Map from Google Charts types to Recharts types
			const chartTypeMap = {
				columnchart: "BarChart",
				barchart: "BarChart",
				linechart: "LineChart",
				piechart: "PieChart",
				donutchart: "PieChart",
				scatterchart: "ScatterChart",
				combochart: "ComposedChart",
				areachart: "AreaChart"
			};

			// Get the normalized chart type or use the original
			const mappedChartType = chartTypeMap[normalizedChartType] || chartType;

			// Render different chart types with enhanced styling
			switch (mappedChartType) {
				case "LineChart":
					const lineTickValues = calculateTickValues(transformedData);
					return (
						<ResponsiveContainer width={width} height={height || 400} aspect={2.5}>
							<LineChart data={transformedData} {...commonProps}>
								<defs>
									{dataKeys.map((key, index) => (
										<linearGradient key={`gradient-${key}`} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
											<stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.2} />
										</linearGradient>
									))}
								</defs>
								<CartesianGrid strokeDasharray={ChartTheme.grid.strokeDasharray} stroke={ChartTheme.grid.stroke} vertical={false} horizontal={ChartTheme.grid.horizontal} />
								<XAxis
									dataKey="name"
									tick={<CustomizedXAxisTick />}
									ticks={lineTickValues}
									tickLine={{ stroke: "#888" }}
									axisLine={{ stroke: "#888" }}
									padding={{ left: 20, right: 20 }}
									label={
										options?.hAxis?.title
											? {
													value: options.hAxis.title,
													position: "insideBottom",
													offset: 10,
													style: { fontSize: 13, fill: "#666", fontWeight: 500 }
											  }
											: null
									}
									tickMargin={15}
								/>
								<YAxis
									tick={{ fontSize: 12, fill: "#666" }}
									tickLine={{ stroke: "#888" }}
									axisLine={{ stroke: "#888" }}
									label={
										options?.vAxis?.title
											? {
													value: options.vAxis.title,
													angle: -90,
													position: "insideLeft",
													offset: -10,
													style: { fontSize: 13, fill: "#666", textAnchor: "middle" }
											  }
											: null
									}
									tickMargin={10}
									width={60}
									domain={[0, "auto"]}
									tickFormatter={value => (typeof value === "number" ? value.toLocaleString() : value)}
								/>
								<Tooltip content={<CustomTooltip labelFormatter={labelFormatter} valueFormatter={valueFormatter} chartType="line" />} animationDuration={300} />
								<Legend
									wrapperStyle={{
										paddingTop: 10,
										marginBottom: 15,
										fontSize: 12,
										fontWeight: 500
									}}
									iconType="circle"
									iconSize={8}
									verticalAlign="top"
									align="center"
									layout="horizontal"
								/>
								{dataKeys.map((key, index) => (
									<Line
										key={key}
										type="monotone"
										dataKey={key}
										name={key}
										stroke={colors[index % colors.length]}
										strokeWidth={2}
										dot={{ r: 5, strokeWidth: 1, fill: "#fff", stroke: colors[index % colors.length] }}
										activeDot={ChartTheme.activeDot}
										animationDuration={ChartTheme.chart.animationDuration}
										animationEasing={ChartTheme.chart.animationEasing}
									/>
								))}
							</LineChart>
						</ResponsiveContainer>
					);

				case "BarChart":
					const barTickValues = calculateTickValues(transformedData);
					return (
						<ResponsiveContainer width={width} height={height || 400} aspect={2.2}>
							<BarChart
								data={transformedData}
								{...commonProps}
								barGap={10}
								maxBarSize={50}
								barSize={options?.bar?.groupWidth ? parseInt(options.bar.groupWidth) : transformedData.length > 5 ? 20 : 40}>
								<defs>
									{dataKeys.map((key, index) => (
										<linearGradient key={`gradient-${key}`} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
											<stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.5} />
										</linearGradient>
									))}
								</defs>
								<CartesianGrid strokeDasharray={ChartTheme.grid.strokeDasharray} stroke={ChartTheme.grid.stroke} vertical={false} horizontal={ChartTheme.grid.horizontal} />
								<XAxis
									dataKey="name"
									tick={transformedData.length > 7 ? props => <CustomizedXAxisTick {...props} angle={-35} textAnchor="end" /> : { fontSize: 12, fill: "#666" }}
									height={60}
									ticks={barTickValues}
									tickLine={{ stroke: "#888" }}
									axisLine={{ stroke: "#888" }}
									padding={{ left: 20, right: 20 }}
									label={
										options?.hAxis?.title
											? {
													value: options.hAxis.title,
													position: "insideBottom",
													offset: 0,
													style: { fontSize: 13, fill: "#666", textAnchor: "middle" }
											  }
											: null
									}
									tickMargin={transformedData.length > 7 ? 15 : 10}
								/>
								<YAxis
									tick={{ fontSize: 12, fill: "#666" }}
									tickLine={{ stroke: "#888" }}
									axisLine={{ stroke: "#888" }}
									tickFormatter={value =>
										options?.vAxis?.format ? options.vAxis.format.replace("#", typeof value === "number" ? value.toLocaleString() : value) : typeof value === "number" ? value.toLocaleString() : value
									}
									label={
										options?.vAxis?.title
											? {
													value: options.vAxis.title,
													angle: -90,
													position: "insideLeft",
													offset: -5,
													style: { fontSize: 13, fill: "#666", textAnchor: "middle" }
											  }
											: null
									}
									tickMargin={8}
									width={60}
									domain={[0, "auto"]}
								/>
								<Tooltip content={<CustomTooltip labelFormatter={labelFormatter} valueFormatter={valueFormatter} chartType="bar" />} animationDuration={300} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
								<Legend
									wrapperStyle={{
										paddingTop: 10,
										marginBottom: 15,
										fontSize: 12,
										fontWeight: 500
									}}
									iconType="rect"
									iconSize={10}
									verticalAlign="top"
									align="center"
									layout="horizontal"
								/>
								{dataKeys.map((key, index) => (
									<Bar
										key={key}
										dataKey={key}
										name={key}
										fill={`url(#gradient-${key})`}
										fillOpacity={0.9}
										stroke={colors[index % colors.length]}
										strokeWidth={1}
										radius={[4, 4, 0, 0]}
										animationDuration={ChartTheme.chart.animationDuration}
										animationEasing={ChartTheme.chart.animationEasing}
									/>
								))}
							</BarChart>
						</ResponsiveContainer>
					);

				case "ComposedChart":
					const composedTickValues = calculateTickValues(transformedData);
					return (
						<ResponsiveContainer width={width} height={height || 400} aspect={2.2}>
							<ComposedChart data={transformedData} {...commonProps} barGap={12} barSize={transformedData.length > 5 ? 20 : 40}>
								<defs>
									{dataKeys.map((key, index) => (
										<linearGradient key={`gradient-${key}`} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
											<stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.4} />
										</linearGradient>
									))}
								</defs>
								<CartesianGrid strokeDasharray={ChartTheme.grid.strokeDasharray} stroke={ChartTheme.grid.stroke} vertical={false} horizontal={ChartTheme.grid.horizontal} />
								<XAxis
									dataKey="name"
									tick={transformedData.length > 7 ? props => <CustomizedXAxisTick {...props} angle={-35} textAnchor="end" /> : { fontSize: 12, fill: "#666" }}
									height={60}
									ticks={composedTickValues}
									tickLine={{ stroke: "#888" }}
									axisLine={{ stroke: "#888" }}
									padding={{ left: 20, right: 20 }}
									label={
										options?.hAxis?.title
											? {
													value: options.hAxis.title,
													position: "insideBottom",
													offset: 0,
													style: { fontSize: 13, fill: "#666", textAnchor: "middle" }
											  }
											: null
									}
									tickMargin={transformedData.length > 7 ? 15 : 10}
								/>
								<YAxis
									tick={{ fontSize: 12, fill: "#666" }}
									tickLine={{ stroke: "#888" }}
									axisLine={{ stroke: "#888" }}
									tickFormatter={value =>
										options?.vAxis?.format ? options.vAxis.format.replace("#", typeof value === "number" ? value.toLocaleString() : value) : typeof value === "number" ? value.toLocaleString() : value
									}
									label={
										options?.vAxis?.title
											? {
													value: options.vAxis.title,
													angle: -90,
													position: "insideLeft",
													offset: -5,
													style: { fontSize: 13, fill: "#666", textAnchor: "middle" }
											  }
											: null
									}
									tickMargin={8}
									width={60}
									domain={[0, "auto"]}
								/>
								<Tooltip
									content={<CustomTooltip labelFormatter={labelFormatter} valueFormatter={valueFormatter} chartType="combo" />}
									animationDuration={300}
									cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
								/>
								<Legend
									wrapperStyle={{
										paddingTop: 5,
										paddingBottom: 15,
										fontSize: 12,
										fontWeight: 500,
										marginTop: -10
									}}
									iconType="circle"
									iconSize={10}
									verticalAlign="top"
									align="center"
									layout="horizontal"
								/>
								{dataKeys.map((key, index) => {
									// Determine if this series should be a bar or line
									const seriesType = index === 0 || options?.seriesType === "bars" ? "bar" : "line";

									if (seriesType === "bar") {
										return (
											<Bar
												key={key}
												dataKey={key}
												name={key}
												fill={`url(#gradient-${key})`}
												fillOpacity={0.9}
												stroke={colors[index % colors.length]}
												strokeWidth={1}
												radius={[4, 4, 0, 0]}
												animationDuration={ChartTheme.chart.animationDuration}
												animationEasing={ChartTheme.chart.animationEasing}
											/>
										);
									} else {
										return (
											<Line
												key={key}
												type="monotone"
												dataKey={key}
												name={key}
												stroke={colors[index % colors.length]}
												strokeWidth={2.5}
												dot={{ r: 5, strokeWidth: 1, fill: "#fff", stroke: colors[index % colors.length] }}
												activeDot={ChartTheme.activeDot}
												animationDuration={ChartTheme.chart.animationDuration}
												animationEasing={ChartTheme.chart.animationEasing}
											/>
										);
									}
								})}
							</ComposedChart>
						</ResponsiveContainer>
					);

				case "PieChart":
					// For pie chart, use pieHole to determine if it's a donut chart
					const isDonut = options?.pieHole && options.pieHole > 0;
					const outerRadius = isDonut ? 80 : 100;
					const innerRadius = isDonut ? outerRadius * options.pieHole : 0;

					return (
						<ResponsiveContainer width={width} height={height || 400} aspect={1.5}>
							<PieChart {...commonProps}>
								<Pie
									data={transformedData}
									cx="50%"
									cy="50%"
									labelLine={true}
									outerRadius={outerRadius}
									innerRadius={innerRadius}
									fill="#8884d8"
									dataKey={dataKeys[0]}
									nameKey="name"
									label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
									animationDuration={ChartTheme.chart.animationDuration}
									animationEasing={ChartTheme.chart.animationEasing}
									activeIndex={activeIndex}
									activeShape={props => {
										const RADIAN = Math.PI / 180;
										const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
										const sin = Math.sin(-RADIAN * midAngle);
										const cos = Math.cos(-RADIAN * midAngle);
										const sx = cx + (outerRadius + 10) * cos;
										const sy = cy + (outerRadius + 10) * sin;
										const mx = cx + (outerRadius + 30) * cos;
										const my = cy + (outerRadius + 30) * sin;
										const ex = mx + (cos >= 0 ? 1 : -1) * 22;
										const ey = my;
										const textAnchor = cos >= 0 ? "start" : "end";

										return (
											<g>
												<text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} style={{ fontWeight: "bold" }}>
													{payload.name}
												</text>
												<Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 5} startAngle={startAngle} endAngle={endAngle} fill={fill} />
												<Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
												<path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
												<circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
												<text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
													{`${value} (${(percent * 100).toFixed(0)}%)`}
												</text>
											</g>
										);
									}}
									onMouseEnter={handlePieEnter}>
									{transformedData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="#fff" strokeWidth={1} />
									))}
								</Pie>
								<Tooltip
									content={<CustomTooltip valueFormatter={value => `${value} (${((value / transformedData.reduce((sum, item) => sum + item[dataKeys[0]], 0)) * 100).toFixed(1)}%)`} chartType="pie" />}
									animationDuration={300}
								/>
								<Legend
									wrapperStyle={{
										paddingTop: 10,
										marginBottom: 15,
										fontSize: 12,
										fontWeight: 500
									}}
									iconType="circle"
									iconSize={10}
									verticalAlign="top"
									align="center"
									layout="horizontal"
								/>
							</PieChart>
						</ResponsiveContainer>
					);

				case "ScatterChart":
					return (
						<ResponsiveContainer width={width} height={height || 400} aspect={2}>
							<ScatterChart {...commonProps}>
								<CartesianGrid strokeDasharray={ChartTheme.grid.strokeDasharray} stroke={ChartTheme.grid.stroke} vertical={ChartTheme.grid.vertical} horizontal={ChartTheme.grid.horizontal} />
								<XAxis
									dataKey={dataKeys[0]}
									type="number"
									name={dataKeys[0]}
									tick={{ fontSize: 12, fill: "#666" }}
									tickLine={{ stroke: "#888" }}
									axisLine={{ stroke: "#888" }}
									label={
										options?.hAxis?.title
											? {
													value: options.hAxis.title,
													position: "insideBottom",
													offset: 0,
													style: { fontSize: 13, fill: "#666", textAnchor: "middle" }
											  }
											: null
									}
									tickMargin={10}
								/>
								<YAxis
									dataKey={dataKeys[1]}
									type="number"
									name={dataKeys[1]}
									tick={{ fontSize: 12, fill: "#666" }}
									tickLine={{ stroke: "#888" }}
									axisLine={{ stroke: "#888" }}
									label={
										options?.vAxis?.title
											? {
													value: options.vAxis.title,
													angle: -90,
													position: "insideLeft",
													offset: -5,
													style: { fontSize: 13, fill: "#666", textAnchor: "middle" }
											  }
											: null
									}
									tickMargin={8}
									width={60}
								/>
								<Tooltip content={<CustomTooltip chartType="scatter" />} cursor={{ strokeDasharray: "3 3" }} animationDuration={300} />
								<Legend
									wrapperStyle={{
										paddingTop: 10,
										marginBottom: 15,
										fontSize: 12,
										fontWeight: 500
									}}
									iconType="circle"
									iconSize={10}
									verticalAlign="top"
									align="center"
									layout="horizontal"
								/>
								<Scatter
									name={chartName}
									data={transformedData}
									fill={colors[0]}
									fillOpacity={0.6}
									strokeWidth={1}
									stroke="#fff"
									animationDuration={ChartTheme.chart.animationDuration}
									animationEasing={ChartTheme.chart.animationEasing}>
									{transformedData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
									))}
								</Scatter>
							</ScatterChart>
						</ResponsiveContainer>
					);

				default:
					console.warn(`Chart type '${chartType}' not explicitly supported, trying to map to known type`);
					// Try to render as bar chart by default
					return (
						<ResponsiveContainer width={width} height={height || 400} aspect={2}>
							<BarChart data={transformedData} {...commonProps}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Legend
									wrapperStyle={{
										paddingTop: 10,
										marginBottom: 15,
										fontSize: 12,
										fontWeight: 500
									}}
									iconType="rect"
									iconSize={10}
									verticalAlign="top"
									align="center"
									layout="horizontal"
								/>
								{dataKeys.map((key, index) => (
									<Bar key={key} dataKey={key} name={key} fill={colors[index % colors.length]} />
								))}
							</BarChart>
						</ResponsiveContainer>
					);
			}
		} catch (err) {
			console.error("Error rendering chart:", err);
			return (
				<div className="flex items-center justify-center h-full">
					<div className="text-[rgb(var(--color-error-500))]">Error rendering chart: {err.message || "Unknown error"}</div>
				</div>
			);
		}
	};

	// Handle errors
	if (error) {
		return (
			<Alert
				severity="error"
				sx={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center"
				}}>
				Error loading chart: {error}
			</Alert>
		);
	}

	// Handle loading state
	if (isChartLoading) {
		return (
			<Box
				sx={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexDirection: "column",
					gap: 2
				}}>
				<CircularProgress size={40} color="primary" />
				<Typography variant="body2" color="text.secondary">
					Loading chart data...
				</Typography>
			</Box>
		);
	}

	// Empty data state
	if (!data || data.length === 0) {
		return (
			<Box
				sx={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
					borderRadius: 1
				}}>
				<Typography variant="body2" color="text.secondary">
					No data available
				</Typography>
			</Box>
		);
	}

	return <>{renderChart()}</>;
}
