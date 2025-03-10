import { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, ListItemIcon, Collapse, Divider, Alert, AlertTitle, useTheme } from "@mui/material";
import { Warning as WarningIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Info as InfoIcon } from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext";

// Validation rules
const VALIDATION_RULES = {
	REQUIRED: "required",
	TYPE: "type",
	RANGE: "range",
	FORMAT: "format",
	UNIQUE: "unique"
};

// Expected column types and validations
const COLUMN_VALIDATIONS = {
	name: {
		required: true,
		type: "string",
		unique: true
	},
	type: {
		required: true,
		type: "string",
		validValues: ["On-shore Wind", "Off-shore Wind", "Solar Ground", "Solar Rooftop", "Hydro", "Biomass", "Other"]
	},
	country: {
		required: true,
		type: "string"
	},
	status: {
		required: true,
		type: "string",
		validValues: ["Planning", "Construction", "Operational", "Decommissioned"]
	},
	capacity: {
		required: true,
		type: "number",
		min: 0
	},
	investmentCost: {
		required: true,
		type: "number",
		min: 0
	},
	equity: {
		required: true,
		type: "number",
		min: 0
	},
	revenue: {
		required: true,
		type: "number",
		min: 0
	},
	ebitda: {
		required: true,
		type: "number"
	},
	profit: {
		required: true,
		type: "number"
	},
	yieldOnCost: {
		required: true,
		type: "number",
		min: 0,
		max: 1
	},
	irr: {
		required: true,
		type: "number",
		min: 0,
		max: 1
	},
	cashReturn: {
		required: false,
		type: "number"
	},
	location: {
		required: false,
		type: "array",
		format: "coordinates"
	}
};

