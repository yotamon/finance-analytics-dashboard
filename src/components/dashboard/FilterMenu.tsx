import React, { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Radio,
  RadioGroup,
  TextField,
  Slider,
  Chip,
  Stack,
  useTheme,
  alpha,
  Tooltip,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  RestartAlt as ResetIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useI18n } from "../../context/I18nContext";
import { format } from "date-fns";

// Define filter option interfaces
interface CheckboxFilterOption {
  id: string;
  label: string;
  count?: number;
}

interface RangeFilterOption {
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
}

interface DateRangeFilter {
  startDate: Date | null;
  endDate: Date | null;
}

// Define filter groups and their options
interface FilterGroup {
  id: string;
  type: "checkbox" | "radio" | "range" | "dateRange" | "select";
  label: string;
  options?: CheckboxFilterOption[];
  rangeOptions?: RangeFilterOption;
  selectOptions?: string[];
}

// Define the filter values
interface FilterValues {
  checkboxes: Record<string, string[]>; // groupId -> selected option ids
  radios: Record<string, string>; // groupId -> selected option id
  ranges: Record<string, [number, number]>; // groupId -> [min, max]
  dateRanges: Record<string, DateRangeFilter>; // groupId -> { startDate, endDate }
  selects: Record<string, string>; // groupId -> selected option
}

// Define component props
interface FilterMenuProps {
  open: boolean;
  onClose: () => void;
  filterGroups?: FilterGroup[];
  onApplyFilters?: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
  position?: "left" | "right";
  width?: number | string;
  // New props matching what Dashboard passes
  onFilter?: (params: any) => void;
  filterParams?: any;
  onReset?: () => void;
}

