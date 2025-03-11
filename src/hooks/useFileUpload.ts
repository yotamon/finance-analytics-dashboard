import { useState, useCallback } from "react";
import { useData } from "../context/DataContext";
import FileProcessor from "../services/FileProcessor";
import { ProcessedData } from "../services/FileProcessor";

// Define our own interface that matches the structure expected by DataContext
interface FinancialData {
  projects: Array<{
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
  }>;
  financialProjections: {
    years: number[];
    revenues: number[];
    ebitda: number[];
    [key: string]: any[];
  };
  countryTotals: Array<{
    country: string;
    capacity: number;
    investment: number;
    [key: string]: any;
  }>;
  kpis: {
    totalCapacity: number;
    averageIrr: number;
    totalInvestment: number;
    totalEbitda: number;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Interface for file upload status
 */
export interface UploadStatus {
  /**
   * Whether a file is currently being uploaded
   */
  isUploading: boolean;

  /**
   * Upload progress percentage (0-100)
   */
  progress: number;

  /**
   * Error message if upload failed
   */
  error: string | null;
}

/**
 * Hook for handling file uploads and processing
 */
export interface UseFileUploadReturn {
  /**
   * Function to upload and process a file
   * @param file - The file to upload and process
   * @returns A promise that resolves with the processed data
   */
  uploadFile: (file: File) => Promise<ProcessedData>;

  /**
   * Current upload status
   */
  uploadStatus: UploadStatus;

  /**
   * Function to reset the upload status
   */
  resetUpload: () => void;
}

/**
 * Converts ProcessedData to FinancialData structure
 * This addresses type incompatibilities between the two interfaces
 */
const convertToFinancialData = (processedData: ProcessedData): FinancialData => {
  // Convert any string years to numbers in the financial projections
  const years = processedData.financialProjections.years.map((year) =>
    typeof year === "string" ? parseInt(year, 10) : year
  );

  return {
    projects: processedData.projects,
    financialProjections: {
      years,
      revenues: processedData.financialProjections.revenues,
      ebitda: processedData.financialProjections.ebitda,
    },
    countryTotals: Object.entries(processedData.countryTotals).map(([country, data]) => ({
      country,
      capacity: data.mw,
      investment: data.investment,
    })),
    kpis: {
      totalCapacity: processedData.kpis.totalCapacity || 0,
      averageIrr: processedData.kpis.averageIrr || 0,
      totalInvestment: processedData.kpis.totalInvestment || 0,
      totalEbitda: processedData.kpis.totalEbitda || 0,
    },
  };
};

/**
 * Custom hook for file upload handling
 * Manages upload state and provides methods for file processing
 */
export default function useFileUpload(): UseFileUploadReturn {
  const { setData } = useData();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const fileProcessor = new FileProcessor();

  const uploadFile = useCallback(
    async (file: File): Promise<ProcessedData> => {
      if (!file) {
        throw new Error("No file provided");
      }

      setUploadStatus({
        isUploading: true,
        progress: 0,
        error: null,
      });

      try {
        // Simulate progress with a fixed delay increment instead of continuous interval
        for (let progress = 10; progress <= 90; progress += 10) {
          setUploadStatus((prev) => ({
            ...prev,
            progress,
          }));
          // Small fixed delay
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Process the file in a single synchronous operation
        const processedData = await fileProcessor.processFile(file);

        // Complete progress
        setUploadStatus({
          isUploading: false,
          progress: 100,
          error: null,
        });

        // Convert the processed data to the format expected by DataContext
        const financialData = convertToFinancialData(processedData);

        // Set the processed data in context - using a timeout to make sure UI updates first
        setTimeout(() => {
          setData(financialData);
        }, 100);

        return processedData;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred during file upload";

        setUploadStatus({
          isUploading: false,
          progress: 0,
          error: errorMessage,
        });

        throw error;
      }
    },
    [fileProcessor, setData]
  );

  const resetUpload = useCallback((): void => {
    setUploadStatus({
      isUploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  return {
    uploadFile,
    uploadStatus,
    resetUpload,
  };
}
