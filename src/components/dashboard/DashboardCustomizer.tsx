import React, { useState, useEffect } from "react";
import {
  Sliders,
  X,
  Save,
  RefreshCw,
  LayoutGrid,
  Grip,
  EyeOff,
  Eye,
  Lock,
  Unlock,
} from "lucide-react";
import { useI18n } from "../../context/I18nContext";
import Button from "../ui/Button";

// Define interfaces for chart configuration
interface ChartConfig {
  id: string;
  name: string;
  description: string;
  defaultSize: string;
  defaultOrder: number;
  defaultVisible: boolean;
}

// Define interface for chart size options
interface SizeOption {
  name: string;
  cols: number;
}

// Define interface for size options mapping
interface SizeOptionsMap {
  [key: string]: SizeOption;
}

// Define interface for user customizations
interface ChartCustomization {
  id: string;
  visible: boolean;
  locked: boolean;
  size: string;
  order: number;
  // These fields are added during rendering from AVAILABLE_CHARTS
  name?: string;
  description?: string;
}

// Define interface for saved layouts
interface SavedLayout {
  id: string;
  name: string;
  charts: ChartCustomization[];
  created: string;
}

// Define component props
interface DashboardCustomizerProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (charts: ChartCustomization[]) => void;
  savedCharts?: ChartCustomization[];
}

// Size options for charts
const SIZES: SizeOptionsMap = {
  xs: { name: "Extra Small", cols: 3 },
  sm: { name: "Small", cols: 4 },
  md: { name: "Medium", cols: 6 },
  lg: { name: "Large", cols: 8 },
  xl: { name: "Extra Large", cols: 12 },
  full: { name: "Full Width", cols: 12 },
};

// Chart configurations
const AVAILABLE_CHARTS: ChartConfig[] = [
  {
    id: "revenue-ebitda",
    name: "charts.revenueEbitda.title",
    description: "charts.revenueEbitda.description",
    defaultSize: "lg",
    defaultOrder: 1,
    defaultVisible: true,
  },
  {
    id: "project-portfolio",
    name: "charts.portfolioOverview.title",
    description: "charts.portfolioOverview.description",
    defaultSize: "md",
    defaultOrder: 2,
    defaultVisible: true,
  },
  {
    id: "project-type",
    name: "charts.projectType.title",
    description: "charts.projectType.description",
    defaultSize: "sm",
    defaultOrder: 3,
    defaultVisible: true,
  },
  {
    id: "investment-returns",
    name: "charts.investmentReturns.title",
    description: "charts.investmentReturns.description",
    defaultSize: "md",
    defaultOrder: 4,
    defaultVisible: true,
  },
  {
    id: "ebitda-margin",
    name: "charts.ebitdaMargin.title",
    description: "charts.ebitdaMargin.description",
    defaultSize: "sm",
    defaultOrder: 5,
    defaultVisible: true,
  },
  {
    id: "country-comparison",
    name: "charts.countryComparison.title",
    description: "charts.countryComparison.description",
    defaultSize: "md",
    defaultOrder: 6,
    defaultVisible: true,
  },
  {
    id: "geographic-map",
    name: "charts.geographicMap.title",
    description: "charts.geographicMap.description",
    defaultSize: "md",
    defaultOrder: 7,
    defaultVisible: true,
  },
  {
    id: "project-table",
    name: "charts.projectTable.title",
    description: "charts.projectTable.description",
    defaultSize: "lg",
    defaultOrder: 8,
    defaultVisible: true,
  },
  // New charts
  {
    id: "cash-flow-sankey",
    name: "charts.cashFlowSankey.title",
    description: "charts.cashFlowSankey.description",
    defaultSize: "lg",
    defaultOrder: 9,
    defaultVisible: true,
  },
  {
    id: "metrics-heatmap",
    name: "charts.metricsHeatmap.title",
    description: "charts.metricsHeatmap.description",
    defaultSize: "md",
    defaultOrder: 10,
    defaultVisible: true,
  },
  {
    id: "correlation-matrix",
    name: "charts.correlationMatrix.title",
    description: "charts.correlationMatrix.description",
    defaultSize: "md",
    defaultOrder: 11,
    defaultVisible: true,
  },
];

