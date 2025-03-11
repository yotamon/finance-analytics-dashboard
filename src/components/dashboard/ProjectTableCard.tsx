import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TablePagination,
  TextField,
  InputAdornment,
  Tooltip,
  TableSortLabel,
  alpha,
  useTheme,
  CircularProgress,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as DownloadIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext";
import { visuallyHidden } from "@mui/utils";
import { safeCurrencyFormat, ensureArray } from "../../utils/data-validation";

// Define TypeScript interfaces for the component props and state
interface Project {
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

interface ProjectTableCardProps {
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
  inDashboard?: boolean;
  noCard?: boolean;
}

type Order = "asc" | "desc";
type OrderBy = keyof Project | "";

interface HeadCell {
  id: keyof Project;
  label: string;
  numeric: boolean;
  format?: (value: any) => string | React.ReactNode;
  width?: string | number;
}

// Define the component
export default function ProjectTableCard({
  data = [],
  title = "Projects Overview",
  showFilters = true,
  maxHeight = 400,
  onProjectClick,
  loading = false,
  filterOptions = {},
  inDashboard = false,
  noCard = false,
}: ProjectTableCardProps) {
  const { t } = useI18n();
  const theme = useTheme();

  // State for the table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderBy>("value");

  // State for filters
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [managerFilter, setManagerFilter] = useState<string>("");

  // Ensure data is always an array
  const safeData = ensureArray(data);

  // Define the table headers with appropriate formats
  const headCells: HeadCell[] = useMemo(
    () => [
      {
        id: "name",
        numeric: false,
        label: t("projects.name"),
        width: "25%",
      },
      {
        id: "type",
        numeric: false,
        label: t("projects.type"),
        width: "15%",
      },
      {
        id: "location",
        numeric: false,
        label: t("projects.location"),
        width: "15%",
      },
      {
        id: "value",
        numeric: true,
        label: t("projects.value"),
        format: (value) => safeCurrencyFormat(value),
        width: "15%",
      },
      {
        id: "status",
        numeric: false,
        label: t("projects.status"),
        format: (value) => {
          let color = "";
          switch (value?.toLowerCase()) {
            case "active":
              color = theme.palette.success.main;
              break;
            case "pending":
              color = theme.palette.warning.main;
              break;
            case "completed":
              color = theme.palette.info.main;
              break;
            case "on hold":
              color = theme.palette.error.main;
              break;
            default:
              color = theme.palette.grey[500];
          }
          return (
            <Chip
              label={value}
              size="small"
              sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                fontWeight: "medium",
                "& .MuiChip-label": { px: 1 },
              }}
            />
          );
        },
        width: "15%",
      },
      {
        id: "completion",
        numeric: true,
        label: t("projects.completion"),
        format: (value) => {
          // Ensure value is a number and within the valid range (0-100)
          const safeValue =
            typeof value === "number" && !isNaN(value) ? Math.max(0, Math.min(100, value)) : 0;

          return (
            <Box sx={{ position: "relative", pt: 0.5, width: "100%" }}>
              <LinearProgress
                variant="determinate"
                value={safeValue}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    backgroundColor:
                      safeValue < 30
                        ? theme.palette.error.main
                        : safeValue < 70
                        ? theme.palette.warning.main
                        : theme.palette.success.main,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  color: "text.secondary",
                }}
              >
                {safeValue}%
              </Typography>
            </Box>
          );
        },
        width: "15%",
      },
    ],
    [t, theme]
  );

  // Handle filter change events
  const handleCountryFilterChange = (event: SelectChangeEvent<string>) => {
    setCountryFilter(event.target.value);
    setPage(0); // Reset to first page on filter change
  };

  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleManagerFilterChange = (event: SelectChangeEvent<string>) => {
    setManagerFilter(event.target.value);
    setPage(0);
  };

  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sorting
  const handleRequestSort = (property: keyof Project) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Function to create the sort handler for a column
  const createSortHandler = (property: keyof Project) => () => {
    handleRequestSort(property);
  };

  // Filter and sort the data
  const filteredAndSortedData = useMemo(() => {
    // Apply filters first
    let filteredData = safeData.filter((project) => {
      // Apply search query
      if (
        searchQuery &&
        !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !project.type.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !project.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !project.status.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Apply country filter
      if (countryFilter && project.country !== countryFilter) {
        return false;
      }

      // Apply type filter
      if (typeFilter && project.type !== typeFilter) {
        return false;
      }

      // Apply status filter
      if (statusFilter && project.status !== statusFilter) {
        return false;
      }

      // Apply manager filter
      if (managerFilter && project.manager !== managerFilter) {
        return false;
      }

      return true;
    });

    // Then sort
    if (orderBy) {
      filteredData.sort((a, b) => {
        const valueA = a[orderBy];
        const valueB = b[orderBy];

        // Determine if numeric comparison should be used
        const isNumeric = !isNaN(Number(valueA)) && !isNaN(Number(valueB));

        if (isNumeric) {
          return order === "asc"
            ? Number(valueA) - Number(valueB)
            : Number(valueB) - Number(valueA);
        } else {
          // Handle string comparison (case-insensitive)
          if (valueA < valueB) return order === "asc" ? -1 : 1;
          if (valueA > valueB) return order === "asc" ? 1 : -1;
          return 0;
        }
      });
    }

    return filteredData;
  }, [
    safeData,
    searchQuery,
    countryFilter,
    typeFilter,
    statusFilter,
    managerFilter,
    orderBy,
    order,
  ]);

  // Get the page of data to display
  const paginatedData = useMemo(
    () => filteredAndSortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredAndSortedData, page, rowsPerPage]
  );

  // Render the table content directly
  const tableContent = (
    <>
      {/* Search field - simplified styling when in dashboard */}
      {showFilters && (
        <Box
          sx={{
            p: inDashboard ? 1 : 2,
            display: "flex",
            flexWrap: "wrap",
            gap: inDashboard ? 1 : 2,
            bgcolor: inDashboard ? "transparent" : alpha(theme.palette.background.default, 0.5),
            borderBottom: inDashboard ? "none" : undefined,
          }}
        >
          <TextField
            size="small"
            placeholder={t("common.search")}
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ minWidth: 200, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {filterOptions.countries && filterOptions.countries.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="country-filter-label">{t("projects.country")}</InputLabel>
              <Select
                labelId="country-filter-label"
                id="country-filter"
                value={countryFilter}
                label={t("projects.country")}
                onChange={handleCountryFilterChange}
              >
                <MenuItem value="">
                  <em>{t("common.all")}</em>
                </MenuItem>
                {filterOptions.countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {filterOptions.types && filterOptions.types.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="type-filter-label">{t("projects.type")}</InputLabel>
              <Select
                labelId="type-filter-label"
                id="type-filter"
                value={typeFilter}
                label={t("projects.type")}
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="">
                  <em>{t("common.all")}</em>
                </MenuItem>
                {filterOptions.types.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {filterOptions.statuses && filterOptions.statuses.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="status-filter-label">{t("projects.status")}</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label={t("projects.status")}
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">
                  <em>{t("common.all")}</em>
                </MenuItem>
                {filterOptions.statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {filterOptions.managers && filterOptions.managers.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="manager-filter-label">{t("projects.manager")}</InputLabel>
              <Select
                labelId="manager-filter-label"
                id="manager-filter"
                value={managerFilter}
                label={t("projects.manager")}
                onChange={handleManagerFilterChange}
              >
                <MenuItem value="">
                  <em>{t("common.all")}</em>
                </MenuItem>
                {filterOptions.managers.map((manager) => (
                  <MenuItem key={manager} value={manager}>
                    {manager}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      )}

      {/* Table */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          position: "relative",
          height: inDashboard ? "calc(100% - 60px)" : "auto",
        }}
      >
        {loading && (
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
            <LinearProgress color="primary" />
          </Box>
        )}

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
            height: "100%",
            borderRadius: 0,
            border: "none",
            borderTop: inDashboard ? "none" : `1px solid ${theme.palette.divider}`,
            boxShadow: "none",
            backgroundColor: "transparent",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow key="header-row">
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? "right" : "left"}
                    sortDirection={orderBy === headCell.id ? order : false}
                    sx={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      width: headCell.width,
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={createSortHandler(headCell.id)}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === "desc" ? "sorted descending" : "sorted ascending"}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow key="loading-row">
                  <TableCell colSpan={headCells.length} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t("common.loading")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow key="no-results-row">
                  <TableCell colSpan={headCells.length} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("common.noResults")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((project) => (
                  <TableRow
                    key={project.id}
                    hover
                    onClick={() => onProjectClick && onProjectClick(project)}
                    sx={{
                      cursor: onProjectClick ? "pointer" : "default",
                      "&:last-child td, &:last-child th": { border: 0 },
                      transition: "background-color 0.2s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    {headCells.map((headCell) => (
                      <TableCell
                        key={`${project.id}-${headCell.id}`}
                        align={headCell.numeric ? "right" : "left"}
                      >
                        {headCell.format
                          ? headCell.format(project[headCell.id])
                          : project[headCell.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredAndSortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
        labelRowsPerPage={t("common.rowsPerPage")}
      />
    </>
  );

  // For in-dashboard rendering, return just the content without any card wrapper
  if (inDashboard) {
    // Return the table content directly without any additional wrapper
    return tableContent;
  }

  // Conditionally wrap the content in a Card based on noCard prop
  if (noCard) {
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 1.5,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mr: 1.5,
              }}
            >
              <AssessmentIcon />
            </Box>
            <Typography variant="h6" component="h2" fontWeight="600">
              {title}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title={t("common.download")}>
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            {showFilters && (
              <Tooltip title={t("common.filter")}>
                <IconButton size="small">
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        {tableContent}
      </Box>
    );
  }

  // Return the original Card-wrapped content
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: theme.shadows[2],
        borderRadius: 2,
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          opacity: 0.7,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              mr: 1.5,
            }}
          >
            <AssessmentIcon />
          </Box>
          <Typography variant="h6" component="h2" fontWeight="600">
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={t("common.download")}>
            <IconButton size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          {showFilters && (
            <Tooltip title={t("common.filter")}>
              <IconButton size="small">
                <FilterIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      {tableContent}
    </Card>
  );
}
