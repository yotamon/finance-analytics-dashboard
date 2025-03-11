import { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

/**
 * Export format options
 */
export type ExportFormat = "pdf" | "png" | "csv" | "excel" | "json";

/**
 * Export configuration options
 */
export interface ExportOptions {
  /**
   * Filename for the exported file (without extension)
   */
  filename: string;

  /**
   * Export format
   */
  format: ExportFormat;

  /**
   * Paper size for PDF exports (default: 'a4')
   */
  paperSize?: "a4" | "letter" | "legal" | "tabloid";

  /**
   * Orientation for PDF exports (default: 'portrait')
   */
  orientation?: "portrait" | "landscape";

  /**
   * Quality for image exports (0-1, default: 0.95)
   */
  quality?: number;

  /**
   * Scale factor for exports (default: 2)
   */
  scale?: number;

  /**
   * Additional options for specific export formats
   */
  formatOptions?: Record<string, any>;
}

/**
 * Export status object
 */
export interface ExportStatus {
  /**
   * Whether an export is in progress
   */
  isExporting: boolean;

  /**
   * Export progress (0-100)
   */
  progress: number;

  /**
   * Error message if export failed
   */
  error: string | null;

  /**
   * URL to the exported file (for direct download)
   */
  exportedFileUrl: string | null;
}

/**
 * Return type for useExport hook
 */
export interface UseExportReturn {
  /**
   * Current export status
   */
  exportStatus: ExportStatus;

  /**
   * Export data from a DOM element
   */
  exportElement: (element: HTMLElement, options: ExportOptions) => Promise<string>;

  /**
   * Export data directly
   */
  exportData: <T>(data: T[], options: ExportOptions) => Promise<string>;

  /**
   * Reset export status
   */
  resetExport: () => void;
}

/**
 * Hook for exporting data in various formats
 *
 * @returns {UseExportReturn} Functions and state for exporting data
 */
export default function useExport(): UseExportReturn {
  // Export status state
  const [exportStatus, setExportStatus] = useState<ExportStatus>({
    isExporting: false,
    progress: 0,
    error: null,
    exportedFileUrl: null,
  });

  /**
   * Reset the export status
   */
  const resetExport = useCallback((): void => {
    setExportStatus({
      isExporting: false,
      progress: 0,
      error: null,
      exportedFileUrl: null,
    });
  }, []);

  /**
   * Update export progress
   */
  const updateProgress = useCallback((progress: number): void => {
    setExportStatus((prev) => ({
      ...prev,
      progress,
    }));
  }, []);

  /**
   * Export data from a DOM element
   */
  const exportElement = useCallback(
    async (element: HTMLElement, options: ExportOptions): Promise<string> => {
      if (!element) {
        throw new Error("No element provided for export");
      }

      // Start export
      setExportStatus({
        isExporting: true,
        progress: 0,
        error: null,
        exportedFileUrl: null,
      });

      try {
        updateProgress(10);

        const scale = options.scale || 2;
        const quality = options.quality || 0.95;

        // Capture the DOM element as canvas
        const canvas = await html2canvas(element, {
          scale,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        updateProgress(60);

        let exportedUrl: string;

        // Process based on format
        switch (options.format) {
          case "pdf": {
            const orientation = options.orientation || "portrait";
            const paperSize = options.paperSize || "a4";

            // Convert paper size to dimensions
            let width: number;
            let height: number;

            if (paperSize === "a4") {
              width = 210;
              height = 297;
            } else if (paperSize === "letter") {
              width = 216;
              height = 279;
            } else if (paperSize === "legal") {
              width = 216;
              height = 356;
            } else {
              // tabloid
              width = 279;
              height = 432;
            }

            // Swap dimensions for landscape
            if (orientation === "landscape") {
              [width, height] = [height, width];
            }

            const pdf = new jsPDF({
              orientation,
              unit: "mm",
              format: [width, height],
            });

            // Calculate PDF dimensions
            const imgWidth = width;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add image to PDF
            const imgData = canvas.toDataURL("image/jpeg", quality);
            pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

            // Save PDF
            exportedUrl = URL.createObjectURL(pdf.output("blob"));
            break;
          }

          case "png":
          default: {
            // Export as PNG
            exportedUrl = canvas.toDataURL("image/png", quality);
            break;
          }
        }

        updateProgress(90);

        // Trigger download
        const link = document.createElement("a");
        link.href = exportedUrl;
        link.download = `${options.filename}.${options.format}`;
        link.click();

        // Update status
        setExportStatus({
          isExporting: false,
          progress: 100,
          error: null,
          exportedFileUrl: exportedUrl,
        });

        return exportedUrl;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred during export";

        setExportStatus({
          isExporting: false,
          progress: 0,
          error: errorMessage,
          exportedFileUrl: null,
        });

        throw error;
      }
    },
    [updateProgress]
  );

  /**
   * Export data directly (not from DOM)
   */
  const exportData = useCallback(
    async <T>(data: T[], options: ExportOptions): Promise<string> => {
      if (!data || data.length === 0) {
        throw new Error("No data provided for export");
      }

      // Start export
      setExportStatus({
        isExporting: true,
        progress: 0,
        error: null,
        exportedFileUrl: null,
      });

      try {
        updateProgress(10);

        let exportedUrl: string;
        let blob: Blob;

        // Process based on format
        switch (options.format) {
          case "csv": {
            // Convert data to CSV using a different approach
            const worksheet = XLSX.utils.json_to_sheet(data);

            // Use XLSX.write to get CSV content instead of sheet_to_csv
            const csvOutput = XLSX.write(
              { SheetNames: ["Data"], Sheets: { Data: worksheet } },
              { bookType: "csv", type: "string" }
            );

            // Create blob
            blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
            exportedUrl = URL.createObjectURL(blob);
            break;
          }

          case "excel": {
            // Convert data to Excel
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

            // Create Excel file
            const excelOutput = XLSX.write(workbook, {
              bookType: "xlsx",
              type: "array",
            });

            // Create blob
            blob = new Blob([excelOutput], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            exportedUrl = URL.createObjectURL(blob);
            break;
          }

          case "json":
          default: {
            // Convert data to JSON
            const jsonOutput = JSON.stringify(data, null, 2);

            // Create blob
            blob = new Blob([jsonOutput], { type: "application/json" });
            exportedUrl = URL.createObjectURL(blob);
            break;
          }
        }

        updateProgress(90);

        // Trigger download
        const link = document.createElement("a");
        link.href = exportedUrl;
        link.download = `${options.filename}.${options.format}`;
        link.click();

        // Update status
        setExportStatus({
          isExporting: false,
          progress: 100,
          error: null,
          exportedFileUrl: exportedUrl,
        });

        return exportedUrl;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred during export";

        setExportStatus({
          isExporting: false,
          progress: 0,
          error: errorMessage,
          exportedFileUrl: null,
        });

        throw error;
      }
    },
    [updateProgress]
  );

  return {
    exportStatus,
    exportElement,
    exportData,
    resetExport,
  };
}
