import { useState, useRef, useEffect } from "react";
import { useI18n } from "../../context/I18nContext";
import { Box, Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Typography, useTheme } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";

export default function LanguageSwitcher({ className = "" }) {
	const theme = useTheme();
	const { currentLanguage, changeLanguage, availableLanguages } = useI18n();
	const [anchorEl, setAnchorEl] = useState(null);

	const isOpen = Boolean(anchorEl);

	const handleClick = event => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLanguageChange = code => {
		changeLanguage(code);
		handleClose();
	};

	// Get current language details
	const currentLanguageDetails = availableLanguages[currentLanguage];

	return (
		<Box className={className}>
			<Button
				id="language-button"
				aria-controls={isOpen ? "language-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={isOpen ? "true" : undefined}
				onClick={handleClick}
				startIcon={<LanguageIcon fontSize="small" />}
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
					{currentLanguageDetails.nativeName}
				</Typography>
			</Button>

			<Menu
				id="language-menu"
				anchorEl={anchorEl}
				open={isOpen}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "language-button",
					dense: true
				}}
				PaperProps={{
					elevation: 2,
					sx: {
						minWidth: 180,
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
				{Object.entries(availableLanguages).map(([code, details]) => (
					<MenuItem
						key={code}
						onClick={() => handleLanguageChange(code)}
						selected={currentLanguage === code}
						sx={{
							py: 1,
							px: 2
						}}>
						<ListItemIcon sx={{ minWidth: 32 }}>{currentLanguage === code && <CheckIcon fontSize="small" color="primary" />}</ListItemIcon>
						<ListItemText primary={details.nativeName} />
					</MenuItem>
				))}
			</Menu>
		</Box>
	);
}
