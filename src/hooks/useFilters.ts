import { useState, useCallback, useMemo } from "react";

/**
 * Represents the possible value types that can be used in a filter
 */
export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | Array<string | number | boolean | Date>;

/**
 * Filter configuration for a single field
 */
export interface FilterConfig<T> {
  /**
   * Field to filter on
   */
  field: keyof T;

  /**
   * Operator for the filter
   */
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "between"
    | "in";

  /**
   * Value to filter with
   */
  value: FilterValue;

  /**
   * Secondary value for range filters (between)
   */
  value2?: FilterValue;

  /**
   * Whether this filter is active
   */
  active: boolean;
}

/**
 * Filters state containing multiple filter configurations
 */
export interface FiltersState<T> {
  /**
   * Map of filter IDs to filter configurations
   */
  filters: Record<string, FilterConfig<T>>;

  /**
   * Logical operator for combining filters (AND/OR)
   */
  logicalOperator: "AND" | "OR";
}

/**
 * Hook return type
 */
export interface UseFiltersReturn<T> {
  /**
   * Current filters state
   */
  filtersState: FiltersState<T>;

  /**
   * Filtered data
   */
  filteredData: T[];

  /**
   * Whether any filters are active
   */
  hasActiveFilters: boolean;

  /**
   * Add a new filter
   */
  addFilter: (id: string, config: FilterConfig<T>) => void;

  /**
   * Update an existing filter
   */
  updateFilter: (id: string, config: Partial<FilterConfig<T>>) => void;

  /**
   * Remove a filter
   */
  removeFilter: (id: string) => void;

  /**
   * Set a filter's active state
   */
  setFilterActive: (id: string, active: boolean) => void;

  /**
   * Toggle the logical operator (AND/OR)
   */
  toggleLogicalOperator: () => void;

  /**
   * Reset all filters
   */
  resetFilters: () => void;
}

/**
 * Check if an item matches a single filter
 */
function matchesFilter<T>(item: T, filter: FilterConfig<T>): boolean {
  if (!filter.active) return true;

  const fieldValue = item[filter.field];
  const filterValue = filter.value;

  switch (filter.operator) {
    case "eq":
      return fieldValue === filterValue;
    case "neq":
      return fieldValue !== filterValue;
    case "gt":
      return (
        typeof fieldValue === "number" &&
        typeof filterValue === "number" &&
        fieldValue > filterValue
      );
    case "gte":
      return (
        typeof fieldValue === "number" &&
        typeof filterValue === "number" &&
        fieldValue >= filterValue
      );
    case "lt":
      return (
        typeof fieldValue === "number" &&
        typeof filterValue === "number" &&
        fieldValue < filterValue
      );
    case "lte":
      return (
        typeof fieldValue === "number" &&
        typeof filterValue === "number" &&
        fieldValue <= filterValue
      );
    case "contains":
      return (
        typeof fieldValue === "string" &&
        fieldValue.toLowerCase().includes(String(filterValue).toLowerCase())
      );
    case "startsWith":
      return (
        typeof fieldValue === "string" &&
        fieldValue.toLowerCase().startsWith(String(filterValue).toLowerCase())
      );
    case "endsWith":
      return (
        typeof fieldValue === "string" &&
        fieldValue.toLowerCase().endsWith(String(filterValue).toLowerCase())
      );
    case "between":
      return (
        typeof fieldValue === "number" &&
        typeof filterValue === "number" &&
        typeof filter.value2 === "number" &&
        fieldValue >= filterValue &&
        fieldValue <= filter.value2
      );
    case "in":
      if (Array.isArray(filterValue)) {
        return filterValue.some((value) => String(value) === String(fieldValue));
      }
      return false;
    default:
      return true;
  }
}

/**
 * Custom hook for filtering data
 *
 * @template T The type of data items
 * @param {T[]} data The data to filter
 * @returns {UseFiltersReturn<T>} Functions and state for filtering
 */
export default function useFilters<T extends Record<string, any>>(data: T[]): UseFiltersReturn<T> {
  // Filters state
  const [filtersState, setFiltersState] = useState<FiltersState<T>>({
    filters: {},
    logicalOperator: "AND",
  });

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filtersState.filters).some((filter) => filter.active);
  }, [filtersState.filters]);

  // Add a new filter
  const addFilter = useCallback((id: string, config: FilterConfig<T>) => {
    setFiltersState((prevState) => ({
      ...prevState,
      filters: {
        ...prevState.filters,
        [id]: config,
      },
    }));
  }, []);

  // Update an existing filter
  const updateFilter = useCallback((id: string, config: Partial<FilterConfig<T>>) => {
    setFiltersState((prevState) => {
      if (!prevState.filters[id]) return prevState;

      return {
        ...prevState,
        filters: {
          ...prevState.filters,
          [id]: {
            ...prevState.filters[id],
            ...config,
          },
        },
      };
    });
  }, []);

  // Remove a filter
  const removeFilter = useCallback((id: string) => {
    setFiltersState((prevState) => {
      const newFilters = { ...prevState.filters };
      delete newFilters[id];

      return {
        ...prevState,
        filters: newFilters,
      };
    });
  }, []);

  // Set a filter's active state
  const setFilterActive = useCallback(
    (id: string, active: boolean) => {
      updateFilter(id, { active });
    },
    [updateFilter]
  );

  // Toggle the logical operator (AND/OR)
  const toggleLogicalOperator = useCallback(() => {
    setFiltersState((prevState) => ({
      ...prevState,
      logicalOperator: prevState.logicalOperator === "AND" ? "OR" : "AND",
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFiltersState({
      filters: {},
      logicalOperator: "AND",
    });
  }, []);

  // Apply all active filters to the data
  const filteredData = useMemo(() => {
    if (!hasActiveFilters) return data;

    return data.filter((item) => {
      const activeFilters = Object.values(filtersState.filters).filter((f) => f.active);

      if (activeFilters.length === 0) return true;

      if (filtersState.logicalOperator === "AND") {
        return activeFilters.every((filter) => matchesFilter(item, filter));
      } else {
        return activeFilters.some((filter) => matchesFilter(item, filter));
      }
    });
  }, [data, filtersState, hasActiveFilters]);

  return {
    filtersState,
    filteredData,
    hasActiveFilters,
    addFilter,
    updateFilter,
    removeFilter,
    setFilterActive,
    toggleLogicalOperator,
    resetFilters,
  };
}
