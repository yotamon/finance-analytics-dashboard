import { Link } from "react-router-dom";
import { useConfig } from "../../context/ConfigContext";
import { useI18n } from "../../context/I18nContext";
import { useTheme } from "../../context/ThemeContext";
import { Box, Container, Typography, Grid, Link as MuiLink, Divider, useTheme as useMuiTheme } from "@mui/material";

function Footer() {
	const { getConfig } = useConfig();
	const { t } = useI18n();
	const { isDark } = useTheme();
	const muiTheme = useMuiTheme();

	const companyName = getConfig("company.name", "ZEN Energy Group");
	const currentYear = new Date().getFullYear();

	// Function to get content from configuration with fallbacks
	const getContent = (configPath, defaultValue) => {
		const content = getConfig(configPath);
		return content || defaultValue;
	};

	return (
		<Box
			component="footer"
			sx={{
				py: 4,
				mt: "auto",
				backgroundColor: muiTheme.palette.background.paper,
				borderTop: 1,
				borderColor: "divider"
			}}>
			<Container maxWidth="lg">
				<Grid container spacing={4} justifyContent="space-between">
					<Grid item xs={12} sm={6} md={4}>
						<Typography variant="h6" gutterBottom color="primary.main">
							{companyName}
						</Typography>
						<Typography variant="body2" color="text.secondary" paragraph>
							{getContent("company.description", "Financial Performance Dashboard")}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{getContent("company.address", "123 Financial Street, Business District")}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6} md={3}>
						<Typography variant="h6" gutterBottom color="primary.main">
							{t("footer.quickLinks")}
						</Typography>
						<Box component="nav">
							<MuiLink
								component={Link}
								to="/dashboard"
								sx={{
									display: "block",
									mb: 1,
									textDecoration: "none",
									"&:hover": { color: "primary.main" }
								}}
								color="text.secondary">
								{t("nav.dashboard")}
							</MuiLink>
							<MuiLink
								component={Link}
								to="/upload"
								sx={{
									display: "block",
									mb: 1,
									textDecoration: "none",
									"&:hover": { color: "primary.main" }
								}}
								color="text.secondary">
								{t("upload.title")}
							</MuiLink>
							<MuiLink
								component={Link}
								to="/settings"
								sx={{
									display: "block",
									mb: 1,
									textDecoration: "none",
									"&:hover": { color: "primary.main" }
								}}
								color="text.secondary">
								{t("nav.settings")}
							</MuiLink>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6} md={3}>
						<Typography variant="h6" gutterBottom color="primary.main">
							{t("footer.legalInfo")}
						</Typography>
						<MuiLink
							component={Link}
							to="/settings?tab=privacy"
							sx={{
								display: "block",
								mb: 1,
								textDecoration: "none",
								"&:hover": { color: "primary.main" }
							}}
							color="text.secondary">
							{t("footer.privacyPolicy")}
						</MuiLink>
						<MuiLink
							component={Link}
							to="/settings?tab=terms"
							sx={{
								display: "block",
								mb: 1,
								textDecoration: "none",
								"&:hover": { color: "primary.main" }
							}}
							color="text.secondary">
							{t("footer.termsOfService")}
						</MuiLink>
					</Grid>
				</Grid>

				<Divider sx={{ my: 3 }} />

				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
					<Typography variant="body2" color="text.secondary">
						© {currentYear} {companyName}. {t("footer.allRightsReserved")}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{t("footer.poweredBy")}{" "}
						<MuiLink href="https://fintech.company" target="_blank" color="primary.main" sx={{ textDecoration: "none" }}>
							Financial Analytics
						</MuiLink>
					</Typography>
				</Box>
			</Container>
		</Box>
	);
}

export default Footer;
