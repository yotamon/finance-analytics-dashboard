import { useState, useEffect } from "react";
import { Sliders, X, Save, RefreshCw, LayoutGrid, Grip, EyeOff, Eye, Lock, Unlock } from "lucide-react";
import { useI18n } from "../../context/I18nContext";
import Button from "../ui/Button";

// Chart configurations
const AVAILABLE_CHARTS = [
	{
		id: "revenue-ebitda",
		name: "charts.revenueEbitda.title",
		description: "charts.revenueEbitda.description",
		defaultSize: "lg",
		defaultOrder: 1,
		defaultVisible: true
	},
	{
		id: "project-portfolio",
		name: "charts.portfolioOverview.title",
		description: "charts.portfolioOverview.description",
		defaultSize: "md",
		defaultOrder: 2,
		defaultVisible: true
	},
	{
		id: "project-type",
		name: "charts.projectType.title",
		description: "charts.projectType.description",
		defaultSize: "sm",
		defaultOrder: 3,
		defaultVisible: true
	},
	{
		id: "investment-returns",
		name: "charts.investmentReturns.title",
		description: "charts.investmentReturns.description",
		defaultSize: "md",
		defaultOrder: 4,
		defaultVisible: true
	},
	{
		id: "ebitda-margin",
		name: "charts.ebitdaMargin.title",
		description: "charts.ebitdaMargin.description",
		defaultSize: "sm",
		defaultOrder: 5,
		defaultVisible: true
	},
	{
		id: "country-comparison",
		name: "charts.countryComparison.title",
		description: "charts.countryComparison.description",
		defaultSize: "md",
		defaultOrder: 6,
		defaultVisible: true
	},
	{
		id: "geographic-map",
		name: "charts.geographicDistribution.title",
		description: "charts.geographicDistribution.description",
		defaultSize: "lg",
		defaultOrder: 7,
		defaultVisible: true
	}
];

// Layout sizes
const SIZES = {
	sm: { name: "Small", cols: "col-span-1" },
	md: { name: "Medium", cols: "col-span-2" },
	lg: { name: "Large", cols: "col-span-4" }
};

