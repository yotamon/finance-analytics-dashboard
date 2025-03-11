import React, {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Transaction,
  Account,
  Category,
  Budget,
  ImportedData,
  FinancialSummary,
  DataFilter,
} from "@/types/financial";

// State definition
interface FinancialDataState {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  importHistory: ImportedData[];
  isDataLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  activeFilter: DataFilter | null;
  lastUpdated: string | null;
}

// Action types
type ActionType =
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "ADD_TRANSACTIONS"; payload: Transaction[] }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "SET_ACCOUNTS"; payload: Account[] }
  | { type: "ADD_ACCOUNT"; payload: Account }
  | { type: "UPDATE_ACCOUNT"; payload: Account }
  | { type: "DELETE_ACCOUNT"; payload: string }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "SET_BUDGETS"; payload: Budget[] }
  | { type: "ADD_BUDGET"; payload: Budget }
  | { type: "UPDATE_BUDGET"; payload: Budget }
  | { type: "DELETE_BUDGET"; payload: string }
  | { type: "IMPORT_DATA"; payload: ImportedData }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "APPLY_FILTER"; payload: DataFilter | null }
  | { type: "CLEAR_DATA" };

// Define context type
interface FinancialDataContextType extends FinancialDataState {
  addTransactions: (transactions: Transaction[]) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  importData: (data: ImportedData) => void;
  applyFilter: (filter: DataFilter | null) => void;
  clearData: () => void;
  getFilteredTransactions: (filter?: DataFilter) => Transaction[];
  getFinancialSummary: (filter?: DataFilter) => FinancialSummary;
  getTransactionsByAccount: (accountId: string) => Transaction[];
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getAccountByName: (name: string) => Account | undefined;
  getCategoryByName: (name: string) => Category | undefined;
}

// Initial state
const initialState: FinancialDataState = {
  transactions: [],
  accounts: [],
  categories: [],
  budgets: [],
  importHistory: [],
  isDataLoaded: false,
  isLoading: false,
  error: null,
  activeFilter: null,
  lastUpdated: null,
};

// Create context
const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

// Reducer function
const financialDataReducer = (
  state: FinancialDataState,
  action: ActionType
): FinancialDataState => {
  switch (action.type) {
    case "SET_TRANSACTIONS":
      return {
        ...state,
        transactions: action.payload,
        lastUpdated: new Date().toISOString(),
      };
    case "ADD_TRANSACTIONS":
      return {
        ...state,
        transactions: [...state.transactions, ...action.payload],
        lastUpdated: new Date().toISOString(),
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
        lastUpdated: new Date().toISOString(),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
        lastUpdated: new Date().toISOString(),
      };
    case "SET_ACCOUNTS":
      return {
        ...state,
        accounts: action.payload,
        lastUpdated: new Date().toISOString(),
      };
    case "ADD_ACCOUNT":
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
        lastUpdated: new Date().toISOString(),
      };
    case "UPDATE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.map((a) => (a.id === action.payload.id ? action.payload : a)),
        lastUpdated: new Date().toISOString(),
      };
    case "DELETE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.payload),
        lastUpdated: new Date().toISOString(),
      };
    case "SET_CATEGORIES":
      return {
        ...state,
        categories: action.payload,
        lastUpdated: new Date().toISOString(),
      };
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
        lastUpdated: new Date().toISOString(),
      };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
        lastUpdated: new Date().toISOString(),
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        lastUpdated: new Date().toISOString(),
      };
    case "SET_BUDGETS":
      return {
        ...state,
        budgets: action.payload,
        lastUpdated: new Date().toISOString(),
      };
    case "ADD_BUDGET":
      return {
        ...state,
        budgets: [...state.budgets, action.payload],
        lastUpdated: new Date().toISOString(),
      };
    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((b) => (b.id === action.payload.id ? action.payload : b)),
        lastUpdated: new Date().toISOString(),
      };
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.id !== action.payload),
        lastUpdated: new Date().toISOString(),
      };
    case "IMPORT_DATA":
      const newImportHistory = [...state.importHistory, action.payload];
      const newState = {
        ...state,
        importHistory: newImportHistory,
        lastUpdated: new Date().toISOString(),
      };

      // Update transactions if available
      if (action.payload.transactions) {
        newState.transactions = [...newState.transactions, ...action.payload.transactions];
      }

      // Update accounts if available
      if (action.payload.accounts) {
        // Deduplicate accounts by name
        const existingAccountNames = new Set(newState.accounts.map((a) => a.name.toLowerCase()));
        const newAccounts = action.payload.accounts.filter(
          (a) => !existingAccountNames.has(a.name.toLowerCase())
        );
        newState.accounts = [...newState.accounts, ...newAccounts];
      }

      // Update isDataLoaded flag
      if (
        !newState.isDataLoaded &&
        ((action.payload.transactions && action.payload.transactions.length > 0) ||
          (action.payload.accounts && action.payload.accounts.length > 0))
      ) {
        newState.isDataLoaded = true;
      }

      return newState;
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "APPLY_FILTER":
      return {
        ...state,
        activeFilter: action.payload,
      };
    case "CLEAR_DATA":
      return {
        ...initialState,
        lastUpdated: new Date().toISOString(),
      };
    default:
      return state;
  }
};

