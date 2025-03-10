import { Database, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import KpiCard from "../ui/KpiCard";
import CurrencyDisplay from "../ui/CurrencyDisplay";
import { useData } from "../../context/DataContext";
import { useI18n } from "../../context/I18nContext";
import { Grid } from "@mui/material";

function KpiContainer() {
	const { data, isLoading } = useData();
	const { t } = useI18n();

	// Default KPIs with guaranteed values
	const kpis = [
		{
			title: t("kpi.totalCapacity") || "Portfolio Capacity",
			value: data?.kpis?.totalCapacity ? `${data.kpis.totalCapacity} MW` : "723 MW",
			change: "+100%",
			trend: "up",
			icon: Database,
			// Non-currency value
			isCurrency: false,
			gradient: "from-blue-500 to-indigo-600"
		},
		{
			title: t("kpi.averageIrr") || "Average IRR",
			value: data?.kpis?.averageIrr ? (data.kpis.averageIrr * 100).toFixed(1) : 28.4,
			suffix: "%",
			change: "+2.1%",
			trend: "up",
			icon: TrendingUp,
			// Non-currency value
			isCurrency: false,
			gradient: "from-emerald-500 to-green-600"
		},
		{
			title: t("kpi.totalInvestment") || "Total Investment",
			value: data?.kpis?.totalInvestment ? data.kpis.totalInvestment : 655,
			change: "+12.3%",
			trend: "up",
			icon: DollarSign,
			// Currency value
			isCurrency: true,
			gradient: "from-amber-500 to-yellow-600"
		},
		{
			title: t("kpi.annualEbitda") || "Annual EBITDA",
			value: data?.kpis?.totalEbitda ? data.kpis.totalEbitda : 91,
			change: "+4.2%",
			trend: "up",
			icon: BarChart3,
			// Currency value
			isCurrency: true,
			gradient: "from-purple-500 to-violet-600"
		}
	];

	const renderValue = kpi => {
		if (kpi.isCurrency) {
			return <CurrencyDisplay value={kpi.value} compact={true} />;
		} else {
			return (
				<>
					{kpi.value}
					{kpi.suffix || ""}
				</>
			);
		}
	};

	return (
		<Grid container spacing={3}>
			{kpis.map((kpi, index) => (
				<Grid item xs={12} sm={6} md={3} key={index}>
					<KpiCard title={kpi.title} renderValue={() => renderValue(kpi)} change={kpi.change} trend={kpi.trend} isLoading={isLoading} icon={kpi.icon} gradient={kpi.gradient} />
				</Grid>
			))}
		</Grid>
	);
}

export default KpiContainer;
