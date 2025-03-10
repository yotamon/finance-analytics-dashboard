import React, { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine, Scatter, ZAxis, ReferenceArea } from "recharts";
import { useCurrency } from "../../context/CurrencyContext";
import { useI18n } from "../../context/I18nContext";
import { CustomTooltip } from "./CustomTooltip";
import { ChartTheme } from "./ChartTheme";

export function RechartsExample({ data }) {
	const { convert, currency } = useCurrency();
	const { t } = useI18n();
	const [activeItem, setActiveItem] = useState(null);
	const [animationEnabled, setAnimationEnabled] = useState(true);
	const [highlightedQuarter, setHighlightedQuarter] = useState(null);

	// Format data for Recharts with additional derived data
	const chartData = data.years.map((year, index) => {
		const revenue = convert(data.revenues[index]);
		const ebitda = convert(data.ebitda[index]);
		const quarter = Math.floor((index % 4) + 1);

		return {
			year: year.toString(),
			[t("metric.revenue")]: revenue,
			[t("metric.ebitda")]: ebitda,
			ratio: ebitda / revenue, // Calculate EBITDA to revenue ratio
			quarter: `Q${quarter}`, // Add quarter information
			yearQuarter: `${year}-Q${quarter}` // Combined year-quarter for detailed view
		};
	});

	// Calculate average EBITDA for reference line
	const avgEbitda = chartData.reduce((sum, item) => sum + item[t("metric.ebitda")], 0) / chartData.length;

	// Get the maximum value for domain setting with some additional padding
	const maxValue = Math.max(...chartData.map(item => item[t("metric.revenue")]), ...chartData.map(item => item[t("metric.ebitda")])) * 1.2; // Add 20% padding

	// Custom event handlers for interactive elements
	const handleMouseEnter = (data, index) => {
		setActiveItem(index);
	};

	const handleMouseLeave = () => {
		setActiveItem(null);
	};

	// Toggle animations for performance on heavy charts
	const toggleAnimation = () => {
		setAnimationEnabled(!animationEnabled);
	};

	// Highlight specific quarter periods
	const handleLegendClick = quarter => {
		setHighlightedQuarter(highlightedQuarter === quarter ? null : quarter);
	};

	// Effect to disable animation after initial render
	useEffect(() => {
		const timer = setTimeout(() => {
			setAnimationEnabled(false);
		}, 3000);

		return () => clearTimeout(timer);
	}, []);

	// Format values for tooltip display
	const formatTooltipValue = value => {
		return `${currency.symbol}${value.toLocaleString()}M`;
	};

	// Label formatter for x-axis values
	const labelFormatter = label => `Year: ${label}`;

	// Group years by quarters for highlighting
	const quarters = chartData.reduce((acc, item, index) => {
		const quarter = index % 4;
		if (!acc[quarter]) {
			acc[quarter] = [];
		}
		acc[quarter].push(item.year);
		return acc;
	}, {});

	// Find growth periods (3+ consecutive growth periods)
	const growthPeriods = chartData.reduce((acc, item, index, arr) => {
		if (index < 2) return acc;

		const currentEbitda = item[t("metric.ebitda")];
		const prevEbitda = arr[index - 1][t("metric.ebitda")];
		const prevPrevEbitda = arr[index - 2][t("metric.ebitda")];

		if (currentEbitda > prevEbitda && prevEbitda > prevPrevEbitda) {
			acc.push({
				start: arr[index - 2].year,
				end: item.year,
				growth: (currentEbitda / prevPrevEbitda - 1) * 100
			});
		}

		return acc;
	}, []);

	return (
		<div className="chart-container">
			{/* Chart controls */}
			<div
				className="chart-controls"
				style={{
					display: "flex",
					justifyContent: "flex-end",
					margin: "0 30px 10px 0",
					gap: "10px"
				}}>
				<button
					onClick={toggleAnimation}
					style={{
						background: animationEnabled ? "#60a5fa" : "#f1f5f9",
						color: animationEnabled ? "white" : "#334155",
						border: "none",
						borderRadius: "4px",
						padding: "4px 8px",
						fontSize: "12px",
						cursor: "pointer",
						transition: "all 0.2s ease"
					}}>
					{animationEnabled ? "Disable Animations" : "Enable Animations"}
				</button>

				{/* Quarter filters */}
				<div style={{ display: "flex", gap: "4px" }}>
					{Object.keys(quarters).map((quarter, i) => (
						<button
							key={`q-${i + 1}`}
							onClick={() => handleLegendClick(`Q${i + 1}`)}
							style={{
								background: highlightedQuarter === `Q${i + 1}` ? ChartTheme.colors.accent[i] : "#f1f5f9",
								color: highlightedQuarter === `Q${i + 1}` ? "white" : "#334155",
								border: "none",
								borderRadius: "4px",
								padding: "4px 8px",
								fontSize: "12px",
								cursor: "pointer",
								transition: "all 0.2s ease"
							}}>
							Q{i + 1}
						</button>
					))}
				</div>
			</div>

			<ResponsiveContainer width="100%" height="100%" aspect={2.5} className={animationEnabled ? "animate-chart" : ""}>
				<ComposedChart
					data={chartData}
					margin={{
						top: 30,
						right: 40,
						left: 20,
						bottom: 50
					}}
					onMouseLeave={handleMouseLeave}>
					{/* Definitions for gradients */}
					<defs>
						<linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={ChartTheme.colors.primary[1]} stopOpacity={0.8} />
							<stop offset="95%" stopColor={ChartTheme.colors.primary[1]} stopOpacity={0.3} />
						</linearGradient>
						<linearGradient id="ebitdaGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={ChartTheme.colors.success[0]} stopOpacity={0.8} />
							<stop offset="95%" stopColor={ChartTheme.colors.success[0]} stopOpacity={0.3} />
						</linearGradient>
						<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
							<feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.1" />
						</filter>
					</defs>

					{/* Growth periods highlight */}
					{growthPeriods.map((period, index) => (
						<ReferenceArea
							key={`growth-${index}`}
							x1={period.start}
							x2={period.end}
							stroke="none"
							fill={ChartTheme.colors.success[0]}
							fillOpacity={0.08}
							label={{
								value: `+${period.growth.toFixed(0)}%`,
								position: "insideTopRight",
								style: { fill: ChartTheme.colors.success[0], fontSize: 10 }
							}}
						/>
					))}

					<CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />

					<XAxis
						dataKey="year"
						tick={{ fontSize: 12, fill: "#666" }}
						tickLine={{ stroke: "#888" }}
						axisLine={{ stroke: "#888" }}
						padding={{ left: 30, right: 30 }}
						label={{
							value: "Year",
							position: "insideBottom",
							offset: 0,
							style: { fontSize: 14, fill: "#666", fontWeight: 500 }
						}}
						tickMargin={15}
					/>

					<YAxis
						yAxisId="left"
						tick={{ fontSize: 12, fill: "#666" }}
						tickLine={{ stroke: "#888" }}
						axisLine={{ stroke: "#888" }}
						tickFormatter={value => `${currency.symbol}${value}M`}
						domain={[0, maxValue * 1.1]} // Reduce padding for better proportions
						width={60}
						label={{
							value: `${t("metric.value")} (${currency.code} Millions)`,
							angle: -90,
							position: "insideLeft",
							offset: 0,
							style: { fontSize: 13, fill: "#666", textAnchor: "middle" }
						}}
						tickMargin={10}
					/>

					{/* Secondary y-axis for ratio */}
					<YAxis
						yAxisId="right"
						orientation="right"
						tick={{ fontSize: 12, fill: "#666" }}
						tickLine={{ stroke: "#888" }}
						axisLine={{ stroke: "#888" }}
						tickFormatter={value => `${(value * 100).toFixed(0)}%`}
						domain={[0, Math.max(...chartData.map(d => d.ratio)) * 1.2]}
						label={{
							value: "EBITDA/Revenue Ratio",
							angle: 90,
							position: "right",
							offset: 10,
							style: { fontSize: 14, fill: "#666", fontWeight: 500 }
						}}
					/>

					<Tooltip content={<CustomTooltip labelFormatter={labelFormatter} valueFormatter={formatTooltipValue} currency={currency} chartType="combo" />} animationDuration={300} />

					<Legend
						wrapperStyle={{
							marginTop: 10,
							paddingTop: 10,
							borderTop: "1px solid #eee",
							fontSize: 12,
							fontWeight: 500
						}}
						iconType="circle"
						iconSize={10}
						onClick={data => console.log("Legend clicked:", data)}
					/>

					{/* Reference line for average EBITDA */}
					<ReferenceLine
						yAxisId="left"
						y={avgEbitda}
						label={{
							value: `Avg EBITDA: ${currency.symbol}${avgEbitda.toFixed(0)}M`,
							position: "right",
							fill: ChartTheme.colors.secondary[0],
							fontSize: 12
						}}
						stroke={ChartTheme.colors.secondary[0]}
						strokeDasharray="3 3"
						className="reference-line"
					/>

					{/* Add scatter points for ratio visualization */}
					<Scatter
						yAxisId="right"
						dataKey="ratio"
						name="EBITDA/Revenue Ratio"
						fill={ChartTheme.colors.accent[0]}
						shape={props => {
							const { cx, cy } = props;
							return (
								<path
									d="M10,0L20,10L10,20L0,10Z" // Diamond shape
									transform={`translate(${cx - 10}, ${cy - 10})`}
									stroke={ChartTheme.colors.accent[0]}
									strokeWidth={1}
									fill={ChartTheme.colors.accent[0]}
									fillOpacity={0.7}
								/>
							);
						}}
					/>

					<Bar
						yAxisId="left"
						dataKey={t("metric.revenue")}
						name={t("metric.revenue")}
						fill="url(#revenueGradient)"
						stroke={ChartTheme.colors.primary[1]}
						strokeWidth={1}
						barSize={30}
						radius={[4, 4, 0, 0]}
						animationDuration={animationEnabled ? 1000 : 0}
						animationEasing="ease-out"
						onMouseEnter={handleMouseEnter}
						filter="url(#shadow)"
					/>

					<Line
						yAxisId="left"
						type="monotone"
						dataKey={t("metric.ebitda")}
						name={t("metric.ebitda")}
						stroke={ChartTheme.colors.success[0]}
						strokeWidth={3}
						dot={{
							r: 4,
							strokeWidth: 2,
							fill: "#fff",
							stroke: ChartTheme.colors.success[0]
						}}
						activeDot={{
							r: 7,
							strokeWidth: 2,
							fill: "#fff",
							stroke: ChartTheme.colors.success[0],
							className: "pulse-dot"
						}}
						animationDuration={animationEnabled ? 1500 : 0}
						animationEasing="ease-out"
					/>

					{/* Interactive brush component for zooming/focusing */}
					<Brush dataKey="year" height={30} stroke={ChartTheme.colors.primary[0]} fillOpacity={0.2} fill="rgba(0,0,0,0.05)" startIndex={0} endIndex={chartData.length - 1} y={300} />
				</ComposedChart>
			</ResponsiveContainer>

			{/* Advanced features description */}
			<div
				style={{
					fontSize: "12px",
					color: "#64748b",
					padding: "8px 16px",
					marginTop: "10px",
					borderTop: "1px dashed #e2e8f0"
				}}>
				<div style={{ fontWeight: 500, marginBottom: "4px" }}>Interactive Features:</div>
				<ul style={{ margin: 0, paddingLeft: "16px" }}>
					<li>Zoom by using the brush control at the bottom</li>
					<li>Toggle animations for better performance</li>
					<li>Filter by quarter using the buttons above</li>
					<li>Highlighted areas show sustained growth periods</li>
					<li>Diamond shapes show EBITDA/Revenue ratio (right axis)</li>
				</ul>
			</div>
		</div>
	);
}
