import { useState } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { useI18n } from "../../context/I18nContext";
import { Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, Typography, Divider, IconButton, useTheme, alpha } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function CurrencySwitcher({ className = "" }) {
	const theme = useTheme();
	const { currency, availableCurrencies, changeCurrency, fetchExchangeRates, isLoading, lastUpdated } = useCurrency();
	const { t } = useI18n();
	const [anchorEl, setAnchorEl] = useState(null);

	const isOpen = Boolean(anchorEl);

	const handleClick = event => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleCurrencyChange = code => {
		changeCurrency(code);
		handleClose();
	};

	const handleRefresh = event => {
		event.stopPropagation();
		fetchExchangeRates();
	};

	// Format the last updated time
	const formattedLastUpdated = lastUpdated
		? new Date(lastUpdated).toLocaleString(currency.locale, {
				hour: "numeric",
				minute: "numeric",
				hour12: true
		  })
		: "";

	return (
		<Box className={className}>
			<Button
				id="currency-button"
				aria-controls={isOpen ? "currency-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={isOpen ? "true" : undefined}
				onClick={handleClick}
				startIcon={<AttachMoneyIcon fontSize="small" />}
				endIcon={
					<KeyboardArrowDownIcon
						sx={{
							transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
							transition: theme.transitions.create("transform")
						}}
						fontSize="small"
					/>
				}
				sx={{
					textTransform: "none",
					minWidth: "auto",
					p: 1,
					borderRadius: 1.5,
					color: theme.palette.text.secondary,
					"&:hover": {
						backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)"
					}
				}}>
				<Typography
					variant="body2"
					sx={{
						display: { xs: "none", sm: "block" },
						fontWeight: 500
					}}>
					{currency.code}
				</Typography>
			</Button>

			<Menu
				id="currency-menu"
				anchorEl={anchorEl}
				open={isOpen}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "currency-button",
					dense: true
				}}
				PaperProps={{
					elevation: 2,
					sx: {
						minWidth: 220,
						overflow: "visible",
						mt: 1,
						"&:before": {
							content: '""',
							display: "block",
							position: "absolute",
							top: 0,
							right: 14,
							width: 10,
							height: 10,
							bgcolor: theme.palette.background.paper,
							transform: "translateY(-50%) rotate(45deg)",
							zIndex: 0
						}
					}
				}}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						p: 1,
						px: 2,
						borderBottom: 1,
						borderColor: "divider"
					}}>
					<Typography variant="caption" color="text.secondary">
						{lastUpdated ? `${t("settings.currency")}: ${formattedLastUpdated}` : t("settings.currency")}
					</Typography>
					<IconButton
						onClick={handleRefresh}
						disabled={isLoading}
						size="small"
						aria-label="Refresh rates"
						sx={{
							color: theme.palette.text.disabled,
							"&:hover": {
								color: theme.palette.text.secondary,
								bgcolor: alpha(theme.palette.text.primary, 0.05)
							}
						}}>
						<RefreshIcon
							fontSize="small"
							sx={{
								animation: isLoading ? "spin 1s linear infinite" : "none",
								"@keyframes spin": {
									"0%": {
										transform: "rotate(0deg)"
									},
									"100%": {
										transform: "rotate(360deg)"
									}
								}
							}}
						/>
					</IconButton>
				</Box>

				{Object.entries(availableCurrencies).map(([code, details]) => (
					<MenuItem
						key={code}
						onClick={() => handleCurrencyChange(code)}
						selected={currency.code === code}
						sx={{
							py: 1,
							px: 2
						}}>
						<ListItemIcon sx={{ minWidth: 32 }}>
							{currency.code === code ? (
								<CheckIcon fontSize="small" color="primary" />
							) : (
								<Box component="span" sx={{ width: 24, display: "inline-block", textAlign: "center" }}>
									{details.symbol}
								</Box>
							)}
						</ListItemIcon>
						<ListItemText
							primary={
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<Typography variant="body2" fontWeight={500}>
										{code}
									</Typography>
									<Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
										{details.name}
									</Typography>
								</Box>
							}
						/>
					</MenuItem>
				))}
			</Menu>
		</Box>
	);
}