// Provider component
interface FinancialDataProviderProps {
  children: ReactNode;
}

export const FinancialDataProvider: React.FC<FinancialDataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(financialDataReducer, initialState);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const savedDataStr = localStorage.getItem("financialData");
        if (savedDataStr) {
          const savedData = JSON.parse(savedDataStr);

          // Validating that the data has the expected structure
          if (savedData.transactions) {
            dispatch({ type: "SET_TRANSACTIONS", payload: savedData.transactions });
          }

          if (savedData.accounts) {
            dispatch({ type: "SET_ACCOUNTS", payload: savedData.accounts });
          }

          if (savedData.categories) {
            dispatch({ type: "SET_CATEGORIES", payload: savedData.categories });
          }

          if (savedData.budgets) {
            dispatch({ type: "SET_BUDGETS", payload: savedData.budgets });
          }

          if (savedData.importHistory) {
            savedData.importHistory.forEach((importData: ImportedData) => {
              dispatch({ type: "IMPORT_DATA", payload: importData });
            });
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading financial data from localStorage:", error);
      }
    };

    loadFromLocalStorage();
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (state.lastUpdated) {
      try {
        const dataToSave = {
          transactions: state.transactions,
          accounts: state.accounts,
          categories: state.categories,
          budgets: state.budgets,
          importHistory: state.importHistory,
        };

        localStorage.setItem("financialData", JSON.stringify(dataToSave));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error saving financial data to localStorage:", error);
      }
    }
  }, [state.lastUpdated]);

  // Action dispatch functions
  const addTransactions = (transactions: Transaction[]) => {
    dispatch({ type: "ADD_TRANSACTIONS", payload: transactions });
  };

  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: "UPDATE_TRANSACTION", payload: transaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
  };

  const addAccount = (account: Account) => {
    dispatch({ type: "ADD_ACCOUNT", payload: account });
  };

  const updateAccount = (account: Account) => {
    dispatch({ type: "UPDATE_ACCOUNT", payload: account });
  };

  const deleteAccount = (id: string) => {
    dispatch({ type: "DELETE_ACCOUNT", payload: id });
  };

  const addCategory = (category: Category) => {
    dispatch({ type: "ADD_CATEGORY", payload: category });
  };

  const updateCategory = (category: Category) => {
    dispatch({ type: "UPDATE_CATEGORY", payload: category });
  };

  const deleteCategory = (id: string) => {
    dispatch({ type: "DELETE_CATEGORY", payload: id });
  };

  const addBudget = (budget: Budget) => {
    dispatch({ type: "ADD_BUDGET", payload: budget });
  };

  const updateBudget = (budget: Budget) => {
    dispatch({ type: "UPDATE_BUDGET", payload: budget });
  };

  const deleteBudget = (id: string) => {
    dispatch({ type: "DELETE_BUDGET", payload: id });
  };

  const importData = (data: ImportedData) => {
    dispatch({ type: "IMPORT_DATA", payload: data });
  };

  const applyFilter = (filter: DataFilter | null) => {
    dispatch({ type: "APPLY_FILTER", payload: filter });
  };

  const clearData = () => {
    dispatch({ type: "CLEAR_DATA" });
  };

  // Utility functions
  const getFilteredTransactions = (filter?: DataFilter): Transaction[] => {
    const activeFilter = filter || state.activeFilter;

    if (!activeFilter) {
      return state.transactions;
    }

    return state.transactions.filter((transaction) => {
      // Date range filtering
      if (activeFilter.startDate && new Date(transaction.date) < new Date(activeFilter.startDate)) {
        return false;
      }

      if (activeFilter.endDate && new Date(transaction.date) > new Date(activeFilter.endDate)) {
        return false;
      }

      // Account filtering
      if (
        activeFilter.accounts &&
        activeFilter.accounts.length > 0 &&
        !activeFilter.accounts.includes(transaction.accountId)
      ) {
        return false;
      }

      // Category filtering
      if (
        activeFilter.categories &&
        activeFilter.categories.length > 0 &&
        !activeFilter.categories.includes(transaction.category || "")
      ) {
        return false;
      }

      // Transaction type filtering
      if (
        activeFilter.types &&
        activeFilter.types.length > 0 &&
        !activeFilter.types.includes(transaction.type)
      ) {
        return false;
      }

      // Amount range filtering
      if (activeFilter.minAmount !== undefined && transaction.amount < activeFilter.minAmount) {
        return false;
      }

      if (activeFilter.maxAmount !== undefined && transaction.amount > activeFilter.maxAmount) {
        return false;
      }

      // Tag filtering
      if (
        activeFilter.tags &&
        activeFilter.tags.length > 0 &&
        (!transaction.tags || !activeFilter.tags.some((tag) => transaction.tags?.includes(tag)))
      ) {
        return false;
      }

      // Search term filtering
      if (activeFilter.searchTerm && activeFilter.searchTerm.trim() !== "") {
        const searchLower = activeFilter.searchTerm.toLowerCase();
        const descriptionMatch = transaction.description.toLowerCase().includes(searchLower);
        const categoryMatch = transaction.category?.toLowerCase().includes(searchLower) || false;
        const tagsMatch =
          transaction.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) || false;

        if (!descriptionMatch && !categoryMatch && !tagsMatch) {
          return false;
        }
      }

      return true;
    });
  };

  const getFinancialSummary = (filter?: DataFilter): FinancialSummary => {
    const filteredTransactions = getFilteredTransactions(filter);

    // Calculate total income and expenses
    const totalIncome = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate net cash flow
    const netCashFlow = totalIncome - totalExpenses;

    // Calculate savings rate
    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

    // Categorize expenses and income
    const categorizedExpenses: Record<string, number> = {};
    const categorizedIncome: Record<string, number> = {};

    filteredTransactions.forEach((transaction) => {
      const category = transaction.category || "Uncategorized";

      if (transaction.type === "expense") {
        categorizedExpenses[category] =
          (categorizedExpenses[category] || 0) + Math.abs(transaction.amount);
      } else if (transaction.type === "income") {
        categorizedIncome[category] = (categorizedIncome[category] || 0) + transaction.amount;
      }
    });

    // Calculate trends over time
    // Group transactions by month
    const trends: Record<
      string,
      { date: string; income: number; expenses: number; savings: number }
    > = {};

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!trends[monthKey]) {
        trends[monthKey] = {
          date: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
          income: 0,
          expenses: 0,
          savings: 0,
        };
      }

      if (transaction.type === "income") {
        trends[monthKey].income += transaction.amount;
      } else if (transaction.type === "expense") {
        trends[monthKey].expenses += Math.abs(transaction.amount);
      }
    });

    // Calculate savings for each month
    Object.values(trends).forEach((month) => {
      month.savings = month.income - month.expenses;
    });

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      savingsRate,
      categorizedExpenses,
      categorizedIncome,
      trends: Object.values(trends).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    };
  };

  const getTransactionsByAccount = (accountId: string): Transaction[] => {
    return state.transactions.filter((t) => t.accountId === accountId);
  };

  const getTransactionsByCategory = (categoryId: string): Transaction[] => {
    return state.transactions.filter((t) => t.category === categoryId);
  };

  const getAccountByName = (name: string): Account | undefined => {
    return state.accounts.find((a) => a.name.toLowerCase() === name.toLowerCase());
  };

  const getCategoryByName = (name: string): Category | undefined => {
    return state.categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
  };

  const contextValue: FinancialDataContextType = {
    ...state,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    importData,
    applyFilter,
    clearData,
    getFilteredTransactions,
    getFinancialSummary,
    getTransactionsByAccount,
    getTransactionsByCategory,
    getAccountByName,
    getCategoryByName,
  };

  return (
    <FinancialDataContext.Provider value={contextValue}>{children}</FinancialDataContext.Provider>
  );
};

// Custom hook to use the financial data context
export const useFinancialData = (): FinancialDataContextType => {
  const context = useContext(FinancialDataContext);

  if (context === undefined) {
    throw new Error("useFinancialData must be used within a FinancialDataProvider");
  }

  return context;
};

export default FinancialDataProvider;
