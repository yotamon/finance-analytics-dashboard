import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import { FileDown, FileText, FileImage, Printer } from "lucide-react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useData } from "../context/DataContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { ExportFormat, ExportOptionItem, ExportState, ExportableData } from "../types/export-types";
import { useSnackbar } from "notistack";

/**
 * Export Page component
 * Provides functionality to export dashboard data in various formats
 */
const ExportPage: React.FC = () => {
  const { data } = useData();
  const [exportState, setExportState] = useState<ExportState>({
    isExporting: false,
    exportType: null,
    exportError: null,
  });
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  // Destructure export state for easier access
  const { isExporting, exportType, exportError } = exportState;

  // Process URL parameters for auto-export
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const typeParam = queryParams.get("type") as ExportFormat | null;

    if (typeParam && ["pdf", "excel", "images", "print"].includes(typeParam)) {
      // Set a small delay to let the component fully mount
      const timer = setTimeout(() => {
        handleExport(typeParam);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location]);

  /**
   * Export options displayed in the UI
   */
  const exportOptions: ExportOptionItem[] = [
    {
      id: "pdf",
      name: "PDF Report",
      icon: FileText,
      description: "Export a comprehensive PDF report with analysis and charts",
    },
    {
      id: "excel",
      name: "Excel Workbook",
      icon: FileDown,
      description: "Export raw and processed data as an Excel workbook",
    },
    {
      id: "images",
      name: "Chart Images",
      icon: FileImage,
      description: "Export charts and visualizations as high-quality PNG images",
    },
    {
      id: "print",
      name: "Print Dashboard",
      icon: Printer,
      description: "Prepare dashboard for printing",
    },
  ];

  /**
   * Generic export handler function
   * @param type - The type of export to perform
   */
  const handleExport = async (type: ExportFormat): Promise<void> => {
    setExportState({
      isExporting: true,
      exportType: type,
      exportError: null,
    });

    try {
      switch (type) {
        case "pdf":
          await exportPdf();
          break;
        case "excel":
          await exportExcel();
          break;
        case "images":
          await exportImages();
          break;
        case "print":
          window.print();
          break;
        default:
          throw new Error(`Unknown export type: ${type}`);
      }
    } catch (error) {
      setExportState((prev) => ({
        ...prev,
        exportError: error instanceof Error ? error.message : `Failed to export as ${type}`,
      }));
      // eslint-disable-next-line no-console
      console.error(`Export error (${type}):`, error);
    } finally {
      setExportState((prev) => ({
        ...prev,
        isExporting: false,
        exportType: null,
      }));
    }
  };

  /**
   * Exports dashboard data as a PDF
   */
  const exportPdf = async (): Promise<void> => {
    if (!data) {
      throw new Error("No data available to export");
    }

    // Type guard to ensure data has the required properties
    const exportData = data as ExportableData;

    // Create a new PDF document
    const pdf = new jsPDF("p", "mm", "a4");

    // Add title and header
    pdf.setFontSize(20);
    pdf.text("Financial Dashboard Report", 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    // Add KPIs section if available
    if (exportData.kpis) {
      pdf.setFontSize(16);
      pdf.text("Key Performance Indicators", 20, 45);

      let y = 55;
      Object.entries(exportData.kpis).forEach(([key, value]) => {
        // Format the key name for readability
        const formattedKey = key
          .replace(/([A-Z])/g, " $1") // Add space before capital letters
          .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

        pdf.setFont("helvetica", "bold");
        pdf.text(`${formattedKey}:`, 20, y);
        pdf.setFont("helvetica", "normal");
        pdf.text(value.toString(), 80, y);

        y += 8;

        // Add a new page if we're running out of space
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      });

      // Move position for next section
      y += 10;

      // Check if we need a new page
      if (y > 240) {
        pdf.addPage();
        y = 20;
      }
    }

    // Add projects table if available
    if (exportData.projects && exportData.projects.length > 0) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("Project Portfolio", 20, 20);

      // Table header
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Project Name", 20, 30);
      pdf.text("Type", 55, 30);
      pdf.text("Country", 90, 30);
      pdf.text("Capacity", 125, 30);
      pdf.text("Investment", 160, 30);

      // Draw header line
      pdf.setLineWidth(0.5);
      pdf.line(20, 32, 190, 32);

      // Table rows
      pdf.setFont("helvetica", "normal");
      let y = 40;

      exportData.projects.forEach((project) => {
        // Check if we need a new page
        if (y > 280) {
          pdf.addPage();
          // Redraw table header
          pdf.setFontSize(16);
          pdf.text("Project Portfolio (continued)", 20, 20);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text("Project Name", 20, 30);
          pdf.text("Type", 55, 30);
          pdf.text("Country", 90, 30);
          pdf.text("Capacity", 125, 30);
          pdf.text("Investment", 160, 30);
          pdf.setLineWidth(0.5);
          pdf.line(20, 32, 190, 32);
          pdf.setFont("helvetica", "normal");
          y = 40;
        }

        pdf.text(project.name.toString(), 20, y);
        pdf.text(project.type.toString(), 55, y);
        pdf.text(project.country.toString(), 90, y);
        pdf.text(`${project.capacity} MW`, 125, y);
        pdf.text(`$${project.investmentCost}M`, 160, y);

        y += 7;
      });
    }

    // Save the PDF
    pdf.save("financial-dashboard.pdf");
  };

  /**
   * Exports dashboard data as an Excel workbook
   */
  const exportExcel = async (): Promise<void> => {
    if (!data) {
      throw new Error("No data available to export");
    }

    // Type guard to ensure data has the required properties
    const exportData = data as ExportableData;

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Add projects worksheet if available
    if (exportData.projects && exportData.projects.length > 0) {
      const ws = XLSX.utils.json_to_sheet(exportData.projects);
      XLSX.utils.book_append_sheet(wb, ws, "Projects");
    }

    // Add KPIs worksheet
    if (exportData.kpis) {
      const kpiData = Object.entries(exportData.kpis).map(([key, value]) => {
        // Format the KPI names for better readability
        const formattedKey = key
          .replace(/([A-Z])/g, " $1") // Add space before capital letters
          .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

        return { Metric: formattedKey, Value: value };
      });

      const kpiWs = XLSX.utils.json_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(wb, kpiWs, "KPIs");
    }

    // Add country totals worksheet
    if (exportData.countryTotals && exportData.countryTotals.length > 0) {
      const countryWs = XLSX.utils.json_to_sheet(exportData.countryTotals);
      XLSX.utils.book_append_sheet(wb, countryWs, "Country Totals");
    }

    // Add financial projections
    if (exportData.financialProjections && exportData.financialProjections.years) {
      // Convert financial projections to a more Excel-friendly format
      const projectionData = exportData.financialProjections.years.map((year, index) => ({
        Year: year,
        Revenues: exportData.financialProjections?.revenues[index],
        EBITDA: exportData.financialProjections?.ebitda[index],
      }));

      const projectionWs = XLSX.utils.json_to_sheet(projectionData);
      XLSX.utils.book_append_sheet(wb, projectionWs, "Financial Projections");
    }

    // Save the file
    XLSX.writeFile(wb, "financial-data.xlsx");
  };

  /**
   * Exports dashboard charts as PNG images
   */
  const exportImages = async (): Promise<void> => {
    const chartsContainer = document.getElementById("dashboard-charts");
    if (!chartsContainer) {
      throw new Error(
        "No chart elements found to export. Please navigate to the dashboard first and try again."
      );
    }

    try {
      const chartElements = document.querySelectorAll<HTMLElement>(".chart-container");

      if (chartElements.length === 0) {
        throw new Error("No chart elements found to export");
      }

      // Export each chart as an image
      for (let i = 0; i < chartElements.length; i++) {
        const canvas = await html2canvas(chartElements[i], {
          scale: 2, // Higher quality
          logging: false,
          useCORS: true,
        });

        const dataUrl = canvas.toDataURL("image/png");

        // Create download link
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `chart-${i + 1}.png`;
        link.click();

        // Small delay between downloads
        if (i < chartElements.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error exporting images:", error);
      throw new Error(
        "There was a problem exporting the charts as images. Please try again or check the console for details."
      );
    }
  };

  /**
   * Handles checkbox changes for export settings
   */
  const handleSettingChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setExportState((prev) => ({
      ...prev,
      exportSettings: {
        ...prev.exportSettings,
        [e.target.name]: e.target.checked,
      },
    }));
    // eslint-disable-next-line no-console
    console.log(`Setting changed: ${e.target.name} = ${e.target.checked}`);
  };

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Export Dashboard</h1>
        <p className="text-gray-600">Export or print your dashboard data in various formats</p>
      </div>

      {exportError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="font-medium">Export Error</p>
          <p className="text-sm">{exportError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {exportOptions.map((option) => (
          <div
            key={option.id}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleExport(option.id)}
          >
            <div className="flex items-start">
              <div className="bg-gray-100 p-3 rounded-lg mr-4">
                <option.icon size={24} className="text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{option.name}</h3>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </div>

            {isExporting && exportType === option.id && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full animate-pulse"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">Exporting...</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeTables"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                defaultChecked
                onChange={handleSettingChange}
              />
              <span className="ml-2 text-sm text-gray-700">Include data tables</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeCharts"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                defaultChecked
                onChange={handleSettingChange}
              />
              <span className="ml-2 text-sm text-gray-700">Include charts and visualizations</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeAnalysis"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                defaultChecked
                onChange={handleSettingChange}
              />
              <span className="ml-2 text-sm text-gray-700">Include analysis summary</span>
            </label>
          </div>
        </div>
      </div>

      {/* Hidden container for exporting dashboard elements */}
      <div id="export-container" ref={exportContainerRef} className="hidden"></div>
    </Container>
  );
};

export default ExportPage;
