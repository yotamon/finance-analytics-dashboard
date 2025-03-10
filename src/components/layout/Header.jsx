import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, BarChart2, PieChart, Database, Settings as SettingsIcon, Sun, Moon } from "lucide-react";
import { useData } from "../../context/DataContext";
import { useConfig } from "../../context/ConfigContext";
import { getCompanyName } from "../../utils/configUtils";
import { useUi } from "../../context/UiContext";
import { useI18n } from "../../context/I18nContext";
import { useTheme } from "../../context/ThemeContext";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import CurrencySwitcher from "../ui/CurrencySwitcher";

// Import Material UI components
import {
	AppBar,
	Box,
	Toolbar,
	IconButton,
	Typography,
	Menu,
	Container,
	Avatar,
	Button,
	Tooltip,
	MenuItem,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
	useTheme as useMuiTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import InfoIcon from "@mui/icons-material/Info";

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { hasData, clearData } = useData();
	const { getConfig, isFeatureEnabled, updateConfig } = useConfig();
	const { theme, toggleTheme } = useTheme();
	const { t } = useI18n();
	const companyConfig = getConfig("company");
	const navigate = useNavigate();
	const isDark = theme === "dark";
	const muiTheme = useMuiTheme();

	const handleNewUpload = () => {
		clearData();
		navigate("/upload");
	};

	// Toggle theme and update configuration
	const handleThemeToggle = () => {
		// Toggle theme
		toggleTheme();
		// Update config with new theme preference (use the opposite of current state since toggle hasn't completed yet)
		updateConfig("app.defaultTheme", !isDark ? "dark" : "light");
	};

	// Handle drawer close
	const handleDrawerClose = () => {
		setIsMenuOpen(false);
	};

	return (
		<AppBar position="sticky" elevation={0} color="default">
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					{/* Logo and title for desktop */}
					<Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
						<Avatar
							sx={{
								background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.primary.dark})`,
								width: 40,
								height: 40,
								mr: 1
							}}>
							{companyConfig?.name?.substring(0, 2) || "ZE"}
						</Avatar>
						<Box component={Link} to="/" sx={{ textDecoration: "none", color: "inherit" }}>
							<Typography
								variant="h6"
								noWrap
								sx={{
									fontWeight: 700,
									color: muiTheme.palette.text.primary,
									"&:hover": { color: muiTheme.palette.primary.main }
								}}>
								{getCompanyName() || "ZEN Energy Group"}
							</Typography>
							<Typography variant="caption" sx={{ color: muiTheme.palette.text.secondary }}>
								{companyConfig?.description || "Financial Performance Dashboard"}
							</Typography>
						</Box>
					</Box>

					{/* Mobile menu icon */}
					<Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" }, justifyContent: "flex-end" }}>
						{/* Mobile Theme Toggle */}
						<IconButton size="large" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} onClick={handleThemeToggle} color="inherit">
							{isDark ? <LightModeIcon /> : <DarkModeIcon />}
						</IconButton>

						<IconButton size="large" aria-label="Open menu" aria-controls="menu-appbar" aria-haspopup="true" onClick={() => setIsMenuOpen(true)} color="inherit">
							<MenuIcon />
						</IconButton>
					</Box>

					{/* Desktop navigation */}
					<Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "flex-end" }}>
						{hasData && (
							<>
								<Button component={Link} to="/dashboard" startIcon={<BarChart2 size={16} />} sx={{ mx: 1 }}>
									{t("nav.dashboard")}
								</Button>

								{isFeatureEnabled("DataExport") && (
									<Button component={Link} to="/export" startIcon={<PieChart size={16} />} sx={{ mx: 1 }}>
										{t("nav.export")}
									</Button>
								)}

								<Button variant="outlined" onClick={handleNewUpload} startIcon={<Upload size={16} />} sx={{ mx: 1 }}>
									{t("upload.title")}
								</Button>
							</>
						)}

						{/* Theme toggle button */}
						<IconButton size="large" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} onClick={handleThemeToggle} color="inherit" sx={{ ml: 1 }}>
							{isDark ? <LightModeIcon /> : <DarkModeIcon />}
						</IconButton>

						{/* Settings link */}
						<Button component={Link} to="/settings" startIcon={<SettingsIcon size={16} />} sx={{ ml: 1 }}>
							{t("nav.settings")}
						</Button>
					</Box>
				</Toolbar>
			</Container>

			{/* Mobile Navigation Drawer */}
			<Drawer anchor="right" open={isMenuOpen} onClose={handleDrawerClose}>
				<Box sx={{ width: 250 }} role="presentation">
					<Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
						<IconButton onClick={handleDrawerClose}>{muiTheme.direction === "rtl" ? <ChevronLeftIcon /> : <ChevronRightIcon />}</IconButton>
						<Typography variant="h6" sx={{ ml: 1 }}>
							Menu
						</Typography>
					</Box>

					<Divider />

					<List>
						{hasData && (
							<>
								<ListItem disablePadding>
									<ListItemButton component={Link} to="/dashboard" onClick={handleDrawerClose}>
										<ListItemIcon>
											<BarChart2 size={20} />
										</ListItemIcon>
										<ListItemText primary={t("nav.dashboard")} />
									</ListItemButton>
								</ListItem>

								{isFeatureEnabled("DataExport") && (
									<ListItem disablePadding>
										<ListItemButton component={Link} to="/export" onClick={handleDrawerClose}>
											<ListItemIcon>
												<PieChart size={20} />
											</ListItemIcon>
											<ListItemText primary={t("nav.export")} />
										</ListItemButton>
									</ListItem>
								)}

								<ListItem disablePadding>
									<ListItemButton
										onClick={() => {
											handleNewUpload();
											handleDrawerClose();
										}}>
										<ListItemIcon>
											<Upload size={20} />
										</ListItemIcon>
										<ListItemText primary={t("upload.title")} />
									</ListItemButton>
								</ListItem>
							</>
						)}

						{/* Material UI Demo Link in Drawer */}
						<ListItem disablePadding>
							<ListItemButton component={Link} to="/mui-demo" onClick={handleDrawerClose}>
								<ListItemIcon>
									<InfoIcon />
								</ListItemIcon>
								<ListItemText primary="Material UI" />
							</ListItemButton>
						</ListItem>

						<ListItem disablePadding>
							<ListItemButton component={Link} to="/settings" onClick={handleDrawerClose}>
								<ListItemIcon>
									<SettingsIcon size={20} />
								</ListItemIcon>
								<ListItemText primary={t("nav.settings")} />
							</ListItemButton>
						</ListItem>
					</List>

					<Divider />

					<Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<LanguageSwitcher />
						<CurrencySwitcher />
					</Box>
				</Box>
			</Drawer>
		</AppBar>
	);
}

export default Header;
