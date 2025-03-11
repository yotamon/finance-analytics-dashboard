import { LucideIcon } from "lucide-react";

/**
 * Export format types supported by the application
 */
export type ExportFormat = "pdf" | "excel" | "images" | "print";

/**
 * Base export options interface
 */
export interface ExportOptions {
  /**
   * Filename for the exported file (without extension)
   */
  filename?: string;

  /**
   * Whether to include data tables in the export
   */
  includeTables: boolean;

  /**
   * Whether to include charts in the export
   */
  includeCharts: boolean;

  /**
   * Whether to include analysis summary in the export
   */
  includeAnalysis: boolean;
}

/**
 * PDF-specific export options
 */
export interface PdfExportOptions extends ExportOptions {
  /**
   * Paper size for PDF exports
   * @default "a4"
   */
  paperSize: "a4" | "letter" | "legal";

  /**
   * Page orientation for PDF exports
   * @default "portrait"
   */
  orientation: "portrait" | "landscape";

  /**
   * Quality/scale factor for PDF exports
   * @default 2
   */
  scale: number;
}

/**
 * Image export options
 */
export interface ImageExportOptions extends ExportOptions {
  /**
   * Quality/scale factor for image exports
   * @default 2
   */
  scale: number;

  /**
   * Image format for exports
   * @default "png"
   */
  format: "png" | "jpeg";

  /**
   * JPEG quality (0-1) if format is 'jpeg'
   * @default 0.9
   */
  quality?: number;
}

/**
 * Excel export options
 */
export interface ExcelExportOptions extends ExportOptions {
  /**
   * Whether to include formulas in the Excel export
   * @default false
   */
  includeFormulas: boolean;

  /**
   * Whether to split data into multiple sheets
   * @default true
   */
  splitSheets: boolean;
}

/**
 * Export option displayed in the UI
 */
export interface ExportOptionItem {
  /**
   * Unique identifier for the export type
   */
  id: ExportFormat;

  /**
   * Display name shown in the UI
   */
  name: string;

  /**
   * Icon component to display
   */
  icon: LucideIcon;

  /**
   * Description of the export type
   */
  description: string;
}

/**
 * Export status and state
 */
export interface ExportState {
  /**
   * Whether an export operation is in progress
   */
  isExporting: boolean;

  /**
   * Current export type being processed, if any
   */
  exportType: ExportFormat | null;

  /**
   * Error message if export failed
   */
  exportError: string | null;
}

/**
 * Dashboard data types that can be exported
 */
export interface ExportableData {
  /**
   * Project data
   */
  projects?: any[];

  /**
   * Key performance indicators
   */
  kpis?: Record<string, any>;

  /**
   * Country-aggregated data
   */
  countryTotals?: any[];

  /**
   * Financial projections data
   */
  financialProjections?: {
    years: number[];
    revenues: number[];
    ebitda: number[];
    [key: string]: any[];
  };
}
