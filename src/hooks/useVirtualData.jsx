import { useMemo, useState, useCallback } from "react";

/**
 * Hook for virtualizing and paginating large datasets
 *
 * @param {Array} data - The full dataset
 * @param {Object} options - Configuration options
 * @param {number} options.pageSize - Number of items per page (default: 10)
 * @param {Function} options.sortFunction - Function for sorting the data
 * @param {Function} options.filterFunction - Function for filtering the data
 * @returns {Object} - Virtualized data object with pagination controls
 */
function useVirtualData(data = [], { pageSize = 10, sortFunction = null, filterFunction = null } = {}) {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(pageSize);
	const [sortBy, setSortBy] = useState(null);
	const [sortDirection, setSortDirection] = useState("asc");
	const [filterParams, setFilterParams] = useState({});

	// Apply filters to the data
	const filteredData = useMemo(() => {
		if (!data || data.length === 0) return [];
		if (!filterFunction || Object.keys(filterParams).length === 0) return data;

		return data.filter(item => filterFunction(item, filterParams));
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
	const handleChangePage = useCallback((event, newPage) => {
		setPage(newPage);
	}, []);

	// Handle rows per page change
	const handleChangeRowsPerPage = useCallback(event => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	}, []);

	// Handle sorting change
	const handleSort = useCallback(
		column => {
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
	const handleFilter = useCallback(params => {
		setFilterParams(prev => ({
			...prev,
			...params
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
		resetFilters
	};
}

export default useVirtualData;
