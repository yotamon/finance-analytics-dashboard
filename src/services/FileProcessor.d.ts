/**
 * Processed data structure returned by FileProcessor
 */
export interface ProcessedData {
  kpis: Record<string, any>;
  financialProjections: {
    years: (number | string)[];
    revenues: number[];
    operationCosts: number[];
    ebitda: number[];
    profit: number[];
    cashFlow: number[];
    [key: string]: any[];
  };
  projects: {
    name: string;
    type: string;
    country: string;
    status: string;
    capacity: number;
    investmentCost: number;
    equity: number;
    revenue: number;
    ebitda: number;
    profit: number;
    yieldOnCost: number;
    irr: number;
    cashReturn: number;
    location: [number, number]; // [longitude, latitude]
    [key: string]: any;
  }[];
  countryTotals: Record<
    string,
    {
      sites: number;
      mw: number;
      investment: number;
      equity: number;
      revenue: number;
      ebitda: number;
      profit: number;
      [key: string]: any;
    }
  >;
  projectTypes: Record<
    string,
    {
      count: number;
      totalCapacity: number;
      averageIrr: number;
      [key: string]: any;
    }
  >;
  [key: string]: any;
}

/**
 * FileProcessor - Handles CSV/Excel file uploads and processes data for visualization
 */
declare class FileProcessor {
  /**
   * Creates a new FileProcessor instance
   */
  constructor();

  /**
   * Raw data from the parsed file
   */
  data: any[] | null;

  /**
   * Processed data structure
   */
  processedData: ProcessedData;

  /**
   * List of supported file formats
   */
  supportedFormats: string[];

  /**
   * Data structure type detected from the file
   */
  dataStructure: "projects" | "financials" | "mixed" | "unknown";

  /**
   * Process an uploaded file (CSV or Excel)
   * @param file - The uploaded file object
   * @returns A promise that resolves with processed data or rejects with error
   */
  processFile(file: File): Promise<ProcessedData>;

  /**
   * Process CSV file
   * @private
   */
  private processCsvFile(
    file: File,
    resolve: (data: ProcessedData) => void,
    reject: (error: Error) => void
  ): void;

  /**
   * Process Excel file
   * @private
   */
  private processExcelFile(
    file: File,
    resolve: (data: ProcessedData) => void,
    reject: (error: Error) => void
  ): void;

  /**
   * Process the raw data into visualization-ready formats
   * @private
   */
  private processData(): void;

  /**
   * Attempt to detect the structure of the uploaded data
   * @private
   */
  private detectDataStructure(): void;

  /**
   * Process project-centric data
   * @private
   */
  private processProjectsData(): void;

  /**
   * Process financial projection data
   * @private
   */
  private processFinancialsData(): void;

  /**
   * Process mixed data (contains both project and financial data)
   * @private
   */
  private processMixedData(): void;

  /**
   * Create financial projections from project data
   * @private
   */
  private createFinancialProjectionsFromProjects(): void;

  /**
   * Create dummy project data from financial projections
   * @private
   */
  private createDummyProjectsFromFinancials(): void;

  /**
   * Normalize a row of project data
   * @private
   */
  private normalizeProjectData(row: Record<string, any>): any;

  /**
   * Find a field in a row by terms
   * @private
   */
  private findFieldByTerm(row: Record<string, any>, terms: string[]): string | undefined;

  /**
   * Extract a numeric value from a row
   * @private
   */
  private extractNumericValue(row: Record<string, any>, possibilities: string[]): number;

  /**
   * Get default location coordinates for a country
   * @private
   */
  private getDefaultLocation(country: string): [number, number];

  /**
   * Calculate additional metrics and KPIs
   * @private
   */
  private calculateAdditionalMetrics(): void;
}

export default FileProcessor;
