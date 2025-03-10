import Papa from "papaparse";
import * as XLSX from "xlsx";
import _ from "lodash";

/**
 * FileProcessor - Handles CSV/Excel file uploads and processes data for visualization
 */
export default class FileProcessor {
	constructor() {
		this.data = null;
		this.processedData = {
			kpis: {},
			financialProjections: {},
			projects: [],
			countryTotals: {},
			projectTypes: {}
		};
		this.supportedFormats = ["csv", "xlsx", "xls"];
	}

	/**
	* Process an uploaded file (CSV or Excel)
	* @param {File} file - The uploaded file object
	* @returns {Promise} - Resolves with processed data or rejects with error
	*/
	async processFile(file) {
		return new Promise((resolve, reject) => {
			const fileExtension = file.name.split(".").pop().toLowerCase();

			if (!this.supportedFormats.includes(fileExtension)) {
				reject(new Error(`Unsupported file format: ${fileExtension}. Please upload CSV or Excel files.`));
				return;
			}

			if (fileExtension === "csv") {
				this.processCsvFile(file, resolve, reject);
			} else {
				this.processExcelFile(file, resolve, reject);
			}
		});
	}

	/**
	* Process CSV file
	* @private
	*/
	processCsvFile(file, resolve, reject) {
		Papa.parse(file, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			complete: results => {
				try {
					this.data = results.data;
					this.processData();
					resolve(this.processedData);
				} catch (error) {
					reject(error);
				}
			},
			error: error => {
				reject(error);
			}
		});
	}

	/**
	* Process Excel file
	* @private
	*/
	processExcelFile(file, resolve, reject) {
		const reader = new FileReader();

		reader.onload = e => {
			try {
				const data = new Uint8Array(e.target.result);
				const workbook = XLSX.read(data, { type: "array" });

				// Assume first sheet is the main data
				const firstSheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[firstSheetName];

				// Convert to JSON
				this.data = XLSX.utils.sheet_to_json(worksheet);
				this.processData();
				resolve(this.processedData);
			} catch (error) {
				reject(error);
			}
		};

		reader.onerror = error => {
			reject(error);
		};

		reader.readAsArrayBuffer(file);
	}

	/**
	* Process the raw data into visualization-ready formats
	* @private
	*/
	processData() {
		// Detect the data structure type
		this.detectDataStructure();

		// Process different sections based on detected structure
		if (this.dataStructure === "projects") {
			this.processProjectsData();
		} else if (this.dataStructure === "financials") {
			this.processFinancialsData();
		} else if (this.dataStructure === "mixed") {
			this.processMixedData();
		} else {
			throw new Error("Could not determine data structure. Please check the file format.");
		}

		// Calculate additional metrics and KPIs
		this.calculateAdditionalMetrics();
	}

	/**
	* Attempt to detect the structure of the uploaded data
	* @private
	*/
	detectDataStructure() {
		if (!this.data || this.data.length === 0) {
			this.dataStructure = "unknown";
			return;
		}

		// Get column headers
		const headers = Object.keys(this.data[0]);

		// Check if it looks like project data
		const projectHeaders = ["name", "type", "country", "capacity", "investment", "equity", "revenue", "ebitda"];
		const hasProjectData = projectHeaders.some(header => headers.some(h => h.toLowerCase().includes(header.toLowerCase())));

		// Check if it looks like financial projection data
		const financialHeaders = ["year", "revenue", "cost", "ebitda", "profit", "cashflow"];
		const hasFinancialData = financialHeaders.some(header => headers.some(h => h.toLowerCase().includes(header.toLowerCase())));

		if (hasProjectData && hasFinancialData) {
			this.dataStructure = "mixed";
		} else if (hasProjectData) {
			this.dataStructure = "projects";
		} else if (hasFinancialData) {
			this.dataStructure = "financials";
		} else {
			this.dataStructure = "unknown";
		}
	}

	/**
	* Process project-centric data
	* @private
	*/
	processProjectsData() {
		// Map the raw data to normalized project structure
		this.processedData.projects = this.data.map(row => this.normalizeProjectData(row));

		// Group projects by country
		this.processedData.countryTotals = _.chain(this.processedData.projects)
			.groupBy("country")
			.mapValues(projects => ({
				sites: projects.length,
				mw: _.sumBy(projects, "capacity"),
				investment: _.sumBy(projects, "investmentCost"),
				equity: _.sumBy(projects, "equity"),
				revenue: _.sumBy(projects, "revenue"),
				ebitda: _.sumBy(projects, "ebitda"),
				profit: _.sumBy(projects, "profit")
			}))
			.value();

		// Group by project type
		this.processedData.projectTypes = _.chain(this.processedData.projects)
			.groupBy("type")
			.mapValues(projects => ({
				count: projects.length,
				totalCapacity: _.sumBy(projects, "capacity"),
				averageIrr: _.meanBy(projects, "irr")
			}))
			.value();

		// Create simple financial projections based on projects
		// Assuming all projects come online in 2026
		this.createFinancialProjectionsFromProjects();
	}

	/**
	* Process financial projection data
	* @private
	*/
	processFinancialsData() {
		// Assuming the data is year-by-year financial projections
		this.processedData.financialProjections = {
			years: [],
			revenues: [],
			operationCosts: [],
			ebitda: [],
			profit: [],
			cashFlow: []
		};

		// Sort data by year/period
		const sortedData = _.sortBy(this.data, row => {
			// Find the year field (might be called "year", "period", "date", etc.)
			const yearField = Object.keys(row).find(key => key.toLowerCase().includes("year") || key.toLowerCase().includes("period") || key.toLowerCase().includes("date"));
			return row[yearField];
		});

		// Extract the data series
		sortedData.forEach(row => {
			// Find field names by common terms
			const yearField = this.findFieldByTerm(row, ["year", "period", "date"]);
			const revenueField = this.findFieldByTerm(row, ["revenue", "income"]);
			const costField = this.findFieldByTerm(row, ["cost", "expense", "opex"]);
			const ebitdaField = this.findFieldByTerm(row, ["ebitda"]);
			const profitField = this.findFieldByTerm(row, ["profit", "net income", "earnings"]);
			const cashFlowField = this.findFieldByTerm(row, ["cash flow", "cashflow", "cf"]);

			this.processedData.financialProjections.years.push(row[yearField]);
			this.processedData.financialProjections.revenues.push(row[revenueField] || 0);
			this.processedData.financialProjections.operationCosts.push(row[costField] || 0);
			this.processedData.financialProjections.ebitda.push(row[ebitdaField] || 0);
			this.processedData.financialProjections.profit.push(row[profitField] || 0);
			this.processedData.financialProjections.cashFlow.push(row[cashFlowField] || 0);
		});

		// Create some dummy project data if not available
		if (!this.processedData.projects || this.processedData.projects.length === 0) {
			this.createDummyProjectsFromFinancials();
		}
	}

	/**
	* Process mixed data (contains both project and financial data)
	* @private
	*/
	processMixedData() {
		// Split the data into project data and financial data
		const projectData = [];
		const financialData = [];

		this.data.forEach(row => {
			const hasProjectFields = this.findFieldByTerm(row, ["name", "project", "site"]);
			const hasFinancialFields = this.findFieldByTerm(row, ["year", "period"]);

			if (hasProjectFields) {
				projectData.push(row);
			} else if (hasFinancialFields) {
				financialData.push(row);
			}
		});

		// Process each data type separately
		if (projectData.length > 0) {
			this.data = projectData;
			this.processProjectsData();
		}

		if (financialData.length > 0) {
			this.data = financialData;
			this.processFinancialsData();
		}
	}

	/**
	* Create financial projections from project data
	* @private
	*/
	createFinancialProjectionsFromProjects() {
		const projects = this.processedData.projects;

		if (!projects || projects.length === 0) return;

		// Calculate total revenue, ebitda, etc.
		const totalRevenue = _.sumBy(projects, "revenue");
		const /* eslint-disable-next-line no-unused-vars */ totalEbitda = _.sumBy(projects, "ebitda");
		const /* eslint-disable-next-line no-unused-vars */ totalProfit = _.sumBy(projects, "profit");

		// Create simple yearly projections from 2024 to 2030
		const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
		const revenues = [0, totalRevenue * 0.16, totalRevenue, totalRevenue * 1.01, totalRevenue * 1.02, totalRevenue * 1.03, totalRevenue * 1.04];
		const operationCosts = revenues.map(rev => (rev ? rev * 0.09 : 0));
		const ebitda = revenues.map((rev, i) => rev - operationCosts[i]);
		const profit = ebitda.map(ebit => ebit * 0.62); // Approximate profit after tax and interest

		this.processedData.financialProjections = {
			years,
			revenues,
			operationCosts,
			ebitda,
			profit,
			cashFlow: profit.map((p, i) => (i <= 1 ? -totalRevenue * 0.3 * (i + 1) : p))
		};
	}

	/**
	* Create dummy project data from financial projections
	* @private
	*/
	createDummyProjectsFromFinancials() {
		const financials = this.processedData.financialProjections;

		if (!financials || !financials.years || financials.years.length === 0) return;

		// Get the peak year revenue
		const peakYearIndex = financials.revenues.indexOf(Math.max(...financials.revenues));
		const peakRevenue = financials.revenues[peakYearIndex] || 0;
		const peakEbitda = financials.ebitda[peakYearIndex] || 0;

		// Create dummy projects that would roughly add up to the peak revenue
		const projectTypes = ["Solar Ground", "On-shore Wind"];
		const countries = ["Romania", "Bulgaria", "N.Macedonia", "Serbia", "Greece"];

		const projects = [];
		let remainingRevenue = peakRevenue;
		let remainingEbitda = peakEbitda;

		// Create 5-8 projects
		const numProjects = Math.floor(Math.random() * 4) + 5;

		for (let i = 0; i < numProjects; i++) {
			const isLast = i === numProjects - 1;
			const projectRatio = isLast ? 1 : Math.random() * 0.3 + 0.05; // 5-35% of remaining

			const revenue = isLast ? remainingRevenue : Math.round(remainingRevenue * projectRatio);
			const ebitda = isLast ? remainingEbitda : Math.round(remainingEbitda * projectRatio);
			const profit = Math.round(ebitda * 0.62);

			const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
			const country = countries[Math.floor(Math.random() * countries.length)];

			// Generate random-ish but plausible values
			const capacity = Math.round(revenue * (Math.random() * 3 + 7)); // 7-10 MW per 1M EUR revenue
			const investmentCost = Math.round(capacity * (Math.random() * 0.3 + 0.7)); // 0.7-1M EUR per MW
			const equity = Math.round(investmentCost * 0.3); // 30% equity
			const yieldOnCost = Math.round((ebitda / investmentCost) * 100) / 100;
			const irr = Math.round(Math.random() * 5 + 25) / 100; // 25-30%
			const cashReturn = Math.round(investmentCost * 0.7);

			projects.push({
				name: `Project ${i + 1}`,
				type: projectType,
				country: country,
				status: "Planning",
				capacity: capacity,
				investmentCost: investmentCost,
				equity: equity,
				revenue: revenue,
				ebitda: ebitda,
				profit: profit,
				yieldOnCost: yieldOnCost,
				irr: irr,
				cashReturn: cashReturn,
				// Random coordinates within Europe
				location: [
					Math.random() * 10 + 15, // Longitude (roughly Eastern Europe)
					Math.random() * 10 + 39 // Latitude (roughly Eastern Europe)
				]
			});

			remainingRevenue -= revenue;
			remainingEbitda -= ebitda;
		}

		this.processedData.projects = projects;

		// Now calculate country totals
		this.processedData.countryTotals = _.chain(projects)
			.groupBy("country")
			.mapValues(projects => ({
				sites: projects.length,
				mw: _.sumBy(projects, "capacity"),
				investment: _.sumBy(projects, "investmentCost"),
				equity: _.sumBy(projects, "equity"),
				revenue: _.sumBy(projects, "revenue"),
				ebitda: _.sumBy(projects, "ebitda"),
				profit: _.sumBy(projects, "profit")
			}))
			.value();

		// And project types
		this.processedData.projectTypes = _.chain(projects)
			.groupBy("type")
			.mapValues(projects => ({
				count: projects.length,
				totalCapacity: _.sumBy(projects, "capacity"),
				averageIrr: _.meanBy(projects, "irr")
			}))
			.value();
	}

	/**
	* Normalize project data to a standard format
	* @private
	*/
	normalizeProjectData(row) {
		// Map common field variations to standard names
		return {
			name: row.name || row.project_name || row.project || row["project name"] || row.site || "Unknown",
			type: row.type || row.project_type || row["project type"] || row.technology || "Unknown",
			country: row.country || row.location || row.region || "Unknown",
			status: row.status || row.project_status || row["project status"] || "Planning",
			capacity: this.extractNumericValue(row, ["capacity", "capacity_mw", "mw", "power"]),
			investmentCost: this.extractNumericValue(row, ["investment", "investment_cost", "cost", "capex"]),
			equity: this.extractNumericValue(row, ["equity", "equity_required", "own capital"]),
			revenue: this.extractNumericValue(row, ["revenue", "annual_revenue", "income"]),
			ebitda: this.extractNumericValue(row, ["ebitda", "annual_ebitda"]),
			profit: this.extractNumericValue(row, ["profit", "annual_profit", "net income"]),
			yieldOnCost: this.extractNumericValue(row, ["yield", "yield_on_cost"]) / 100,
			irr: this.extractNumericValue(row, ["irr", "irr_percentage", "internal rate of return"]) / 100,
			cashReturn: this.extractNumericValue(row, ["cash return", "cash_return", "cash flow"]),
			// Try to extract location data if available
			location: row.location_lat && row.location_lng ? [parseFloat(row.location_lng), parseFloat(row.location_lat)] : this.getDefaultLocation(row.country || "Unknown")
		};
	}

	/**
	* Find a field in a row by term variations
	* @private
	*/
	findFieldByTerm(row, terms) {
		const keys = Object.keys(row);
		for (const term of terms) {
			const field = keys.find(key => key.toLowerCase().includes(term.toLowerCase()));
			if (field) return field;
		}
		return null;
	}

	/**
	* Extract a numeric value from a row by checking multiple possible field names
	* @private
	*/
	extractNumericValue(row, possibilities) {
		for (const field of possibilities) {
			const foundKey = Object.keys(row).find(key => key.toLowerCase().includes(field.toLowerCase()));

			if (foundKey && !isNaN(parseFloat(row[foundKey]))) {
				return parseFloat(row[foundKey]);
			}
		}
		return 0;
	}

	/**
	* Get default location coordinates for a country
	* @private
	*/
	getDefaultLocation(country) {
		const countryCoordinates = {
			Romania: [26.1025, 44.4268],
			"N.Macedonia": [21.7453, 41.6086],
			Bulgaria: [23.3219, 42.6977],
			Serbia: [20.4582, 44.7866],
			Greece: [23.7275, 37.9838]
		};

		return countryCoordinates[country] || [23.5, 42.5]; // Default to central Balkans
	}

	/**
	* Calculate additional metrics and KPIs from the processed data
	* @private
	*/
	calculateAdditionalMetrics() {
		const projects = this.processedData.projects;

		if (projects && projects.length > 0) {
			// Calculate portfolio totals
			this.processedData.kpis.totalCapacity = _.sumBy(projects, "capacity");
			this.processedData.kpis.totalInvestment = _.sumBy(projects, "investmentCost");
			this.processedData.kpis.totalEquity = _.sumBy(projects, "equity");
			this.processedData.kpis.averageIrr = _.meanBy(projects, "irr");
			this.processedData.kpis.averageYieldOnCost = _.meanBy(projects, "yieldOnCost");
			this.processedData.kpis.totalEbitda = _.sumBy(projects, "ebitda");

			// Calculate debt to equity ratio
			this.processedData.kpis.debtToEquityRatio = (this.processedData.kpis.totalInvestment - this.processedData.kpis.totalEquity) / this.processedData.kpis.totalEquity;
		}

		const financials = this.processedData.financialProjections;

		if (financials && financials.years && financials.years.length > 0) {
			// Calculate CAGR for revenue
			const firstNonZeroRevenueIndex = financials.revenues.findIndex(rev => rev > 0);
			const firstYearRevenue = financials.revenues[firstNonZeroRevenueIndex] || 0;
			const lastYearRevenue = financials.revenues[financials.revenues.length - 1] || 0;
			const years = financials.years.length - firstNonZeroRevenueIndex - 1 || 1;

			if (firstYearRevenue > 0) {
				this.processedData.kpis.revenueCagr = Math.pow(lastYearRevenue / firstYearRevenue, 1 / years) - 1;
			}

			// Calculate average EBITDA margin
			this.processedData.kpis.averageEbitdaMargin = _.mean(financials.ebitda.map((ebitda, i) => (financials.revenues[i] ? ebitda / financials.revenues[i] : 0)));
		}
	}
}
