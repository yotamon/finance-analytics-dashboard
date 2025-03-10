import { useRef, useEffect, useState } from "react";
import { Check } from "lucide-react";
import {
  Box,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Slider,
  Grid,
  Divider,
  ClickAwayListener,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useI18n } from "../../context/I18nContext";

function FilterMenu({ onClose, open, onFilter, filterParams = {}, onReset }) {
  const menuRef = useRef(null);
  const theme = useTheme();
  const { t } = useI18n();

  // Sample filter states
  const [projectTypes, setProjectTypes] = useState({
    "Solar Ground": true,
    "On-shore Wind": true,
    "Solar Rooftop": true,
    "Off-shore Wind": true,
  });

  const [countries, setCountries] = useState({
    Romania: true,
    Bulgaria: true,
    Serbia: true,
    "N.Macedonia": true,
    Greece: true,
  });

  const [capacityRange, setCapacityRange] = useState([0, 200]);

  // Reset states when filter params change
  useEffect(() => {
    if (filterParams) {
      // Update states based on filter params if needed
    }
  }, [filterParams]);

  // Handle capacity slider change
  const handleCapacityChange = (event, newValue) => {
    setCapacityRange(newValue);
  };

  const handleProjectTypeChange = (type) => {
    setProjectTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleCountryChange = (country) => {
    setCountries((prev) => ({
      ...prev,
      [country]: !prev[country],
    }));
  };

  const handleApplyFilters = () => {
    // In a real app, you would apply these filters to your data
    console.log("Applying filters:", { projectTypes, countries, capacityRange });

    // Create filter params object
    const activeFilters = {};

    // Add filter params based on selections
    if (capacityRange && (capacityRange[0] > 0 || capacityRange[1] < 200)) {
      activeFilters.capacityMin = capacityRange[0];
      activeFilters.capacityMax = capacityRange[1];
    }

    // Call the onFilter callback with the filter params
    if (onFilter) {
      onFilter(activeFilters);
    }

    onClose();
  };

  const handleResetFilters = () => {
    // Reset all filter states
    setProjectTypes({
      "Solar Ground": true,
      "On-shore Wind": true,
      "Solar Rooftop": true,
      "Off-shore Wind": true,
    });

    setCountries({
      Romania: true,
      Bulgaria: true,
      Serbia: true,
      "N.Macedonia": true,
      Greece: true,
    });

    setCapacityRange([0, 200]);

    // Call the onReset callback
    if (onReset) {
      onReset();
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle>{t("dashboard.filters.title") || "Filter Dashboard"}</DialogTitle>

      <DialogContent dividers>
        {/* Project Type Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            {t("dashboard.filters.projectType") || "Project Type"}
          </Typography>
          <FormGroup>
            {Object.entries(projectTypes).map(([type, isChecked]) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={() => handleProjectTypeChange(type)}
                    size="small"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {type}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Box>

        {/* Country Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            {t("dashboard.filters.country") || "Country"}
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(countries).map(([country, isChecked]) => (
              <Grid item xs={6} key={country}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleCountryChange(country)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {country}
                    </Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Capacity Range Filter */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            {t("dashboard.filters.capacityRange") || "Capacity Range"}: {capacityRange[0]} -{" "}
            {capacityRange[1]} MW
          </Typography>
          <Slider
            value={capacityRange}
            onChange={handleCapacityChange}
            valueLabelDisplay="auto"
            min={0}
            max={200}
            sx={{
              color: theme.palette.primary.main,
              "& .MuiSlider-thumb": {
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: `0px 0px 0px 8px ${
                    theme.palette.mode === "dark"
                      ? "rgba(90, 105, 255, 0.16)"
                      : "rgba(90, 105, 255, 0.16)"
                  }`,
                },
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="text"
          onClick={handleResetFilters}
          size="small"
          sx={{ textTransform: "none", mr: "auto" }}
        >
          {t("action.resetFilters") || "Reset"}
        </Button>
        <Button variant="text" onClick={onClose} size="small" sx={{ textTransform: "none" }}>
          {t("common.cancel") || "Cancel"}
        </Button>
        <Button
          variant="contained"
          onClick={handleApplyFilters}
          size="small"
          sx={{ textTransform: "none" }}
        >
          {t("dashboard.filters.apply") || "Apply Filters"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FilterMenu;
