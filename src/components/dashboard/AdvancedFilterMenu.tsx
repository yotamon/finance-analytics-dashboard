import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Filter, X, Check, ChevronDown, Save, RefreshCw } from "lucide-react";
import { useData } from "../../context/DataContext";
import { useI18n } from "../../context/I18nContext";
import Button from "../ui/Button";

const FILTER_OPERATORS = {
  string: ["equals", "contains", "starts with", "ends with", "is empty", "is not empty"],
  number: [
    "equals",
    "not equals",
    "greater than",
    "less than",
    "between",
    "is empty",
    "is not empty",
  ],
  date: ["equals", "not equals", "after", "before", "between", "is empty", "is not empty"],
  boolean: ["is true", "is false"],
};

const COLUMN_TYPES = {
  STRING: "string",
  NUMBER: "number",
  DATE: "date",
  BOOLEAN: "boolean",
};

function FieldFilter({ field, fieldType, onChange, onRemove, value, index }) {
  const { t } = useI18n();
  const [operator, setOperator] = useState(value?.operator || FILTER_OPERATORS[fieldType][0]);
  const [filterValue, setFilterValue] = useState(value?.value || "");
  const [secondValue, setSecondValue] = useState(value?.secondValue || "");
  const [isOpen, setIsOpen] = useState(false);

  const operators = FILTER_OPERATORS[fieldType] || FILTER_OPERATORS.string;

  useEffect(() => {
    onChange(
      {
        field,
        operator,
        value: filterValue,
        secondValue,
        type: fieldType,
      },
      index
    );
  }, [field, operator, filterValue, secondValue, onChange, index, fieldType]);

  const renderValueInput = () => {
    if (["is empty", "is not empty", "is true", "is false"].includes(operator)) {
      return null;
    }

    if (fieldType === COLUMN_TYPES.NUMBER) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="h-8 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder={t("action.filter") + "..."}
          />
          {operator === "between" && (
            <>
              <span className="text-sm">and</span>
              <input
                type="number"
                className="h-8 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                value={secondValue}
                onChange={(e) => setSecondValue(e.target.value)}
                placeholder={t("action.filter") + "..."}
              />
            </>
          )}
        </div>
      );
    }

    if (fieldType === COLUMN_TYPES.DATE) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="h-8 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          {operator === "between" && (
            <>
              <span className="text-sm">and</span>
              <input
                type="date"
                className="h-8 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={secondValue}
                onChange={(e) => setSecondValue(e.target.value)}
              />
            </>
          )}
        </div>
      );
    }

    // Default string input
    return (
      <input
        type="text"
        className="h-8 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        placeholder={t("action.filter") + "..."}
      />
    );
  };

  return (
    <div className="flex flex-col w-full p-2 mb-2 bg-white border rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center truncate">
          <span className="font-medium text-sm truncate">{field}</span>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Remove filter"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full h-8 px-2 text-sm text-left border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span>{operator}</span>
            <ChevronDown size={14} />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
              {operators.map((op) => (
                <button
                  key={op}
                  onClick={() => {
                    setOperator(op);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-1 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {op === operator && <Check size={14} className="mr-2 text-blue-500" />}
                  <span className={op === operator ? "ml-4" : "ml-6"}>{op}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {renderValueInput()}
      </div>
    </div>
  );
}

FieldFilter.propTypes = {
  field: PropTypes.string.isRequired,
  fieldType: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  value: PropTypes.shape({
    operator: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    secondValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  }).isRequired,
  index: PropTypes.number.isRequired,
};

export default function AdvancedFilterMenu({ isVisible, onClose }) {
  const { t } = useI18n();
  const { data, setFilteredData, columnTypeMappings } = useData();
  const [showMenu, setShowMenu] = useState(isVisible);
  const [filters, setFilters] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedField, setSelectedField] = useState("");

  // Replace the determineColumnType function with a memoized version
  // Function to determine the column type based on data
  const determineColumnType = useMemo(() => {
    return (columnName) => {
      if (columnTypeMappings && columnTypeMappings[columnName]) {
        return columnTypeMappings[columnName];
      }

      // If no mapping exists, try to determine based on the first non-null value
      if (data && data.length > 0) {
        const sample = data.find(
          (item) => item[columnName] !== null && item[columnName] !== undefined
        );
        if (sample) {
          const value = sample[columnName];
          if (typeof value === "number") return COLUMN_TYPES.NUMBER;
          if (typeof value === "boolean") return COLUMN_TYPES.BOOLEAN;
          if (value instanceof Date || (typeof value === "string" && !isNaN(Date.parse(value)))) {
            return COLUMN_TYPES.DATE;
          }
        }
      }

      return COLUMN_TYPES.STRING;
    };
  }, [data, columnTypeMappings]);

  // Update the useEffect to remove determineColumnType from dependencies since it's now memoized
  useEffect(() => {
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]).map((col) => ({
        name: col,
        type: determineColumnType(col),
      }));
      setAvailableColumns(columns);
      if (columns.length > 0 && !selectedField) {
        setSelectedField(columns[0].name);
      }
    }
  }, [data, selectedField, determineColumnType]);

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedFilters");
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        /* eslint-disable-next-line no-console */
        console.error("Error loading saved filters", e);
      }
    }
  }, []);

  // Update visibility when prop changes
  useEffect(() => {
    setShowMenu(isVisible);
  }, [isVisible]);

  // Handle filter change
  const handleFilterChange = (filterData, index) => {
    const newFilters = [...filters];
    newFilters[index] = filterData;
    setFilters(newFilters);
  };

  // Add a new filter
  const addFilter = () => {
    if (!selectedField) return;

    const fieldType =
      availableColumns.find((c) => c.name === selectedField)?.type || COLUMN_TYPES.STRING;

    setFilters([
      ...filters,
      {
        field: selectedField,
        operator: FILTER_OPERATORS[fieldType][0],
        value: "",
        secondValue: "",
        type: fieldType,
      },
    ]);
  };

  // Remove a filter
  const removeFilter = (index) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
  };

  // Apply the filters to the data
  const applyFilters = () => {
    if (!data || filters.length === 0) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) => {
      return filters.every((filter) => {
        const { field, operator, value, secondValue, type } = filter;
        const itemValue = item[field];

        if (operator === "is empty") {
          return itemValue === null || itemValue === undefined || itemValue === "";
        }

        if (operator === "is not empty") {
          return itemValue !== null && itemValue !== undefined && itemValue !== "";
        }

        if (type === COLUMN_TYPES.BOOLEAN) {
          if (operator === "is true") return Boolean(itemValue) === true;
          if (operator === "is false") return Boolean(itemValue) === false;
        }

        if (itemValue === null || itemValue === undefined) return false;

        if (type === COLUMN_TYPES.NUMBER) {
          const numValue = Number(value);
          const numSecondValue = Number(secondValue);
          const numItemValue = Number(itemValue);

          if (operator === "equals") return numItemValue === numValue;
          if (operator === "not equals") return numItemValue !== numValue;
          if (operator === "greater than") return numItemValue > numValue;
          if (operator === "less than") return numItemValue < numValue;
          if (operator === "between")
            return numItemValue >= numValue && numItemValue <= numSecondValue;
        }

        if (type === COLUMN_TYPES.DATE) {
          const dateValue = new Date(value);
          const dateSecondValue = new Date(secondValue);
          const dateItemValue = new Date(itemValue);

          if (operator === "equals") {
            return dateItemValue.setHours(0, 0, 0, 0) === dateValue.setHours(0, 0, 0, 0);
          }
          if (operator === "not equals") {
            return dateItemValue.setHours(0, 0, 0, 0) !== dateValue.setHours(0, 0, 0, 0);
          }
          if (operator === "after") return dateItemValue > dateValue;
          if (operator === "before") return dateItemValue < dateValue;
          if (operator === "between")
            return dateItemValue >= dateValue && dateItemValue <= dateSecondValue;
        }

        // String operations
        const strItemValue = String(itemValue).toLowerCase();
        const strValue = String(value).toLowerCase();

        if (operator === "equals") return strItemValue === strValue;
        if (operator === "contains") return strItemValue.includes(strValue);
        if (operator === "starts with") return strItemValue.startsWith(strValue);
        if (operator === "ends with") return strItemValue.endsWith(strValue);

        return false;
      });
    });

    setFilteredData(filtered);
    onClose();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters([]);
    setFilteredData(data);
  };

  // Save current filters
  const saveFilter = () => {
    if (!filterName || filters.length === 0) return;

    const newSavedFilter = {
      name: filterName,
      filters: [...filters],
      created: new Date().toISOString(),
    };

    const newSavedFilters = [...savedFilters, newSavedFilter];
    setSavedFilters(newSavedFilters);
    localStorage.setItem("savedFilters", JSON.stringify(newSavedFilters));
    setFilterName("");
  };

  // Load a saved filter
  const loadSavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
  };

  // Remove a saved filter
  const removeSavedFilter = (index) => {
    const newSavedFilters = savedFilters.filter((_, i) => i !== index);
    setSavedFilters(newSavedFilters);
    localStorage.setItem("savedFilters", JSON.stringify(newSavedFilters));
  };

  if (!showMenu) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl h-auto mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-900">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center">
            <Filter size={18} className="mr-2" />
            {t("action.filter")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Field selection and add filter button */}
          <div className="flex items-center mb-4 space-x-2">
            <div className="flex-1">
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700"
              >
                {availableColumns.map((column) => (
                  <option key={column.name} value={column.name}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={addFilter} variant="primary" className="whitespace-nowrap">
              Add Filter
            </Button>
          </div>

          {/* Active filters */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Filters ({filters.length})
            </h3>

            {filters.length === 0 ? (
              <p className="p-3 text-center text-sm text-gray-500 bg-gray-50 rounded-md dark:bg-gray-800 dark:text-gray-400">
                No filters applied. Add a filter to start filtering your data.
              </p>
            ) : (
              <div className="space-y-2">
                {filters.map((filter, index) => (
                  <FieldFilter
                    key={index}
                    field={filter.field}
                    fieldType={filter.type}
                    onChange={handleFilterChange}
                    onRemove={() => removeFilter(index)}
                    value={filter}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Save filter section */}
          <div className="p-3 mb-4 border border-gray-200 rounded-md dark:border-gray-700">
            <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Save Current Filter
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Enter filter name"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              />
              <Button
                onClick={saveFilter}
                variant="secondary"
                disabled={!filterName || filters.length === 0}
                className="whitespace-nowrap"
              >
                <Save size={16} className="mr-1" />
                Save
              </Button>
            </div>
          </div>

          {/* Saved filters */}
          {savedFilters.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Saved Filters
              </h3>
              <div className="divide-y divide-gray-200 border border-gray-200 rounded-md dark:divide-gray-700 dark:border-gray-700">
                {savedFilters.map((savedFilter, index) => (
                  <div key={index} className="flex items-center justify-between p-3">
                    <div>
                      <div className="font-medium">{savedFilter.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(savedFilter.created).toLocaleDateString()} ·
                        {savedFilter.filters.length}{" "}
                        {savedFilter.filters.length === 1 ? "filter" : "filters"}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadSavedFilter(savedFilter)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Load filter"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={() => removeSavedFilter(index)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete filter"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-4 border-t dark:border-gray-700">
          <div className="space-x-2">
            <Button onClick={resetFilters} variant="danger" outlined>
              Reset
            </Button>
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={applyFilters} variant="primary">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

AdvancedFilterMenu.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.array,
  onFilter: PropTypes.func,
  columnTypeMappings: PropTypes.object,
};
