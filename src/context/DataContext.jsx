import { createContext, useContext, useState, useCallback } from "react";

// Default mock data - defined outside the component to ensure it's always available
const MOCK_DATA = {
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
			location: [27.6744, 45.7489]
		},
		{
			name: "Seaca",
			type: "On-shore Wind",
			country: "Romania",
			status: "Planning",
			capacity: 132,
			investmentCost: 166,
			equity: 50,
			revenue: 26,
			ebitda: 23,
			profit: 14,
			yieldOnCost: 0.14,
			irr: 0.318,
			cashReturn: 107,
			location: [24.3504, 44.3223]
		},
		{
			name: "Negotino",
			type: "Solar Ground",
			country: "N.Macedonia",
			status: "Planning",
			capacity: 111,
			investmentCost: 65,
			equity: 19,
			revenue: 9,
			ebitda: 8,
			profit: 5,
			yieldOnCost: 0.13,
			irr: 0.282,
			cashReturn: 43,
			location: [22.0888, 41.4834]
		},
		{
			name: "Bitola",
			type: "Solar Ground",
			country: "N.Macedonia",
			status: "Planning",
			capacity: 57,
			investmentCost: 36,
			equity: 11,
			revenue: 5,
			ebitda: 5,
			profit: 3,
			yieldOnCost: 0.13,
			irr: 0.268,
			cashReturn: 24,
			location: [21.3433, 41.0297]
		},
		{
			name: "Shivacevo",
			type: "Solar Ground",
			country: "Bulgaria",
			status: "Planning",
			capacity: 86,
			investmentCost: 62,
			equity: 19,
			revenue: 9,
			ebitda: 9,
			profit: 6,
			yieldOnCost: 0.14,
			irr: 0.293,
			cashReturn: 45,
			location: [26.0241, 42.6816]
		},
		{
			name: "Hadjicica",
			type: "Solar Ground",
			country: "Serbia",
			status: "Planning",
			capacity: 125,
			investmentCost: 75,
			equity: 23,
			revenue: 10,
			ebitda: 10,
			profit: 6,
			yieldOnCost: 0.13,
			irr: 0.264,
			cashReturn: 49,
			location: [20.4651, 44.8048]
		}
	],
	financialProjections: {
		years: [2024, 2025, 2026, 2027, 2028, 2029, 2030],
		revenues: [0, 16.1, 98.5, 99.1, 99.7, 100.4, 101.0],
		ebitda: [0, 14.8, 89.5, 90.1, 90.7, 91.3, 91.9]
	},
	countryTotals: [
		{ country: "Romania", capacity: 210, investment: 268 },
		{ country: "N.Macedonia", capacity: 168, investment: 101 },
		{ country: "Bulgaria", capacity: 86, investment: 62 },
		{ country: "Serbia", capacity: 125, investment: 75 },
		{ country: "Greece", capacity: 134, investment: 149 }
	],
	kpis: {
		totalCapacity: 723,
		averageIrr: 0.284,
		totalInvestment: 655,
		totalEbitda: 91
	}
};

// Create the context with a default empty value
const DataContext = createContext(null);

// Custom hook for accessing the data context
export const useData = () => {
	const context = useContext(DataContext);
	if (!context) {
		throw new Error("useData must be used within a DataProvider");
	}
	return context;
};

// Provider component that wraps the app
export function DataProvider({ children }) {
	// Initialize state with mock data directly to avoid any loading inconsistencies
	const [data, setData] = useState(MOCK_DATA);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	// Process data function
	const processData = useCallback(async newData => {
		setIsLoading(true);
		setError(null);

		try {
			// You can add data processing logic here if needed
			setData(newData);
		} catch (err) {
			setError(err.message || "An error occurred while processing data");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Clear data function
	const clearData = useCallback(() => {
		// Instead of setting to null, reset to initial mock data
		setData(MOCK_DATA);
		setError(null);
	}, []);

	// Always true for demo purposes
	const hasData = true;

	// Context value
	const contextValue = {
		data,
		setData: processData,
		clearData,
		isLoading,
		error,
		hasData
	};

	return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
}

// No need to export useData again, it's already exported above