export default function DashboardCustomizer({
  isVisible,
  onClose,
  onSave,
  savedCharts,
}: DashboardCustomizerProps) {
  const { t } = useI18n();

  // State for charts configuration
  const [charts, setCharts] = useState<ChartCustomization[]>([]);
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [showMenu, setShowMenu] = useState<boolean>(isVisible);
  const [activeTab, setActiveTab] = useState<string>("layout");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [layoutName, setLayoutName] = useState<string>("");
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Initialize charts
  useEffect(() => {
    if (isVisible) {
      const initialCharts = savedCharts || getDefaultCharts();
      setCharts(initialCharts);
      setHasChanges(false);
    }

    // Load saved layouts from localStorage
    const saved = localStorage.getItem("savedDashboardLayouts");
    if (saved) {
      try {
        setSavedLayouts(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved layouts", e);
      }
    }
  }, [isVisible, savedCharts]);

  // Handle changes to track if user has modified the defaults
  useEffect(() => {
    if (charts.length > 0) {
      const originals = savedCharts || getDefaultCharts();

      // Check if any chart settings have changed
      const changed = charts.some((chart) => {
        const original = originals.find((c) => c.id === chart.id);
        if (!original) return true;

        return (
          chart.visible !== original.visible ||
          chart.locked !== original.locked ||
          chart.size !== original.size ||
          chart.order !== original.order
        );
      });

      setHasChanges(changed);
    }
  }, [charts, savedCharts]);

  // Get default charts from the available charts list
  const getDefaultCharts = (): ChartCustomization[] => {
    return AVAILABLE_CHARTS.map((chart) => ({
      id: chart.id,
      visible: chart.defaultVisible,
      locked: false,
      size: chart.defaultSize,
      order: chart.defaultOrder,
      // Add these for rendering
      name: chart.name,
      description: chart.description,
    }));
  };

  // Change chart visibility
  const toggleChartVisibility = (chartId: string): void => {
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart.id === chartId ? { ...chart, visible: !chart.visible } : chart
      )
    );
  };

  // Toggle lock state for a chart
  const toggleChartLock = (chartId: string): void => {
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart.id === chartId ? { ...chart, locked: !chart.locked } : chart
      )
    );
  };

  // Change chart size
  const changeChartSize = (chartId: string, newSize: string): void => {
    setCharts((prevCharts) =>
      prevCharts.map((chart) => (chart.id === chartId ? { ...chart, size: newSize } : chart))
    );
  };

  // Move chart up in order
  const moveChartUp = (chartId: string): void => {
    const chartIndex = charts.findIndex((c) => c.id === chartId);
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
  const moveChartDown = (chartId: string): void => {
    const chartIndex = charts.findIndex((c) => c.id === chartId);
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
  const resetToDefaults = (): void => {
    setCharts(getDefaultCharts());
    setIsEditing(false);
  };

  // Apply changes and close
  const applyChanges = (): void => {
    // Sort by order before saving
    const sortedCharts = [...charts].sort((a, b) => a.order - b.order);

    // Save to localStorage
    localStorage.setItem("dashboardCharts", JSON.stringify(sortedCharts));

    onSave(sortedCharts);
    onClose();
  };

  // Save layout without closing
  const saveLayout = (): void => {
    if (!layoutName) return;

    const newLayout: SavedLayout = {
      id: `layout-${Date.now()}`,
      name: layoutName,
      charts: [...charts],
      created: new Date().toISOString(),
    };

    const newLayouts = [...savedLayouts, newLayout];
    setSavedLayouts(newLayouts);

    // Save to localStorage
    localStorage.setItem("savedDashboardLayouts", JSON.stringify(newLayouts));

    // Reset name field
    setLayoutName("");
    setIsEditing(false);
  };

  // Load a saved layout
  const loadLayout = (layoutId: string): void => {
    const layout = savedLayouts.find((l) => l.id === layoutId);
    if (layout) {
      setCharts(layout.charts);
    }
  };

  // Update visibility when prop changes
  useEffect(() => {
    setShowMenu(isVisible);
  }, [isVisible]);

  if (!showMenu) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${isVisible ? "" : "hidden"}`}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            <Sliders className="inline-block mr-2" size={20} />
            {t("dashboard.customize")}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-gray-700">
          <div className="flex">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "layout"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("layout")}
            >
              <LayoutGrid size={16} className="inline mr-1" />
              {t("customizer.layoutSetup")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "saved"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("saved")}
            >
              <Save size={16} className="inline mr-1" />
              {t("customizer.savedLayouts")}
            </button>
          </div>
        </div>

        {/* Content */}
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
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        {t("customizer.order")}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        {t("customizer.chart")}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        {t("customizer.size")}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        {t("customizer.visibility")}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        {t("customizer.lock")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {[...charts]
                      .sort((a, b) => a.order - b.order)
                      .map((chart) => (
                        <tr
                          key={chart.id}
                          className={!chart.visible ? "bg-gray-50 dark:bg-gray-800/50" : ""}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                                onClick={() => moveChartUp(chart.id)}
                                disabled={charts.indexOf(chart) === 0 || chart.locked}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm.707-7.707l3-3a1 1 0 00-1.414-1.414L10 6.586 7.707 4.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <span className="mx-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {chart.order}
                              </span>
                              <button
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                                onClick={() => moveChartDown(chart.id)}
                                disabled={
                                  charts.indexOf(chart) === charts.length - 1 || chart.locked
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
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
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {t(chart.name)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {t(chart.description)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              value={chart.size}
                              onChange={(e) => changeChartSize(chart.id, e.target.value)}
                              disabled={chart.locked}
                              className="block w-full px-2 py-1 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
                            >
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
                              className={`p-1 rounded-full ${
                                chart.visible
                                  ? "text-green-500 hover:text-green-600 dark:text-green-400"
                                  : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
                              }`}
                              disabled={chart.locked}
                            >
                              {chart.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => toggleChartLock(chart.id)}
                              className={`p-1 rounded-full ${
                                chart.locked
                                  ? "text-yellow-500 hover:text-yellow-600 dark:text-yellow-400"
                                  : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
                              }`}
                            >
                              {chart.locked ? <Lock size={18} /> : <Unlock size={18} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-md dark:bg-blue-900/20">
                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  {t("customizer.saveLayout")}
                </h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={layoutName}
                    onChange={(e) => setLayoutName(e.target.value)}
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
                  {savedLayouts.map((layout) => (
                    <div
                      key={layout.id}
                      className="flex items-center justify-between p-3 border rounded-md dark:border-gray-700"
                    >
                      <div>
                        <div className="font-medium">{layout.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(layout.created).toLocaleDateString()} ·{" "}
                          {layout.charts.filter((c) => c.visible).length}{" "}
                          {t("customizer.visibleCharts")}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => loadLayout(layout.id)} variant="secondary" size="sm">
                          {t("customizer.load")}
                        </Button>
                        <Button
                          onClick={() => deleteLayout(layout.id)}
                          variant="danger"
                          outlined
                          size="sm"
                        >
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
