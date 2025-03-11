import { useState, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Transaction, Account, ImportedData } from "@/types/financial";

interface FileProcessorOptions {
  dateFormat?: string;
  numberFormat?: string;
  columnMappings?: Record<string, string>;
  onProgress?: (progress: number) => void;
}

interface ProcessResult {
  success: boolean;
  data: ImportedData | null;
  error: string | null;
}

/**
 * Row data from CSV or Excel file before processing
 */
interface RawDataRow {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Data mapping configuration
 */
interface ColumnMapping {
  [targetField: string]: string;
}

/**
 * Raw data processing result
 */
interface ProcessedData {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  projects: Project[];
}

const useFileProcessor = (options: FileProcessorOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Process CSV files
  const processCSV = useCallback(
    (file: File): Promise<ProcessResult> => {
      return new Promise((resolve) => {
        setIsProcessing(true);
        setError(null);
        setProgress(0);

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              setError(`Error parsing CSV: ${results.errors[0].message}`);
              setIsProcessing(false);
              resolve({
                success: false,
                data: null,
                error: `Error parsing CSV: ${results.errors[0].message}`,
              });
              return;
            }

            try {
              // Map columns if needed
              const { data } = results;
              let processedData: RawDataRow[] = data as RawDataRow[];

              // Apply column mappings if provided
              if (options.columnMappings && Object.keys(options.columnMappings).length > 0) {
                processedData = data.map((row: RawDataRow) => {
                  const mappedRow: RawDataRow = {};
                  Object.entries(options.columnMappings || {}).forEach(
                    ([targetField, sourceField]) => {
                      mappedRow[targetField] = row[sourceField];
                    }
                  );
                  return mappedRow;
                });
              }

              // Try to determine the type of data based on columns
              let transactions: Transaction[] = [];
              let accounts: Account[] = [];

              // Check if data looks like transactions
              if (
                processedData.length > 0 &&
                (processedData[0].date || processedData[0].Date) &&
                (processedData[0].amount || processedData[0].Amount)
              ) {
                transactions = processedData.map((row: RawDataRow, index) => {
                  // Handle common CSV export formats
                  return {
                    id: row.id || row.ID || `import-${index}`,
                    date: row.date || row.Date || new Date().toISOString(),
                    amount:
                      typeof row.amount === "number"
                        ? row.amount
                        : parseFloat(row.amount || row.Amount || "0"),
                    description: row.description || row.Description || row.memo || row.Memo || "",
                    category: row.category || row.Category || "",
                    accountId:
                      row.accountId || row.AccountId || row.account || row.Account || "default",
                    type: determineTransactionType(row.amount || row.Amount, row.type || row.Type),
                    tags: row.tags || row.Tags ? (row.tags || row.Tags).split(",") : [],
                  };
                });
              }

              // Check if data looks like accounts
              if (
                processedData.length > 0 &&
                (processedData[0].name || processedData[0].Name) &&
                (processedData[0].balance || processedData[0].Balance)
              ) {
                accounts = processedData.map((row: RawDataRow, index) => {
                  return {
                    id: row.id || row.ID || `account-${index}`,
                    name: row.name || row.Name || "",
                    type: row.type || row.Type || "checking",
                    balance:
                      typeof row.balance === "number"
                        ? row.balance
                        : parseFloat(row.balance || row.Balance || "0"),
                    currency: row.currency || row.Currency || "USD",
                    institution: row.institution || row.Institution || "",
                    isActive: row.isActive || row.IsActive || true,
                    lastUpdated: row.lastUpdated || row.LastUpdated || new Date().toISOString(),
                  };
                });
              }

              setIsProcessing(false);
              setProgress(100);

              const importedData: ImportedData = {
                transactions: transactions.length > 0 ? transactions : undefined,
                accounts: accounts.length > 0 ? accounts : undefined,
                dateFormat: options.dateFormat,
                fileType: "csv",
                fileName: file.name,
                importDate: new Date().toISOString(),
              };

              resolve({
                success: true,
                data: importedData,
                error: null,
              });
            } catch (err: any) {
              setError(`Error processing CSV data: ${err.message}`);
              setIsProcessing(false);
              resolve({
                success: false,
                data: null,
                error: `Error processing CSV data: ${err.message}`,
              });
            }
          },
          error: (error: Papa.ParseError) => {
            setError(`Error parsing CSV: ${error.message}`);
            setIsProcessing(false);
            resolve({
              success: false,
              data: null,
              error: `Error parsing CSV: ${error.message}`,
            });
          },
          step: (results: Papa.ParseStepResult<RawDataRow>, parser: Papa.Parser) => {
            // Update progress based on approximate percentage
            // Since we don't know the total number of rows in advance,
            // this is an approximation
            setProgress((prevProgress) => {
              if (prevProgress < 90) {
                return prevProgress + 10;
              }
              return prevProgress;
            });
          },
        });
      });
    },
    [options]
  );

  // Process Excel files
  const processExcel = useCallback(
    (file: File): Promise<ProcessResult> => {
      return new Promise((resolve) => {
        setIsProcessing(true);
        setError(null);
        setProgress(0);

        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            setProgress(30);
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            setProgress(50);

            // Assume the first sheet is the one we want
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            setProgress(70);

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            setProgress(90);

            // Apply the same processing as CSV
            let transactions: Transaction[] = [];
            let accounts: Account[] = [];

            // Check if data looks like transactions
            if (
              jsonData.length > 0 &&
              (jsonData[0].date || jsonData[0].Date) &&
              (jsonData[0].amount || jsonData[0].Amount)
            ) {
              transactions = jsonData.map((row: any, index) => {
                return {
                  id: row.id || row.ID || `import-${index}`,
                  date: row.date || row.Date || new Date().toISOString(),
                  amount:
                    typeof row.amount === "number"
                      ? row.amount
                      : parseFloat(row.amount || row.Amount || "0"),
                  description: row.description || row.Description || row.memo || row.Memo || "",
                  category: row.category || row.Category || "",
                  accountId:
                    row.accountId || row.AccountId || row.account || row.Account || "default",
                  type: determineTransactionType(row.amount || row.Amount, row.type || row.Type),
                  tags: row.tags || row.Tags ? (row.tags || row.Tags).split(",") : [],
                };
              });
            }

            // Check if data looks like accounts
            if (
              jsonData.length > 0 &&
              (jsonData[0].name || jsonData[0].Name) &&
              (jsonData[0].balance || jsonData[0].Balance)
            ) {
              accounts = jsonData.map((row: any, index) => {
                return {
                  id: row.id || row.ID || `account-${index}`,
                  name: row.name || row.Name || "",
                  type: row.type || row.Type || "checking",
                  balance:
                    typeof row.balance === "number"
                      ? row.balance
                      : parseFloat(row.balance || row.Balance || "0"),
                  currency: row.currency || row.Currency || "USD",
                  institution: row.institution || row.Institution || "",
                  isActive: row.isActive || row.IsActive || true,
                  lastUpdated: row.lastUpdated || row.LastUpdated || new Date().toISOString(),
                };
              });
            }

            setIsProcessing(false);
            setProgress(100);

            const importedData: ImportedData = {
              transactions: transactions.length > 0 ? transactions : undefined,
              accounts: accounts.length > 0 ? accounts : undefined,
              dateFormat: options.dateFormat,
              fileType: "xlsx",
              fileName: file.name,
              importDate: new Date().toISOString(),
            };

            resolve({
              success: true,
              data: importedData,
              error: null,
            });
          } catch (err: any) {
            setError(`Error processing Excel file: ${err.message}`);
            setIsProcessing(false);
            resolve({
              success: false,
              data: null,
              error: `Error processing Excel file: ${err.message}`,
            });
          }
        };

        reader.onerror = (err) => {
          setError("Error reading file");
          setIsProcessing(false);
          resolve({
            success: false,
            data: null,
            error: "Error reading file",
          });
        };

        reader.readAsBinaryString(file);
      });
    },
    [options]
  );

  // Process JSON files
  const processJSON = useCallback((file: File): Promise<ProcessResult> => {
    return new Promise((resolve) => {
      setIsProcessing(true);
      setError(null);
      setProgress(0);

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          setProgress(50);
          const data = e.target?.result as string;
          const jsonData = JSON.parse(data);
          setProgress(75);

          // Determine if the JSON structure is already in our expected format
          let importedData: ImportedData;

          if (jsonData.transactions || jsonData.accounts) {
            // Data is already in our expected format
            importedData = {
              ...jsonData,
              fileType: "json",
              fileName: file.name,
              importDate: jsonData.importDate || new Date().toISOString(),
            };
          } else if (Array.isArray(jsonData)) {
            // Try to determine if this is an array of transactions or accounts
            const isTransactions =
              jsonData.length > 0 &&
              (jsonData[0].date || jsonData[0].Date || jsonData[0].amount || jsonData[0].Amount);

            const isAccounts =
              jsonData.length > 0 &&
              (jsonData[0].name || jsonData[0].Name || jsonData[0].balance || jsonData[0].Balance);

            importedData = {
              transactions: isTransactions ? jsonData.map(formatTransaction) : undefined,
              accounts: isAccounts ? jsonData.map(formatAccount) : undefined,
              fileType: "json",
              fileName: file.name,
              importDate: new Date().toISOString(),
            };
          } else {
            // Unknown structure
            throw new Error("JSON structure not recognized");
          }

          setIsProcessing(false);
          setProgress(100);

          resolve({
            success: true,
            data: importedData,
            error: null,
          });
        } catch (err: any) {
          setError(`Error processing JSON file: ${err.message}`);
          setIsProcessing(false);
          resolve({
            success: false,
            data: null,
            error: `Error processing JSON file: ${err.message}`,
          });
        }
      };

      reader.onerror = (err) => {
        setError("Error reading file");
        setIsProcessing(false);
        resolve({
          success: false,
          data: null,
          error: "Error reading file",
        });
      };

      reader.readAsText(file);
    });
  }, []);

  // Main process file function
  const processFile = useCallback(
    async (file: File): Promise<ProcessResult> => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

      if (fileExtension === "csv") {
        return processCSV(file);
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        return processExcel(file);
      } else if (fileExtension === "json") {
        return processJSON(file);
      } else {
        setError(`Unsupported file format: ${fileExtension}`);
        return {
          success: false,
          data: null,
          error: `Unsupported file format: ${fileExtension}`,
        };
      }
    },
    [processCSV, processExcel, processJSON]
  );

  // Process multiple files
  const processFiles = useCallback(
    async (files: File[]): Promise<ImportedData[]> => {
      setIsProcessing(true);
      setError(null);
      setProgress(0);

      const results: ImportedData[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress((i / files.length) * 100);

        try {
          const result = await processFile(file);
          if (result.success && result.data) {
            results.push(result.data);
          }
        } catch (err: any) {
          // eslint-disable-next-line no-console
          console.error(`Error processing file ${file.name}:`, err);
          setError((prev) =>
            prev ? `${prev}, ${file.name}: ${err.message}` : `${file.name}: ${err.message}`
          );
        }
      }

      setIsProcessing(false);
      setProgress(100);

      return results;
    },
    [processFile]
  );

  return {
    processFile,
    processFiles,
    isProcessing,
    progress,
    error,
    resetError: () => setError(null),
  };
};

