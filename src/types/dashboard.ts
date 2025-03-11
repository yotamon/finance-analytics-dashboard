/**
 * Dashboard Types
 * Common type definitions used across dashboard components
 */

import { ReactNode } from "react";
import { Layout, Layouts } from "react-grid-layout";

// Chart size types
export type ChartSize = "1/3" | "1/2" | "full" | string;
export type ChartHeight = "xs" | "sm" | "md" | "lg" | "xl" | "full" | number;

// Chart configuration
export interface ChartConfig {
  id: string;
  name: string;
  description: string;
  defaultSize: string;
  defaultOrder: number;
  defaultVisible: boolean;
}

// Chart customization settings
export interface ChartCustomization {
  id: string;
  visible: boolean;
  locked: boolean;
  size: string;
  order: number;
  name?: string;
  description?: string;
}

// Chart size option
export interface SizeOption {
  name: string;
  cols: number;
}

// Size options mapping
export interface SizeOptionsMap {
  [key: string]: SizeOption;
}

// Saved dashboard layout
export interface SavedLayout {
  id: string;
  name: string;
  charts: ChartCustomization[];
  created: string;
}

// Chart container props
export interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  height?: ChartHeight;
  icon?: React.ElementType;
  onHide?: () => void;
  onResizeCard?: (size: ChartSize) => void;
  extraActions?: ReactNode;
  infoContent?: ReactNode;
  autoHeight?: boolean;
  className?: string;
  noPadding?: boolean;
  transparentBg?: boolean;
  exportFileName?: string;
  exportData?: any;
  fullWidth?: boolean;
  minHeight?: number | string;
  maxHeight?: number | string;
  disableOptions?: boolean;
  disableExport?: boolean;
  initialShowInfo?: boolean;
}

// Dashboard customizer props
export interface DashboardCustomizerProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (charts: ChartCustomization[]) => void;
  savedCharts?: ChartCustomization[];
}

// Draggable dashboard props
export interface DraggableDashboardProps {
  financialData: any; // Replace with actual financial data type
  projectData: any; // Replace with actual project data type
  countryData: any; // Replace with actual country data type
  editMode?: boolean;
  onLayoutChange?: (layouts: Layouts) => void;
  savedLayouts?: Layouts | null;
}

// Filter menu props
export interface FilterMenuProps {
  open: boolean;
  onClose: () => void;
  filterGroups: FilterGroup[];
  onApplyFilters: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
  position?: "left" | "right";
  width?: number | string;
}

// Filter options
export interface CheckboxFilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface RangeFilterOption {
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
}

export interface DateRangeFilter {
  startDate: Date | null;
  endDate: Date | null;
}

export interface FilterGroup {
  id: string;
  type: "checkbox" | "radio" | "range" | "dateRange" | "select";
  label: string;
  options?: CheckboxFilterOption[];
  rangeOptions?: RangeFilterOption;
  selectOptions?: string[];
}

export interface FilterValues {
  checkboxes: Record<string, string[]>;
  radios: Record<string, string>;
  ranges: Record<string, [number, number]>;
  dateRanges: Record<string, DateRangeFilter>;
  selects: Record<string, string>;
}

// Project data type
export interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  value: number;
  status: string;
  startDate: string;
  completion: number;
  riskLevel: "low" | "medium" | "high";
  manager: string;
  portfolioId?: string;
  country?: string;
  [key: string]: any; // Allow for additional properties
}

// Project table props
export interface ProjectTableCardProps {
  data: Project[];
  title?: string;
  showFilters?: boolean;
  maxHeight?: number | string;
  onProjectClick?: (project: Project) => void;
  loading?: boolean;
  filterOptions?: {
    countries?: string[];
    types?: string[];
    statuses?: string[];
    managers?: string[];
  };
}

// Define grid stability ref type
export interface GridStabilityRef {
  attemptCount: number;
  isFullyReady: boolean;
  isMounted: boolean;
  activeDragElement: HTMLElement | null;
  activeResizeElement: HTMLElement | null;
  lastDragNode: HTMLElement | null;
  activeDragId?: string;
}
