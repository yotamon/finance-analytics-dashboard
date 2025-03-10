import React from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { useI18n } from "../../context/I18nContext";
import { ChartWrapper } from "./ChartWrapper";

export function RevenueEbitdaChart({ data }) {
	const { convert, currency } = useCurrency();
	const { t } = useI18n();

	// Format data for Recharts (but keeping Google Charts format for ChartWrapper compatibility)
	const chartData = [["Year", t("metric.revenue"), t("metric.ebitda")], ...data.years.map((year, index) => [year.toString(), convert(data.revenues[index]), convert(data.ebitda[index])])];

	const options = {
		hAxis: {
			title: "Year"
		},
		vAxis: {
			title: `${t("metric.value")} (${currency.code} Millions)`,
			format: `${currency.symbol}#M`
		},
		series: {
			0: { color: "#4ade80" },
			1: { color: "#22a584" }
		},
		seriesType: "bars", // Changed from bars: "vertical" to seriesType: "bars" for Recharts compatibility
		legend: { position: "bottom" },
		animation: {
			startup: true,
			duration: 1000,
			easing: "out"
		},
		chartArea: {
			width: "80%",
			height: "70%"
		}
	};

	return <ChartWrapper chartType="BarChart" data={chartData} options={options} chartName="Revenue EBITDA Chart" />;
}