// Helper functions
const determineTransactionType = (
  amount: number | string,
  type?: string
): "income" | "expense" | "transfer" => {
  if (type) {
    const lowerType = type.toLowerCase();
    if (lowerType === "income" || lowerType === "deposit" || lowerType === "credit") {
      return "income";
    }
    if (lowerType === "expense" || lowerType === "withdrawal" || lowerType === "debit") {
      return "expense";
    }
    if (lowerType === "transfer") {
      return "transfer";
    }
  }

  // If no type specified, determine based on amount
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return numAmount >= 0 ? "income" : "expense";
};

/**
 * Format raw data row to Transaction type
 */
const formatTransaction = (row: RawDataRow, index: number): Transaction => {
  return {
    id: row.id || row.ID || `import-${index}`,
    date: row.date || row.Date || new Date().toISOString(),
    amount:
      typeof row.amount === "number" ? row.amount : parseFloat(row.amount || row.Amount || "0"),
    description: row.description || row.Description || row.memo || row.Memo || "",
    category: row.category || row.Category || "",
    accountId: row.accountId || row.AccountId || row.account || row.Account || "default",
    type: determineTransactionType(row.amount || row.Amount, row.type || row.Type),
    tags:
      row.tags || row.Tags
        ? typeof (row.tags || row.Tags) === "string"
          ? (row.tags || row.Tags).split(",")
          : row.tags || row.Tags
        : [],
  };
};

/**
 * Format raw data row to Account type
 */
const formatAccount = (row: RawDataRow, index: number): Account => {
  return {
    id: row.id || row.ID || `account-${index}`,
    name: row.name || row.Name || "",
    type: row.type || row.Type || "checking",
    balance:
      typeof row.balance === "number" ? row.balance : parseFloat(row.balance || row.Balance || "0"),
    currency: row.currency || row.Currency || "USD",
    institution: row.institution || row.Institution || "",
    isActive: row.isActive || row.IsActive || true,
    lastUpdated: row.lastUpdated || row.LastUpdated || new Date().toISOString(),
  };
};

export default useFileProcessor;