export default function DataValidation({ data, onValidated, isVisible }) {
	const { t } = useI18n();
	const [validationResults, setValidationResults] = useState(null);
	const [expandedCategories, setExpandedCategories] = useState({});
	const [expandedRows, setExpandedRows] = useState({});
	const [isValidating, setIsValidating] = useState(false);
	const [validationPassed, setValidationPassed] = useState(false);

	useEffect(() => {
		if (data && data.length > 0 && isVisible) {
			validateData();
		}
	}, [data, isVisible]);

	const validateData = () => {
		if (!data || data.length === 0) return;

		setIsValidating(true);

		// Give UI time to update before running the validation
		setTimeout(() => {
			try {
				const results = {
					errors: [],
					warnings: [],
					info: [],
					summary: {
						total: data.length,
						valid: 0,
						withErrors: 0,
						withWarnings: 0
					}
				};

				// Track rows with issues
				const rowsWithErrors = new Set();
				const rowsWithWarnings = new Set();

				// Validate each row
				data.forEach((row, rowIndex) => {
					const rowNum = rowIndex + 1; // 1-indexed for user display

					// Check for required fields
					Object.entries(COLUMN_VALIDATIONS).forEach(([column, validation]) => {
						const value = row[column];

						// Check required fields
						if (validation.required && (value === undefined || value === null || value === "")) {
							results.errors.push({
								row: rowNum,
								column,
								value,
								rule: VALIDATION_RULES.REQUIRED,
								message: `Required field "${column}" is missing in row ${rowNum}`
							});
							rowsWithErrors.add(rowNum);
						}

						// Skip further validation if value is not present
						if (value === undefined || value === null || value === "") return;

						// Type validation
						if (validation.type) {
							const actualType = Array.isArray(value) ? "array" : typeof value;
							if (actualType !== validation.type) {
								if (validation.type === "number" && !isNaN(Number(value))) {
									// It's a string that can be converted to number, just a warning
									results.warnings.push({
										row: rowNum,
										column,
										value,
										rule: VALIDATION_RULES.TYPE,
										message: `Field "${column}" in row ${rowNum} is a string but should be a number. It will be converted automatically.`
									});
									rowsWithWarnings.add(rowNum);
								} else {
									results.errors.push({
										row: rowNum,
										column,
										value,
										rule: VALIDATION_RULES.TYPE,
										message: `Field "${column}" in row ${rowNum} should be of type ${validation.type} but got ${actualType}`
									});
									rowsWithErrors.add(rowNum);
								}
							}
						}

						// Range validation for numbers
						if (validation.type === "number" && (validation.min !== undefined || validation.max !== undefined)) {
							const numValue = Number(value);
							if (!isNaN(numValue)) {
								if (validation.min !== undefined && numValue < validation.min) {
									results.errors.push({
										row: rowNum,
										column,
										value,
										rule: VALIDATION_RULES.RANGE,
										message: `Field "${column}" in row ${rowNum} should be at least ${validation.min}`
									});
									rowsWithErrors.add(rowNum);
								}

								if (validation.max !== undefined && numValue > validation.max) {
									results.errors.push({
										row: rowNum,
										column,
										value,
										rule: VALIDATION_RULES.RANGE,
										message: `Field "${column}" in row ${rowNum} should be at most ${validation.max}`
									});
									rowsWithErrors.add(rowNum);
								}
							}
						}

						// Valid values check
						if (validation.validValues && !validation.validValues.includes(value)) {
							results.errors.push({
								row: rowNum,
								column,
								value,
								rule: VALIDATION_RULES.FORMAT,
								message: `Field "${column}" in row ${rowNum} has invalid value "${value}". Valid values are: ${validation.validValues.join(", ")}`
							});
							rowsWithErrors.add(rowNum);
						}

						// Format validation
						if (validation.format === "coordinates" && Array.isArray(value)) {
							if (value.length !== 2 || typeof value[0] !== "number" || typeof value[1] !== "number") {
								results.errors.push({
									row: rowNum,
									column,
									value,
									rule: VALIDATION_RULES.FORMAT,
									message: `Field "${column}" in row ${rowNum} should be coordinates [longitude, latitude]`
								});
								rowsWithErrors.add(rowNum);
							}
						}
					});

					// Check for unexpected fields (info only)
					Object.keys(row).forEach(column => {
						if (!COLUMN_VALIDATIONS[column]) {
							results.info.push({
								row: rowNum,
								column,
								value: row[column],
								rule: "unknown",
								message: `Unknown field "${column}" in row ${rowNum} will be ignored`
							});
						}
					});
				});

				// Check for uniqueness where required
				Object.entries(COLUMN_VALIDATIONS).forEach(([column, validation]) => {
					if (validation.unique) {
						const values = new Map();
						data.forEach((row, rowIndex) => {
							const value = row[column];
							if (value !== undefined && value !== null && value !== "") {
								if (values.has(value)) {
									const rowNum = rowIndex + 1;
									const prevRowNum = values.get(value) + 1;
									results.errors.push({
										row: rowNum,
										column,
										value,
										rule: VALIDATION_RULES.UNIQUE,
										message: `Field "${column}" in row ${rowNum} has duplicate value "${value}" also in row ${prevRowNum}`
									});
									rowsWithErrors.add(rowNum);
								} else {
									values.set(value, rowIndex);
								}
							}
						});
					}
				});

				// Update summary
				results.summary.withErrors = rowsWithErrors.size;
				results.summary.withWarnings = rowsWithWarnings.size - rowsWithErrors.size; // Count only rows with warnings but no errors
				results.summary.valid = results.summary.total - results.summary.withErrors - results.summary.withWarnings;

				setValidationResults(results);
				setValidationPassed(results.errors.length === 0);

				if (results.errors.length === 0) {
					// If no errors, call the onValidated callback
					onValidated(true, results);
				}
			} catch (error) {
				/* eslint-disable-next-line no-console */
console.error("Validation error:", error);
				setValidationResults({
					errors: [
						{
							row: 0,
							column: "",
							rule: "system",
							message: `Validation failed: ${error.message}`
						}
					],
					warnings: [],
					info: [],
					summary: { total: data.length, valid: 0, withErrors: data.length, withWarnings: 0 }
				});
				setValidationPassed(false);
			} finally {
				setIsValidating(false);
			}
		}, 100);
	};

	const toggleCategory = category => {
		setExpandedCategories(prev => ({
			...prev,
			[category]: !prev[category]
		}));
	};

	const toggleRow = rowId => {
		setExpandedRows(prev => ({
			...prev,
			[rowId]: !prev[rowId]
		}));
	};

	const groupIssuesByRule = issues => {
		return issues.reduce((grouped, issue) => {
			if (!grouped[issue.rule]) {
				grouped[issue.rule] = [];
			}
			grouped[issue.rule].push(issue);
			return grouped;
		}, {});
	};

	const getIssueIcon = type => {
		switch (type) {
			case "error":
				return <CancelIcon className="text-red-500" />;
			case "warning":
				return <WarningIcon className="text-yellow-500" />;
			case "info":
				return <InfoIcon className="text-blue-500" />;
			default:
				return null;
		}
	};

	if (!isVisible) return null;

	if (isValidating) {
		return (
			<div className="flex flex-col items-center justify-center p-8">
				<div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
				<p className="mt-4 text-lg font-medium">{t("upload.validation")}</p>
			</div>
		);
	}

	if (!validationResults) return null;

	const { errors, warnings, info, summary } = validationResults;
	const hasIssues = errors.length > 0 || warnings.length > 0 || info.length > 0;

	const groupedErrors = groupIssuesByRule(errors);
	const groupedWarnings = groupIssuesByRule(warnings);
	const groupedInfo = groupIssuesByRule(info);

	return (
		<div className="p-4 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700">
			<div className="mb-4">
				<div className="flex items-center gap-2 mb-4">
					{validationPassed ? <CheckCircleIcon className="text-green-500" /> : <WarningIcon className="text-yellow-500" />}
					<h2 className="text-xl font-bold">Data Validation Results</h2>
				</div>

				<div className="grid grid-cols-4 gap-4 mb-4">
					<div className="p-3 bg-gray-50 rounded dark:bg-gray-800">
						<p className="text-sm text-gray-500 dark:text-gray-400">Total Rows</p>
						<p className="text-2xl font-bold">{summary.total}</p>
					</div>
					<div className="p-3 bg-green-50 rounded dark:bg-green-900/20">
						<p className="text-sm text-green-600 dark:text-green-400">Valid</p>
						<p className="text-2xl font-bold text-green-700 dark:text-green-400">{summary.valid}</p>
					</div>
					<div className="p-3 bg-red-50 rounded dark:bg-red-900/20">
						<p className="text-sm text-red-600 dark:text-red-400">With Errors</p>
						<p className="text-2xl font-bold text-red-700 dark:text-red-400">{summary.withErrors}</p>
					</div>
					<div className="p-3 bg-yellow-50 rounded dark:bg-yellow-900/20">
						<p className="text-sm text-yellow-600 dark:text-yellow-400">With Warnings</p>
						<p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{summary.withWarnings}</p>
					</div>
				</div>
			</div>

			{hasIssues && (
				<div className="border rounded-lg overflow-hidden">
					{/* Errors Section */}
					{errors.length > 0 && (
						<div className="border-b dark:border-gray-700">
							<button className="flex items-center justify-between w-full p-3 text-left bg-red-50 dark:bg-red-900/20" onClick={() => toggleCategory("errors")}>
								<div className="flex items-center gap-2">
									<CancelIcon className="text-red-500" />
									<span className="font-medium">Errors ({errors.length})</span>
								</div>
								{expandedCategories.errors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
							</button>

							{expandedCategories.errors && (
								<div className="p-3">
									{Object.entries(groupedErrors).map(([rule, issues]) => (
										<div key={rule} className="mb-4">
											<h4 className="mb-2 text-sm font-medium uppercase text-gray-500">{rule} Issues</h4>
											<ul className="space-y-2">
												{issues.map((issue, i) => (
													<li key={i} className="p-2 bg-gray-50 rounded dark:bg-gray-800">
														<button className="flex items-center justify-between w-full text-left" onClick={() => toggleRow(`error-${rule}-${i}`)}>
															<span className="text-sm truncate">{issue.message}</span>
															{expandedRows[`error-${rule}-${i}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
														</button>

														{expandedRows[`error-${rule}-${i}`] && (
															<div className="mt-2 p-2 bg-white rounded text-xs dark:bg-gray-700">
																<p>
																	<strong>Row:</strong> {issue.row}
																</p>
																<p>
																	<strong>Column:</strong> {issue.column}
																</p>
																<p>
																	<strong>Value:</strong> {JSON.stringify(issue.value)}
																</p>
															</div>
														)}
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Warnings Section */}
					{warnings.length > 0 && (
						<div className="border-b dark:border-gray-700">
							<button className="flex items-center justify-between w-full p-3 text-left bg-yellow-50 dark:bg-yellow-900/20" onClick={() => toggleCategory("warnings")}>
								<div className="flex items-center gap-2">
									<WarningIcon />
									<span className="font-medium">Warnings ({warnings.length})</span>
								</div>
								{expandedCategories.warnings ? <ExpandLessIcon /> : <ExpandMoreIcon />}
							</button>

							{expandedCategories.warnings && (
								<div className="p-3">
									{Object.entries(groupedWarnings).map(([rule, issues]) => (
										<div key={rule} className="mb-4">
											<h4 className="mb-2 text-sm font-medium uppercase text-gray-500">{rule} Issues</h4>
											<ul className="space-y-2">
												{issues.map((issue, i) => (
													<li key={i} className="p-2 bg-gray-50 rounded dark:bg-gray-800">
														<button className="flex items-center justify-between w-full text-left" onClick={() => toggleRow(`warning-${rule}-${i}`)}>
															<span className="text-sm truncate">{issue.message}</span>
															{expandedRows[`warning-${rule}-${i}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
														</button>

														{expandedRows[`warning-${rule}-${i}`] && (
															<div className="mt-2 p-2 bg-white rounded text-xs dark:bg-gray-700">
																<p>
																	<strong>Row:</strong> {issue.row}
																</p>
																<p>
																	<strong>Column:</strong> {issue.column}
																</p>
																<p>
																	<strong>Value:</strong> {JSON.stringify(issue.value)}
																</p>
															</div>
														)}
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Info Section */}
					{info.length > 0 && (
						<div>
							<button className="flex items-center justify-between w-full p-3 text-left bg-blue-50 dark:bg-blue-900/20" onClick={() => toggleCategory("info")}>
								<div className="flex items-center gap-2">
									<InfoIcon />
									<span className="font-medium">Information ({info.length})</span>
								</div>
								{expandedCategories.info ? <ExpandLessIcon /> : <ExpandMoreIcon />}
							</button>

							{expandedCategories.info && (
								<div className="p-3">
									{Object.entries(groupedInfo).map(([rule, issues]) => (
										<div key={rule} className="mb-4">
											<h4 className="mb-2 text-sm font-medium uppercase text-gray-500">{rule} Notes</h4>
											<ul className="space-y-2">
												{issues.map((issue, i) => (
													<li key={i} className="p-2 bg-gray-50 rounded dark:bg-gray-800">
														<button className="flex items-center justify-between w-full text-left" onClick={() => toggleRow(`info-${rule}-${i}`)}>
															<span className="text-sm truncate">{issue.message}</span>
															{expandedRows[`info-${rule}-${i}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
														</button>

														{expandedRows[`info-${rule}-${i}`] && (
															<div className="mt-2 p-2 bg-white rounded text-xs dark:bg-gray-700">
																<p>
																	<strong>Row:</strong> {issue.row}
																</p>
																<p>
																	<strong>Column:</strong> {issue.column}
																</p>
																<p>
																	<strong>Value:</strong> {JSON.stringify(issue.value)}
																</p>
															</div>
														)}
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			)}

			<div className="flex justify-end mt-4 gap-2">
				<Button variant="primary" onClick={() => onValidated(validationPassed, validationResults)} disabled={!validationPassed && errors.length > 0}>
					{validationPassed ? "Continue" : "Proceed with Warnings"}
				</Button>
			</div>
		</div>
	);
}