export default function DashboardCustomizer({ isVisible, onClose, onSave }) {
	const { t } = useI18n();
	const [charts, setCharts] = useState([]);
	const [layouts, setLayouts] = useState([]);
	const [showMenu, setShowMenu] = useState(isVisible);
	const [activeTab, setActiveTab] = useState("layout");
	const [isEditing, setIsEditing] = useState(false);
	const [savedLayouts, setSavedLayouts] = useState([]);
	const [layoutName, setLayoutName] = useState("");

	// Initialize from localStorage or defaults
	useEffect(() => {
		// Load charts configuration
		const savedCharts = localStorage.getItem("dashboardCharts");
		if (savedCharts) {
			try {
				setCharts(JSON.parse(savedCharts));
			} catch (e) {
				/* eslint-disable-next-line no-console */
console.error("Error loading saved chart configuration", e);
				setCharts(getDefaultCharts());
			}
		} else {
			setCharts(getDefaultCharts());
		}

		// Load saved layouts
		const saved = localStorage.getItem("savedDashboardLayouts");
		if (saved) {
			try {
				setSavedLayouts(JSON.parse(saved));
			} catch (e) {
				/* eslint-disable-next-line no-console */
console.error("Error loading saved layouts", e);
			}
		}
	}, []);

	// Get default charts configuration
	const getDefaultCharts = () => {
		return AVAILABLE_CHARTS.map(chart => ({
			...chart,
			size: chart.defaultSize,
			order: chart.defaultOrder,
			visible: chart.defaultVisible,
			locked: false
		}));
	};

	// Update visibility when prop changes
	useEffect(() => {
		setShowMenu(isVisible);
	}, [isVisible]);

	// Toggle chart visibility
	const toggleChartVisibility = chartId => {
		setCharts(charts.map(chart => (chart.id === chartId ? { ...chart, visible: !chart.visible } : chart)));
	};

	// Toggle chart lock (prevents being moved or resized)
	const toggleChartLock = chartId => {
		setCharts(charts.map(chart => (chart.id === chartId ? { ...chart, locked: !chart.locked } : chart)));
	};

	// Change chart size
	const changeChartSize = (chartId, newSize) => {
		setCharts(charts.map(chart => (chart.id === chartId ? { ...chart, size: newSize } : chart)));
	};

	// Move chart up in order
	const moveChartUp = chartId => {
		const chartIndex = charts.findIndex(c => c.id === chartId);
		if (chartIndex <= 0) return; // Already at the top

		const newCharts = [...charts];
		const temp = newCharts[chartIndex].order;
		newCharts[chartIndex].order = newCharts[chartIndex - 1].order;
		newCharts[chartIndex - 1].order = temp;

		// Sort by order
		newCharts.sort((a, b) => a.order - b.order);
		setCharts(newCharts);
	};

	// Move chart down in order
	const moveChartDown = chartId => {
		const chartIndex = charts.findIndex(c => c.id === chartId);
		if (chartIndex >= charts.length - 1) return; // Already at the bottom

		const newCharts = [...charts];
		const temp = newCharts[chartIndex].order;
		newCharts[chartIndex].order = newCharts[chartIndex + 1].order;
		newCharts[chartIndex + 1].order = temp;

		// Sort by order
		newCharts.sort((a, b) => a.order - b.order);
		setCharts(newCharts);
	};

	// Reset to defaults
	const resetToDefaults = () => {
		setCharts(getDefaultCharts());
		setIsEditing(false);
	};

	// Apply changes
	const applyChanges = () => {
		// Sort charts by order
		const sortedCharts = [...charts].sort((a, b) => a.order - b.order);
		setCharts(sortedCharts);

		// Save to localStorage
		localStorage.setItem("dashboardCharts", JSON.stringify(sortedCharts));

		// Call onSave with the updated configuration
		onSave(sortedCharts);
		onClose();
	};

	// Save current layout
	const saveLayout = () => {
		if (!layoutName) return;

		const newLayout = {
			id: `layout-${Date.now()}`,
			name: layoutName,
			charts: [...charts],
			created: new Date().toISOString()
		};

		const newLayouts = [...savedLayouts, newLayout];
		setSavedLayouts(newLayouts);
		localStorage.setItem("savedDashboardLayouts", JSON.stringify(newLayouts));
		setLayoutName("");
	};

	// Load saved layout
	const loadLayout = layout => {
		setCharts(layout.charts);
	};

	// Delete saved layout
	const deleteLayout = layoutId => {
		const newLayouts = savedLayouts.filter(layout => layout.id !== layoutId);
		setSavedLayouts(newLayouts);
		localStorage.setItem("savedDashboardLayouts", JSON.stringify(newLayouts));
	};

	if (!showMenu) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="w-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-900">
				<div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
					<h2 className="text-lg font-semibold flex items-center">
						<Sliders size={18} className="mr-2" />
						{t("action.customize")}
					</h2>
					<button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800" aria-label="Close">
						<X size={20} />
					</button>
				</div>

				<div className="flex border-b dark:border-gray-700">
					<button
						className={`px-4 py-2 text-sm font-medium ${
							activeTab === "layout" ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400" : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
						}`}
						onClick={() => setActiveTab("layout")}>
						<LayoutGrid size={16} className="inline mr-1" />
						{t("customizer.layout")}
					</button>
					<button
						className={`px-4 py-2 text-sm font-medium ${
							activeTab === "saved" ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400" : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
						}`}
						onClick={() => setActiveTab("saved")}>
						<Save size={16} className="inline mr-1" />
						{t("customizer.savedLayouts")}
					</button>
				</div>

				<div className="p-4 max-h-[70vh] overflow-y-auto">
					{activeTab === "layout" && (
						<div>
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-md font-medium">{t("dashboard.customize")}</h3>
								<div className="space-x-2">
									<Button variant="secondary" outlined size="sm" onClick={resetToDefaults}>
										<RefreshCw size={14} className="mr-1" />
										{t("customizer.reset")}
									</Button>
								</div>
							</div>

							<div className="border rounded-md overflow-hidden dark:border-gray-700">
								<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
									<thead className="bg-gray-50 dark:bg-gray-800">
										<tr>
											<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
												{t("customizer.order")}
											</th>
											<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
												{t("customizer.chart")}
											</th>
											<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
												{t("customizer.size")}
											</th>
											<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
												{t("customizer.visibility")}
											</th>
											<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
												{t("customizer.lock")}
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
										{[...charts]
											.sort((a, b) => a.order - b.order)
											.map(chart => (
												<tr key={chart.id} className={!chart.visible ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
													<td className="px-4 py-3 whitespace-nowrap">
														<div className="flex items-center">
															<button
																className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
																onClick={() => moveChartUp(chart.id)}
																disabled={charts.indexOf(chart) === 0 || chart.locked}>
																<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
																	<path
																		fillRule="evenodd"
																		d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm.707-7.707l3-3a1 1 0 00-1.414-1.414L10 6.586 7.707 4.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0z"
																		clipRule="evenodd"
																	/>
																</svg>
															</button>
															<span className="mx-2 text-sm font-medium text-gray-900 dark:text-gray-100">{chart.order}</span>
															<button
																className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
																onClick={() => moveChartDown(chart.id)}
																disabled={charts.indexOf(chart) === charts.length - 1 || chart.locked}>
																<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
																	<path
																		fillRule="evenodd"
																		d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-.707-3.707a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-3 3z"
																		clipRule="evenodd"
																	/>
																</svg>
															</button>
														</div>
													</td>
													<td className="px-4 py-3 whitespace-nowrap">
														<div className="flex items-center">
															<Grip size={16} className="mr-2 text-gray-400" />
															<div>
																<div className="text-sm font-medium text-gray-900 dark:text-gray-100">{t(chart.name)}</div>
																<div className="text-xs text-gray-500 dark:text-gray-400">{t(chart.description)}</div>
															</div>
														</div>
													</td>
													<td className="px-4 py-3 whitespace-nowrap">
														<select
															value={chart.size}
															onChange={e => changeChartSize(chart.id, e.target.value)}
															disabled={chart.locked}
															className="block w-full px-2 py-1 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50">
															{Object.entries(SIZES).map(([key, { name }]) => (
																<option key={key} value={key}>
																	{name}
																</option>
															))}
														</select>
													</td>
													<td className="px-4 py-3 whitespace-nowrap">
														<button
															onClick={() => toggleChartVisibility(chart.id)}
															className={`p-1 rounded-full ${chart.visible ? "text-green-500 hover:text-green-600 dark:text-green-400" : "text-gray-400 hover:text-gray-600 dark:text-gray-500"}`}
															disabled={chart.locked}>
															{chart.visible ? <Eye size={18} /> : <EyeOff size={18} />}
														</button>
													</td>
													<td className="px-4 py-3 whitespace-nowrap">
														<button
															onClick={() => toggleChartLock(chart.id)}
															className={`p-1 rounded-full ${chart.locked ? "text-yellow-500 hover:text-yellow-600 dark:text-yellow-400" : "text-gray-400 hover:text-gray-600 dark:text-gray-500"}`}>
															{chart.locked ? <Lock size={18} /> : <Unlock size={18} />}
														</button>
													</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>

							<div className="mt-4 p-3 bg-blue-50 rounded-md dark:bg-blue-900/20">
								<h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">{t("customizer.saveLayout")}</h4>
								<div className="flex items-center space-x-2">
									<input
										type="text"
										value={layoutName}
										onChange={e => setLayoutName(e.target.value)}
										placeholder={t("customizer.enterLayoutName")}
										className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
									/>
									<Button onClick={saveLayout} variant="primary" size="sm" disabled={!layoutName}>
										<Save size={14} className="mr-1" />
										{t("customizer.save")}
									</Button>
								</div>
							</div>
						</div>
					)}

					{activeTab === "saved" && (
						<div>
							<h3 className="text-md font-medium mb-4">{t("dashboard.savedLayouts")}</h3>

							{savedLayouts.length === 0 ? (
								<div className="p-8 text-center text-gray-500 bg-gray-50 rounded-md dark:bg-gray-800 dark:text-gray-400">
									<LayoutGrid size={32} className="mx-auto mb-2 opacity-30" />
									<p>{t("customizer.noSavedLayouts")}</p>
								</div>
							) : (
								<div className="space-y-3">
									{savedLayouts.map(layout => (
										<div key={layout.id} className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700">
											<div>
												<div className="font-medium">{layout.name}</div>
												<div className="text-xs text-gray-500">
													{new Date(layout.created).toLocaleDateString()} · {layout.charts.filter(c => c.visible).length} {t("customizer.visibleCharts")}
												</div>
											</div>
											<div className="flex space-x-2">
												<Button onClick={() => loadLayout(layout)} variant="secondary" size="sm">
													{t("customizer.load")}
												</Button>
												<Button onClick={() => deleteLayout(layout.id)} variant="danger" outlined size="sm">
													<X size={14} />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				<div className="flex items-center justify-end p-4 border-t dark:border-gray-700">
					<div className="space-x-2">
						<Button onClick={onClose} variant="secondary">
							{t("customizer.cancel")}
						</Button>
						<Button onClick={applyChanges} variant="primary">
							{t("customizer.applyChanges")}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
