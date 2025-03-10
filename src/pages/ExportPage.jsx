import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FileDown, FileText, FileImage, Printer } from "lucide-react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useData } from "../context/DataContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

function ExportPage() {
	const { data } = useData();
	const [isExporting, setIsExporting] = useState(false);
	const [exportType, setExportType] = useState(null);
	const [exportError, setExportError] = useState(null);
	const exportContainerRef = useRef(null);
	const location = useLocation();

	// Process URL parameters for auto-export
	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		const typeParam = queryParams.get("type");

		if (typeParam && ["pdf", "excel", "images", "print"].includes(typeParam)) {
			// Set a small delay to let the component fully mount
			const timer = setTimeout(() => {
				handleExport(typeParam);
			}, 500);

			return () => clearTimeout(timer);
		}
	}, [location]);

	const exportOptions = [
		{
			id: "pdf",
			name: "PDF Report",
			icon: FileText,
			description: "Export a comprehensive PDF report with analysis and charts"
		},
		{
			id: "excel",
			name: "Excel Workbook",
			icon: FileDown,
			description: "Export raw and processed data as an Excel workbook"
		},
		{
			id: "images",
			name: "Chart Images",
			icon: FileImage,
			description: "Export charts and visualizations as high-quality PNG images"
		},
		{
			id: "print",
			name: "Print Dashboard",
			icon: Printer,
			description: "Prepare dashboard for printing"
		}
	];

	const handleExport = async type => {
		setIsExporting(true);
		setExportType(type);
		setExportError(null);

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
			/* eslint-disable-next-line no-console */
console.error(`Export error (${type}):`, error);
			setExportError(error.message || `Failed to export as ${type}`);
		} finally {
			setIsExporting(false);
			setExportType(null);
		}
	};

	const exportPdf = async () => {
		if (!data) {
			throw new Error("No data available to export");
		}

		// Create a new PDF document
		const pdf = new jsPDF("p", "mm", "a4");

		// Add title and metadata
		pdf.setFontSize(18);
		pdf.text("Financial Dashboard Export", 20, 20);

		pdf.setFontSize(12);
		pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

		// Add data summary
		if (data.kpis) {
			pdf.text("Key Performance Indicators:", 20, 45);
			pdf.text(`Total Capacity: ${data.kpis.totalCapacity} MW`, 25, 52);
			pdf.text(`Average IRR: ${(data.kpis.averageIrr * 100).toFixed(1)}%`, 25, 59);
			pdf.text(`Total Investment: $${data.kpis.totalInvestment}M`, 25, 66);
			pdf.text(`Total EBITDA: $${data.kpis.totalEbitda}M`, 25, 73);
		}

		// Add projects table
		if (data.projects && data.projects.length > 0) {
			pdf.text("Projects:", 20, 85);

			// Create table headers
			const headers = ["Name", "Type", "Country", "Capacity", "Investment"];
			let y = 95;

			// Set smaller font for the table
			pdf.setFontSize(9);

			// Draw headers
			headers.forEach((header, index) => {
				pdf.text(header, 20 + index * 35, y);
			});

			y += 7;

			// Draw projects
			data.projects.forEach((project, index) => {
				if (y > 270) {
					// Add a new page if we're running out of space
					pdf.addPage();
					y = 20;

					// Redraw headers on new page
					headers.forEach((header, index) => {
						pdf.text(header, 20 + index * 35, y);
					});

					y += 7;
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

	const exportExcel = async () => {
		if (!data) {
			throw new Error("No data available to export");
		}

		// Create a new workbook
		const wb = XLSX.utils.book_new();

		// Add projects worksheet if available
		if (data.projects && data.projects.length > 0) {
			const ws = XLSX.utils.json_to_sheet(data.projects);
			XLSX.utils.book_append_sheet(wb, ws, "Projects");
		}

		// Add KPIs worksheet
		if (data.kpis) {
			const kpiData = Object.entries(data.kpis).map(([key, value]) => {
				// Format the KPI names for better readability
				const formattedKey = key
					.replace(/([A-Z])/g, " $1") // Add space before capital letters
					.replace(/^./, str => str.toUpperCase()); // Capitalize first letter

				return { Metric: formattedKey, Value: value };
			});

			const kpiWs = XLSX.utils.json_to_sheet(kpiData);
			XLSX.utils.book_append_sheet(wb, kpiWs, "KPIs");
		}

		// Add country totals worksheet
		if (data.countryTotals && data.countryTotals.length > 0) {
			const countryWs = XLSX.utils.json_to_sheet(data.countryTotals);
			XLSX.utils.book_append_sheet(wb, countryWs, "Country Totals");
		}

		// Add financial projections
		if (data.financialProjections && data.financialProjections.years) {
			// Convert financial projections to a more Excel-friendly format
			const projectionData = data.financialProjections.years.map((year, index) => ({
				Year: year,
				Revenues: data.financialProjections.revenues[index],
				EBITDA: data.financialProjections.ebitda[index]
			}));

			const projectionWs = XLSX.utils.json_to_sheet(projectionData);
			XLSX.utils.book_append_sheet(wb, projectionWs, "Financial Projections");
		}

		// Save the file
		XLSX.writeFile(wb, "financial-data.xlsx");
	};

	const exportImages = async () => {
		if (!document.getElementById("dashboard-charts")) {
			alert("No chart elements found to export. Please navigate to the dashboard first and try again.");
			return;
		}

		try {
			const chartElements = document.querySelectorAll(".chart-container");

			if (chartElements.length === 0) {
				throw new Error("No chart elements found to export");
			}

			// Export each chart as an image
			for (let i = 0; i < chartElements.length; i++) {
				const canvas = await html2canvas(chartElements[i], {
					scale: 2, // Higher quality
					logging: false,
					useCORS: true
				});

				const dataUrl = canvas.toDataURL("image/png");

				// Create download link
				const link = document.createElement("a");
				link.href = dataUrl;
				link.download = `chart-${i + 1}.png`;
				link.click();

				// Small delay between downloads
				if (i < chartElements.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 500));
				}
			}
		} catch (error) {
			/* eslint-disable-next-line no-console */
console.error("Error exporting images:", error);
			alert("There was a problem exporting the charts as images. Please try again or check the console for details.");
		}
	};

	return (
		<Container className="py-8">
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
				{exportOptions.map(option => (
					<div key={option.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleExport(option.id)}>
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
									<div className="bg-primary-600 h-2.5 rounded-full animate-pulse" style={{ width: "100%" }}></div>
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
							<input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
							<span className="ml-2 text-sm text-gray-700">Include data tables</span>
						</label>
					</div>

					<div>
						<label className="flex items-center">
							<input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
							<span className="ml-2 text-sm text-gray-700">Include charts and visualizations</span>
						</label>
					</div>

					<div>
						<label className="flex items-center">
							<input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
							<span className="ml-2 text-sm text-gray-700">Include analysis summary</span>
						</label>
					</div>
				</div>
			</div>

			{/* Hidden container for exporting dashboard elements */}
			<div id="export-container" ref={exportContainerRef} className="hidden"></div>
		</Container>
	);
}

export default ExportPage;