export default function FilterMenu({
  open,
  onClose,
  filterGroups = [],
  onApplyFilters,
  initialFilters,
  position = "right",
  width = 320,
  // New props
  onFilter,
  filterParams,
  onReset,
}: FilterMenuProps) {
  const theme = useTheme();
  const { t } = useI18n();

  // Create filterGroups from filterParams if filterGroups is empty and filterParams exists
  const effectiveFilterGroups = React.useMemo(() => {
    if (filterGroups.length > 0) {
      return filterGroups;
    }

    // If filterParams exists, create filterGroups from it
    if (filterParams) {
      const groups: FilterGroup[] = [];

      // Example: Create a filter group for project type if it exists in filterParams
      if ("type" in filterParams) {
        groups.push({
          id: "type",
          type: "select",
          label: t("filters.type"),
          selectOptions: ["renewable", "commercial", "residential", "industrial"],
        });
      }

      // Example: Create a filter group for country if it exists in filterParams
      if ("country" in filterParams) {
        groups.push({
          id: "country",
          type: "select",
          label: t("filters.country"),
          selectOptions: ["USA", "UK", "Germany", "France", "Spain", "Italy"],
        });
      }

      // Example: Create a filter group for status if it exists in filterParams
      if ("status" in filterParams) {
        groups.push({
          id: "status",
          type: "select",
          label: t("filters.status"),
          selectOptions: ["operational", "development", "construction", "acquisition"],
        });
      }

      // Example: Create a range filter for capacity if min/max exist in filterParams
      if ("capacityMin" in filterParams || "capacityMax" in filterParams) {
        groups.push({
          id: "capacity",
          type: "range",
          label: t("filters.capacity"),
          rangeOptions: {
            min: 0,
            max: 1000,
            step: 10,
            format: (value) => `${value} MW`,
          },
        });
      }

      return groups;
    }

    return [];
  }, [filterGroups, filterParams, t]);

  // Initialize filter values with defaults or initial values
  const defaultValues: FilterValues = {
    checkboxes: {},
    radios: {},
    ranges: {},
    dateRanges: {},
    selects: {},
  };

  // Initialize default values from filterGroups
  effectiveFilterGroups.forEach((group) => {
    if (group.type === "checkbox") {
      defaultValues.checkboxes[group.id] = [];
    } else if (group.type === "radio") {
      defaultValues.radios[group.id] = "";
    } else if (group.type === "range" && group.rangeOptions) {
      defaultValues.ranges[group.id] = [group.rangeOptions.min, group.rangeOptions.max];
    } else if (group.type === "dateRange") {
      defaultValues.dateRanges[group.id] = {
        startDate: null,
        endDate: null,
      };
    } else if (group.type === "select") {
      defaultValues.selects[group.id] = "";
    }
  });

  // Apply filter params to default values if available
  if (filterParams) {
    // Handle type, country, status params
    ["type", "country", "status"].forEach((param) => {
      if (param in filterParams && filterParams[param]) {
        defaultValues.selects[param] = filterParams[param];
      }
    });

    // Handle capacity range
    if (
      ("capacityMin" in filterParams || "capacityMax" in filterParams) &&
      effectiveFilterGroups.some((g) => g.id === "capacity")
    ) {
      const min = "capacityMin" in filterParams ? Number(filterParams.capacityMin) : 0;
      const max = "capacityMax" in filterParams ? Number(filterParams.capacityMax) : 1000;
      defaultValues.ranges["capacity"] = [min, max];
    }
  }

  // Override with any initialFilters
  if (initialFilters) {
    Object.entries(initialFilters.checkboxes).forEach(([id, values]) => {
      defaultValues.checkboxes[id] = [...values];
    });
    Object.entries(initialFilters.radios).forEach(([id, value]) => {
      defaultValues.radios[id] = value;
    });
    Object.entries(initialFilters.ranges).forEach(([id, range]) => {
      defaultValues.ranges[id] = [...range];
    });
    Object.entries(initialFilters.dateRanges).forEach(([id, dateRange]) => {
      defaultValues.dateRanges[id] = { ...dateRange };
    });
    Object.entries(initialFilters.selects).forEach(([id, value]) => {
      defaultValues.selects[id] = value;
    });
  }

  const [filterValues, setFilterValues] = useState<FilterValues>(defaultValues);

  // Counter for active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;

    // Count checkbox filters
    Object.values(filterValues.checkboxes).forEach((selected) => {
      count += selected.length;
    });

    // Count radio filters
    Object.values(filterValues.radios).forEach((value) => {
      if (value) count += 1;
    });

    // Count range filters
    Object.entries(filterValues.ranges).forEach(([groupId, range]) => {
      const group = effectiveFilterGroups.find((g) => g.id === groupId);
      if (group?.rangeOptions) {
        const { min, max } = group.rangeOptions;
        if (range[0] > min || range[1] < max) count += 1;
      }
    });

    // Count date range filters
    Object.values(filterValues.dateRanges).forEach((dateRange) => {
      if (dateRange.startDate || dateRange.endDate) count += 1;
    });

    // Count select filters
    Object.values(filterValues.selects).forEach((value) => {
      if (value) count += 1;
    });

    return count;
  }, [filterValues, effectiveFilterGroups]);

  // Handle checkbox change
  const handleCheckboxChange = (groupId: string, optionId: string) => {
    setFilterValues((prev) => {
      const currentSelected = prev.checkboxes[groupId] || [];
      let newSelected: string[];

      if (currentSelected.includes(optionId)) {
        newSelected = currentSelected.filter((id) => id !== optionId);
      } else {
        newSelected = [...currentSelected, optionId];
      }

      return {
        ...prev,
        checkboxes: {
          ...prev.checkboxes,
          [groupId]: newSelected,
        },
      };
    });
  };

  // Handle radio change
  const handleRadioChange = (groupId: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      radios: {
        ...prev.radios,
        [groupId]: value,
      },
    }));
  };

  // Handle range change
  const handleRangeChange = (groupId: string, newValue: [number, number]) => {
    setFilterValues((prev) => ({
      ...prev,
      ranges: {
        ...prev.ranges,
        [groupId]: newValue,
      },
    }));
  };

  // Handle date range change
  const handleDateRangeChange = (
    groupId: string,
    type: "startDate" | "endDate",
    date: Date | null
  ) => {
    setFilterValues((prev) => {
      const currentDateRange = prev.dateRanges[groupId] || { startDate: null, endDate: null };

      return {
        ...prev,
        dateRanges: {
          ...prev.dateRanges,
          [groupId]: {
            ...currentDateRange,
            [type]: date,
          },
        },
      };
    });
  };

  // Handle select change
  const handleSelectChange = (groupId: string, event: SelectChangeEvent<string>) => {
    setFilterValues((prev) => ({
      ...prev,
      selects: {
        ...prev.selects,
        [groupId]: event.target.value,
      },
    }));
  };

  // Apply filters and close the menu
  const handleApplyFilters = () => {
    // Call either onApplyFilters or onFilter, depending on which one is provided
    if (onApplyFilters) {
      onApplyFilters(filterValues);
    } else if (onFilter) {
      // Convert filterValues to the format expected by onFilter
      const params: any = {};

      // Process checkbox filters
      Object.entries(filterValues.checkboxes).forEach(([groupId, selectedIds]) => {
        if (selectedIds.length > 0) {
          params[groupId] = selectedIds.join(",");
        }
      });

      // Process radio filters
      Object.entries(filterValues.radios).forEach(([groupId, selectedId]) => {
        if (selectedId) {
          params[groupId] = selectedId;
        }
      });

      // Process range filters
      Object.entries(filterValues.ranges).forEach(([groupId, [min, max]]) => {
        params[`${groupId}Min`] = min;
        params[`${groupId}Max`] = max;
      });

      // Process date range filters
      Object.entries(filterValues.dateRanges).forEach(([groupId, { startDate, endDate }]) => {
        if (startDate) params[`${groupId}Start`] = startDate.toISOString();
        if (endDate) params[`${groupId}End`] = endDate.toISOString();
      });

      // Process select filters
      Object.entries(filterValues.selects).forEach(([groupId, value]) => {
        if (value) {
          params[groupId] = value;
        }
      });

      onFilter(params);
    }

    onClose();
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilterValues(defaultValues);

    // Call onReset if provided
    if (onReset) {
      onReset();
      onClose();
    }
  };

  // Format the values for display in filter chips
  const formatFilterValue = (groupId: string, type: FilterGroup["type"], value: any): string => {
    const group = effectiveFilterGroups.find((g) => g.id === groupId);
    if (!group) return "";

    switch (type) {
      case "checkbox": {
        const selectedCount = (value as string[]).length;
        if (selectedCount === 0) return "";
        if (selectedCount === 1) {
          const option = group.options?.find((opt) => opt.id === value[0]);
          return option?.label || "";
        }
        return `${selectedCount} ${t("common.selected")}`;
      }
      case "radio": {
        const option = group.options?.find((opt) => opt.id === value);
        return option?.label || "";
      }
      case "range": {
        const range = value as [number, number];
        const { format } = group.rangeOptions || {};
        if (format) {
          return `${format(range[0])} - ${format(range[1])}`;
        }
        return `${range[0]} - ${range[1]}`;
      }
      case "dateRange": {
        const dateRange = value as DateRangeFilter;
        const formatDate = (date: Date | null) => (date ? format(date, "PP") : "");

        if (dateRange.startDate && dateRange.endDate) {
          return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
        }
        if (dateRange.startDate) {
          return `${t("common.from")} ${formatDate(dateRange.startDate)}`;
        }
        if (dateRange.endDate) {
          return `${t("common.until")} ${formatDate(dateRange.endDate)}`;
        }
        return "";
      }
      case "select": {
        if (!value) return "";
        const option = group.selectOptions?.find((opt) => opt === value);
        return option || "";
      }
      default:
        return "";
    }
  };

  return (
    <Drawer
      anchor={position}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: width,
          p: 0,
          borderTopLeftRadius: position === "right" ? theme.shape.borderRadius : 0,
          borderBottomLeftRadius: position === "right" ? theme.shape.borderRadius : 0,
          borderTopRightRadius: position === "left" ? theme.shape.borderRadius : 0,
          borderBottomRightRadius: position === "left" ? theme.shape.borderRadius : 0,
          overflowX: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FilterIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="h6">{t("filters.title")}</Typography>
          {activeFilterCount > 0 && (
            <Chip
              size="small"
              label={activeFilterCount}
              color="primary"
              sx={{ ml: 1, fontWeight: 600, minWidth: 28 }}
            />
          )}
        </Box>
        <Box>
          <Tooltip title={t("common.close")}>
            <IconButton size="small" onClick={onClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filter content */}
      <Box
        sx={{
          maxHeight: "calc(100vh - 170px)",
          overflowY: "auto",
          p: 2,
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          },
        }}
      >
        {effectiveFilterGroups.map((group) => (
          <Box key={group.id} sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {group.label}

              {/* Show active filter count per group */}
              {(() => {
                let activeCount = 0;
                switch (group.type) {
                  case "checkbox":
                    activeCount = (filterValues.checkboxes[group.id] || []).length;
                    break;
                  case "radio":
                    activeCount = filterValues.radios[group.id] ? 1 : 0;
                    break;
                  case "range": {
                    const range = filterValues.ranges[group.id];
                    if (range && group.rangeOptions) {
                      if (range[0] > group.rangeOptions.min || range[1] < group.rangeOptions.max) {
                        activeCount = 1;
                      }
                    }
                    break;
                  }
                  case "dateRange": {
                    const dateRange = filterValues.dateRanges[group.id];
                    if (dateRange && (dateRange.startDate || dateRange.endDate)) {
                      activeCount = 1;
                    }
                    break;
                  }
                  case "select":
                    activeCount = filterValues.selects[group.id] ? 1 : 0;
                    break;
                }

                if (activeCount > 0) {
                  return (
                    <Chip
                      size="small"
                      label={activeCount}
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 1, height: 20, fontSize: "0.75rem" }}
                    />
                  );
                }
                return null;
              })()}
            </Typography>

            {group.type === "checkbox" && group.options && (
              <FormGroup>
                {group.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={(filterValues.checkboxes[group.id] || []).includes(option.id)}
                        onChange={() => handleCheckboxChange(group.id, option.id)}
                        color="primary"
                      />
                    }
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        {option.label}
                        {option.count !== undefined && (
                          <Typography variant="caption" color="text.secondary">
                            {option.count}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ width: "100%", ml: 0 }}
                  />
                ))}
              </FormGroup>
            )}

            {group.type === "radio" && group.options && (
              <RadioGroup
                value={filterValues.radios[group.id] || ""}
                onChange={(e) => handleRadioChange(group.id, e.target.value)}
              >
                {group.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio size="small" color="primary" />}
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        {option.label}
                        {option.count !== undefined && (
                          <Typography variant="caption" color="text.secondary">
                            {option.count}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ width: "100%", ml: 0 }}
                  />
                ))}
              </RadioGroup>
            )}

            {group.type === "range" && group.rangeOptions && (
              <Box sx={{ px: 1, pt: 2 }}>
                <Slider
                  value={
                    filterValues.ranges[group.id] || [
                      group.rangeOptions.min,
                      group.rangeOptions.max,
                    ]
                  }
                  onChange={(_, newValue) =>
                    handleRangeChange(group.id, newValue as [number, number])
                  }
                  valueLabelDisplay="auto"
                  min={group.rangeOptions.min}
                  max={group.rangeOptions.max}
                  step={group.rangeOptions.step || 1}
                  valueLabelFormat={group.rangeOptions.format || ((value) => `${value}`)}
                  color="primary"
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {group.rangeOptions.format
                      ? group.rangeOptions.format(
                          (filterValues.ranges[group.id] || [group.rangeOptions.min, 0])[0]
                        )
                      : (filterValues.ranges[group.id] || [group.rangeOptions.min, 0])[0]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.rangeOptions.format
                      ? group.rangeOptions.format(
                          (filterValues.ranges[group.id] || [0, group.rangeOptions.max])[1]
                        )
                      : (filterValues.ranges[group.id] || [0, group.rangeOptions.max])[1]}
                  </Typography>
                </Box>
              </Box>
            )}

            {group.type === "dateRange" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <DatePicker<Date>
                  label={t("filters.startDate")}
                  value={filterValues.dateRanges[group.id]?.startDate || null}
                  onChange={(newDate: Date | null) =>
                    handleDateRangeChange(group.id, "startDate", newDate)
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
                <DatePicker<Date>
                  label={t("filters.endDate")}
                  value={filterValues.dateRanges[group.id]?.endDate || null}
                  onChange={(newDate: Date | null) =>
                    handleDateRangeChange(group.id, "endDate", newDate)
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </Box>
            )}

            {group.type === "select" && group.selectOptions && (
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel id={`${group.id}-label`}>{group.label}</InputLabel>
                <Select
                  labelId={`${group.id}-label`}
                  id={group.id}
                  value={filterValues.selects[group.id] || ""}
                  label={group.label}
                  onChange={(e) => handleSelectChange(group.id, e)}
                >
                  <MenuItem value="">
                    <em>{t("common.all")}</em>
                  </MenuItem>
                  {group.selectOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </Box>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            {t("filters.activeFilters")}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            {/* Render active filter chips */}
            {Object.entries(filterValues.checkboxes).map(([groupId, selectedIds]) => {
              if (selectedIds.length === 0) return null;
              const group = effectiveFilterGroups.find((g) => g.id === groupId);
              if (!group) return null;

              return (
                <Chip
                  key={`checkbox-${groupId}`}
                  size="small"
                  label={`${group.label}: ${formatFilterValue(groupId, "checkbox", selectedIds)}`}
                  onDelete={() =>
                    setFilterValues((prev) => ({
                      ...prev,
                      checkboxes: { ...prev.checkboxes, [groupId]: [] },
                    }))
                  }
                  color="primary"
                  variant="outlined"
                />
              );
            })}

            {Object.entries(filterValues.radios).map(([groupId, selectedId]) => {
              if (!selectedId) return null;
              const group = effectiveFilterGroups.find((g) => g.id === groupId);
              if (!group) return null;

              return (
                <Chip
                  key={`radio-${groupId}`}
                  size="small"
                  label={`${group.label}: ${formatFilterValue(groupId, "radio", selectedId)}`}
                  onDelete={() =>
                    setFilterValues((prev) => ({
                      ...prev,
                      radios: { ...prev.radios, [groupId]: "" },
                    }))
                  }
                  color="primary"
                  variant="outlined"
                />
              );
            })}

            {Object.entries(filterValues.ranges).map(([groupId, range]) => {
              const group = effectiveFilterGroups.find((g) => g.id === groupId);
              if (!group || !group.rangeOptions) return null;

              const { min, max } = group.rangeOptions;
              if (range[0] === min && range[1] === max) return null;

              return (
                <Chip
                  key={`range-${groupId}`}
                  size="small"
                  label={`${group.label}: ${formatFilterValue(groupId, "range", range)}`}
                  onDelete={() =>
                    setFilterValues((prev) => ({
                      ...prev,
                      ranges: {
                        ...prev.ranges,
                        [groupId]: [min, max],
                      },
                    }))
                  }
                  color="primary"
                  variant="outlined"
                />
              );
            })}

            {Object.entries(filterValues.dateRanges).map(([groupId, dateRange]) => {
              if (!dateRange.startDate && !dateRange.endDate) return null;
              const group = effectiveFilterGroups.find((g) => g.id === groupId);
              if (!group) return null;

              return (
                <Chip
                  key={`dateRange-${groupId}`}
                  size="small"
                  label={`${group.label}: ${formatFilterValue(groupId, "dateRange", dateRange)}`}
                  onDelete={() =>
                    setFilterValues((prev) => ({
                      ...prev,
                      dateRanges: {
                        ...prev.dateRanges,
                        [groupId]: { startDate: null, endDate: null },
                      },
                    }))
                  }
                  color="primary"
                  variant="outlined"
                />
              );
            })}

            {Object.entries(filterValues.selects).map(([groupId, value]) => {
              if (!value) return null;
              const group = effectiveFilterGroups.find((g) => g.id === groupId);
              if (!group) return null;

              return (
                <Chip
                  key={`select-${groupId}`}
                  size="small"
                  label={`${group.label}: ${formatFilterValue(groupId, "select", value)}`}
                  onDelete={() =>
                    setFilterValues((prev) => ({
                      ...prev,
                      selects: { ...prev.selects, [groupId]: "" },
                    }))
                  }
                  color="primary"
                  variant="outlined"
                />
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Footer with action buttons */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${theme.palette.divider}`,
          boxShadow: `0 -2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ResetIcon />}
          onClick={handleResetFilters}
          disabled={activeFilterCount === 0}
        >
          {t("filters.reset")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckIcon />}
          onClick={handleApplyFilters}
          disableElevation
        >
          {t("filters.apply")} {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </Box>
    </Drawer>
  );
}
