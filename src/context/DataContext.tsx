/**
 * DataContext - Financial data management
 *
 * Manages loading, processing, and access to financial data throughout the application.
 * Provides loading states, error handling, and data manipulation functions.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

// Type definitions
interface Project {
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
}

interface FinancialProjections {
  years: number[];
  revenues: number[];
  ebitda: number[];
}

interface CountryTotal {
  country: string;
  capacity: number;
  investment: number;
}

interface KPIs {
  totalCapacity: number;
  averageIrr: number;
  totalInvestment: number;
  totalEbitda: number;
}

interface DerivedFields {
  processedAt: string;
  projectTypes: string[];
  totalProjects: number;
}

interface FinancialData {
  projects: Project[];
  financialProjections: FinancialProjections;
  countryTotals: CountryTotal[];
  kpis: KPIs;
  derivedFields?: DerivedFields;
}

// Loading states enum
enum DataLoadingState {
  IDLE = "idle",
  LOADING = "loading",
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error",
}

// Context type
interface DataContextType {
  /**
   * Current financial data
   */
  data: FinancialData;

  /**
   * Function to set and process new data
   */
  setData: (newData: FinancialData) => Promise<void>;

  /**
   * Function to clear data (resets to initial state)
   */
  clearData: () => void;

  /**
   * Whether data is currently loading
   */
  isLoading: boolean;

  /**
   * Current loading state
   */
  loadingState: DataLoadingState;

  /**
   * Loading progress (0-100)
   */
  loadingProgress: number;

  /**
   * Error message if loading failed
   */
  error: string | null;

  /**
   * Whether the context has data
   */
  hasData: boolean;
}

// Provider props
interface DataProviderProps {
  children: ReactNode;
}

// Default mock data - defined outside the component to ensure it's always available
const MOCK_DATA: FinancialData = {
  projects: [
    {
      name: "Urleasca 2",
      type: "On-shore Wind",
      country: "Romania",
      status: "Planning",
      capacity: 78,
      investmentCost: 102,
      equity: 31,
      revenue: 16,
      ebitda: 15,
      profit: 9,
      yieldOnCost: 0.15,
      irr: 0.281,
      cashReturn: 71,
      location: [27.6744, 45.7489],
    },
    {
      name: "Seaca",
      type: "On-shore Wind",
      country: "Romania",
      status: "Planning",
      capacity: 132,
      investmentCost: 166,
      equity: 50,
      revenue: 24,
      ebitda: 21,
      profit: 12,
      yieldOnCost: 0.13,
      irr: 0.24,
      cashReturn: 61,
      location: [24.3727, 44.3629],
    },
    {
      name: "Solaria",
      type: "Solar PV",
      country: "Spain",
      status: "Development",
      capacity: 95,
      investmentCost: 81,
      equity: 24,
      revenue: 14,
      ebitda: 12,
      profit: 7,
      yieldOnCost: 0.148,
      irr: 0.265,
      cashReturn: 58,
      location: [-3.7492, 40.4637],
    },
    {
      name: "Nordwind",
      type: "Off-shore Wind",
      country: "Germany",
      status: "Operating",
      capacity: 284,
      investmentCost: 495,
      equity: 148,
      revenue: 98,
      ebitda: 86,
      profit: 42,
      yieldOnCost: 0.174,
      irr: 0.312,
      cashReturn: 235,
      location: [8.8017, 53.0793],
    },
  ],
  financialProjections: {
    years: [2023, 2024, 2025, 2026, 2027, 2028, 2029],
    revenues: [42, 68, 105, 145, 178, 212, 248],
    ebitda: [36, 58, 89, 124, 152, 182, 214],
  },
  countryTotals: [
    { country: "Romania", capacity: 210, investment: 268 },
    { country: "Spain", capacity: 95, investment: 81 },
    { country: "Germany", capacity: 284, investment: 495 },
  ],
  kpis: {
    totalCapacity: 589,
    averageIrr: 0.284,
    totalInvestment: 506,
    totalEbitda: 134,
  },
  derivedFields: {
    processedAt: new Date().toISOString(),
    projectTypes: ["On-shore Wind", "Solar PV", "Off-shore Wind"],
    totalProjects: 4,
  },
};

