/**
 * Core financial data types for the application
 */

export interface Transaction {
  id: string;
  date: string | Date;
  amount: number;
  description: string;
  category?: string;
  accountId: string;
  type: "income" | "expense" | "transfer";
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment" | "loan" | "other";
  balance: number;
  currency: string;
  institution?: string;
  isActive: boolean;
  lastUpdated?: string | Date;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  parentId?: string;
  color?: string;
  icon?: string;
  budget?: number;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string | Date;
  endDate?: string | Date;
  categoryIds: string[];
  rollover?: boolean;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  categorizedExpenses: Record<string, number>;
  categorizedIncome: Record<string, number>;
  trends: {
    date: string | Date;
    income: number;
    expenses: number;
    savings: number;
  }[];
}

export interface ImportedData {
  transactions?: Transaction[];
  accounts?: Account[];
  categories?: Category[];
  budgets?: Budget[];
  dateFormat?: string;
  fileType: "csv" | "xlsx" | "json";
  fileName: string;
  importDate: string | Date;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string | Date;
  category?: string;
  color?: string;
  [key: string]: any;
}

export interface TimeSeriesDataPoint extends ChartDataPoint {
  date: string | Date;
}

export interface DataFilter {
  startDate?: string | Date;
  endDate?: string | Date;
  accounts?: string[];
  categories?: string[];
  types?: ("income" | "expense" | "transfer")[];
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  searchTerm?: string;
}

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CNY" | "INR" | string;
