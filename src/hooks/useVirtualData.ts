import { useMemo, useState, useCallback, ChangeEvent } from "react";

/**
 * Interface for the options parameter of useVirtualData
 */
interface VirtualDataOptions<T> {
  /** Number of items per page */
  pageSize?: number;
  /** Function for sorting the data */
  sortFunction?: ((a: T, b: T, sortBy: keyof T | string) => number) | null;
  /** Function for filtering the data */
  filterFunction?: ((item: T, filterParams: Record<string, any>) => boolean) | null;
}

/**
 * Interface for the return value of useVirtualData
 */
interface VirtualDataReturn<T> {
  /** Current page data */
  data: T[];
  /** All original data */
  allData: T[];
  /** Filtered data before pagination */
  filteredData: T[];
  /** Total count of filtered items */
  totalCount: number;
  /** Total number of pages */
  pageCount: number;
  /** Current page index */
  page: number;
  /** Number of rows per page */
  rowsPerPage: number;
  /** Current sort column */
  sortBy: keyof T | string | null;
  /** Current sort direction */
  sortDirection: "asc" | "desc";
  /** Current filter parameters */
  filterParams: Record<string, any>;
  /** Handler for page changes */
  handleChangePage: (event: unknown, newPage: number) => void;
  /** Handler for rows per page changes */
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Handler for sort changes */
  handleSort: (column: keyof T | string) => void;
  /** Handler for filter changes */
  handleFilter: (params: Record<string, any>) => void;
  /** Reset all filters */
  resetFilters: () => void;
}

/**
 * Hook for virtualizing and paginating large datasets
 *
 * @param data - The full dataset
 * @param options - Configuration options
 * @returns Virtualized data object with pagination controls
 */
function useVirtualData<T extends Record<string, any>>(
  data: T[] = [],
  { pageSize = 10, sortFunction = null, filterFunction = null }: VirtualDataOptions<T> = {}
): VirtualDataReturn<T> {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(pageSize);
  const [sortBy, setSortBy] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterParams, setFilterParams] = useState<Record<string, any>>({});

  // Apply filters to the data
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [] as T[];
    if (!filterFunction || Object.keys(filterParams).length === 0) return data;

    return data.filter((item) => filterFunction(item, filterParams));
  }, [data, filterParams, filterFunction]);

  // Apply sorting to the filtered data
  const sortedData = useMemo(() => {
    if (!sortBy || !sortFunction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const result = sortFunction(a, b, sortBy);
      return sortDirection === "asc" ? result : -result;
    });
  }, [filteredData, sortBy, sortDirection, sortFunction]);

  // Get current page data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  // Handle page change
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  // Handle rows per page change
  const handleChangeRowsPerPage = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  // Handle sorting change
  const handleSort = useCallback(
    (column: keyof T | string) => {
      if (sortBy === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortBy(column);
        setSortDirection("asc");
      }
    },
    [sortBy, sortDirection]
  );

  // Handle filter change
  const handleFilter = useCallback((params: Record<string, any>) => {
    setFilterParams((prev) => ({
      ...prev,
      ...params,
    }));
    setPage(0); // Reset to first page when filter changes
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilterParams({});
    setPage(0);
  }, []);

  return {
    // Data
    data: paginatedData,
    allData: data,
    filteredData,
    totalCount: filteredData.length,
    pageCount: Math.ceil(filteredData.length / rowsPerPage),

    // Pagination state
    page,
    rowsPerPage,

    // Sorting state
    sortBy,
    sortDirection,

    // Filter state
    filterParams,

    // Handlers
    handleChangePage,
    handleChangeRowsPerPage,
    handleSort,
    handleFilter,
    resetFilters,
  };
}

export default useVirtualData;