// Create context
const DataContext = createContext<DataContextType | null>(null);

// Context hook
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

// Data processing function
const processDataWorker = (rawData: FinancialData): FinancialData => {
  // Process the data, calculate derived values, etc.
  // For now, we'll just add a timestamp
  const processedData: FinancialData = {
    ...rawData,
    derivedFields: {
      processedAt: new Date().toISOString(),
      projectTypes: rawData.derivedFields?.projectTypes || [],
      totalProjects: rawData.derivedFields?.totalProjects || 0,
    },
  };
  return processedData;
};

// Provider component
export function DataProvider({ children }: DataProviderProps): JSX.Element {
  // State to store financial data
  const [data, setDataState] = useState<FinancialData>(MOCK_DATA);
  const [loadingState, setLoadingState] = useState<DataLoadingState>(DataLoadingState.SUCCESS);
  const [loadingProgress, setLoadingProgress] = useState<number>(100);
  const [error, setError] = useState<string | null>(null);

  // Check if we have data
  const hasData = useMemo(() => {
    return (
      (data?.projects?.length > 0 ||
        (data?.financialProjections?.years?.length > 0 &&
          data?.financialProjections?.revenues?.length > 0)) &&
      loadingState === DataLoadingState.SUCCESS
    );
  }, [data, loadingState]);

  // Use local storage to persist data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("financialData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (
          parsedData &&
          ((parsedData.projects && parsedData.projects.length > 0) ||
            (parsedData.financialProjections &&
              parsedData.financialProjections.years &&
              parsedData.financialProjections.years.length > 0))
        ) {
          setDataState(parsedData);
        } else {
          // If saved data exists but is invalid, use mock data
          setDataState(MOCK_DATA);
        }
      } else {
        // If no saved data exists, use mock data
        setDataState(MOCK_DATA);
      }
      setLoadingState(DataLoadingState.SUCCESS);
      setLoadingProgress(100);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error loading data from localStorage:", err);
      // Fallback to mock data on error
      setDataState(MOCK_DATA);
      setLoadingState(DataLoadingState.SUCCESS);
      setLoadingProgress(100);
    }
  }, []);

  // Function to set new data
  const setData = useCallback(async (newData: FinancialData): Promise<void> => {
    try {
      setLoadingState(DataLoadingState.LOADING);
      setLoadingProgress(20);

      // Process the data
      setLoadingState(DataLoadingState.PROCESSING);
      setLoadingProgress(50);
      const processedData = processDataWorker(newData);

      // Save to localStorage
      setLoadingProgress(80);
      localStorage.setItem("financialData", JSON.stringify(processedData));

      // Update state
      setDataState(processedData);
      setLoadingState(DataLoadingState.SUCCESS);
      setLoadingProgress(100);
      setError(null);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Error setting data:", err);
      setLoadingState(DataLoadingState.ERROR);
      setError(err.message || "Error setting data");
    }
  }, []);

  // Function to clear data
  const clearData = useCallback(() => {
    localStorage.removeItem("financialData");
    setDataState(MOCK_DATA); // Reset to mock data instead of empty state
    setLoadingState(DataLoadingState.SUCCESS);
    setLoadingProgress(100);
    setError(null);
  }, []);

  // Create context value
  const contextValue: DataContextType = useMemo(
    () => ({
      data,
      setData,
      clearData,
      isLoading:
        loadingState === DataLoadingState.LOADING || loadingState === DataLoadingState.PROCESSING,
      loadingState,
      loadingProgress,
      error,
      hasData,
    }),
    [data, setData, clearData, loadingState, loadingProgress, error, hasData]
  );

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
}

// Export the loading state enum
export { DataLoadingState };
