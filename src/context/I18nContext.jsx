import { createContext, useContext, useState, useEffect } from "react";
import { useConfig } from "./ConfigContext";

// Define available languages
const AVAILABLE_LANGUAGES = {
	en: {
		name: "English",
		nativeName: "English",
		translations: {
			// Navigation
			"nav.dashboard": "Dashboard",
			"nav.upload": "Upload",
			"nav.export": "Export",
			"nav.settings": "Settings",
			// Common actions
			"action.filter": "Filter",
			"action.export": "Export",
			"action.download": "Download",
			"action.save": "Save",
			"action.cancel": "Cancel",
			"action.apply": "Apply",
			"action.reset": "Reset",
			"action.customize": "Customize",
			// Dashboard
			"dashboard.title": "Financial Dashboard",
			"dashboard.overview": "Overview",
			"dashboard.performance": "Performance",
			"dashboard.projects": "Projects",
			"dashboard.geography": "Geography",
			"dashboard.lastUpdated": "Last updated",
			"dashboard.liveData": "Live Data",
			"dashboard.filterData": "Filter Data",
			"dashboard.export": "Export",
			"dashboard.customize": "Dashboard Layout",
			"dashboard.savedLayouts": "Saved Layouts",
			// Charts
			"charts.revenueEbitda.title": "Revenue & EBITDA Projection",
			"charts.revenueEbitda.description": "Showing exponential growth from 2025-2026 as projects come online",
			"charts.portfolioOverview.title": "Project Portfolio Overview",
			"charts.portfolioOverview.description": "Investment size vs. capacity vs. expected returns",
			"charts.projectType.title": "Project Type Breakdown",
			"charts.projectType.description": "Distribution between wind and solar capacity",
			"charts.geographicDistribution.title": "Geographic Distribution",
			"charts.geographicDistribution.description": "Project locations and regional investments",
			"charts.investmentReturns.title": "Investment Returns",
			"charts.investmentReturns.description": "IRR vs. yield on cost analysis",
			"charts.ebitdaMargin.title": "EBITDA Margin",
			"charts.ebitdaMargin.description": "Profitability analysis by project type",
			"charts.countryComparison.title": "Country Comparison",
			"charts.countryComparison.description": "Investment and capacity by country",
			// Upload
			"upload.title": "Upload Data",
			"upload.dragDrop": "Drag and drop your files here",
			"upload.browse": "Browse files",
			"upload.supportedFormats": "Supported formats: CSV, XLSX",
			"upload.success": "File uploaded successfully",
			"upload.error": "Error uploading file",
			"upload.validation": "Validating data...",
			// Export
			"export.title": "Export Dashboard",
			"export.pdf": "PDF Document",
			"export.excel": "Excel Spreadsheet",
			"export.image": "Image",
			"export.asPdf": "Export as PDF",
			"export.asExcel": "Export as Excel",
			"export.asImage": "Export as Image",
			"export.print": "Print Dashboard",
			// Settings
			"settings.title": "Settings",
			"settings.appearance": "Appearance",
			"settings.darkMode": "Dark Mode",
			"settings.language": "Language",
			"settings.currency": "Currency",
			"settings.dataOptions": "Data Options",
			// Metrics
			"metric.investment": "Investment",
			"metric.revenue": "Revenue",
			"metric.ebitda": "EBITDA",
			"metric.profit": "Profit",
			"metric.irr": "IRR",
			"metric.capacity": "Capacity",
			"metric.yieldOnCost": "Yield on Cost",
			"metric.value": "Value",
			// Filter menu
			"dashboard.filters.title": "Filter Dashboard",
			"dashboard.filters.projectType": "Project Type",
			"dashboard.filters.country": "Country",
			"dashboard.filters.capacityRange": "Capacity Range",
			"dashboard.filters.apply": "Apply Filters",
			// KPIs
			"kpi.totalCapacity": "Portfolio Capacity",
			"kpi.averageIrr": "Average IRR",
			"kpi.totalInvestment": "Total Investment",
			"kpi.annualEbitda": "Annual EBITDA",
			// Footer
			"footer.quickLinks": "Quick Links",
			"footer.legalInfo": "Legal Info",
			"footer.privacyPolicy": "Privacy Policy",
			"footer.termsOfService": "Terms of Service",
			"footer.allRightsReserved": "All Rights Reserved",
			"footer.poweredBy": "Powered by",
			// Company
			"company.name": "ZEN Energy Group",
			"company.description": "Financial Performance Dashboard",
			"company.address": "123 Financial Street, Business District",
			// Dashboard Customizer
			"customizer.layout": "Layout",
			"customizer.savedLayouts": "Saved Layouts",
			"customizer.reset": "Reset",
			"customizer.order": "Order",
			"customizer.chart": "Chart",
			"customizer.size": "Size",
			"customizer.visibility": "Visibility",
			"customizer.lock": "Lock",
			"customizer.saveLayout": "Save This Layout",
			"customizer.enterLayoutName": "Enter layout name",
			"customizer.save": "Save",
			"customizer.load": "Load",
			"customizer.noSavedLayouts": "No saved layouts yet. Customize your dashboard and save layouts to see them here.",
			"customizer.visibleCharts": "visible charts",
			"customizer.cancel": "Cancel",
			"customizer.applyChanges": "Apply Changes",
			// Common
			"common.cancel": "Cancel"
		}
	},
	es: {
		name: "Spanish",
		nativeName: "Español",
		translations: {
			// Navigation
			"nav.dashboard": "Panel",
			"nav.upload": "Subir",
			"nav.export": "Exportar",
			"nav.settings": "Configuración",
			// Common actions
			"action.filter": "Filtrar",
			"action.export": "Exportar",
			"action.download": "Descargar",
			"action.save": "Guardar",
			"action.cancel": "Cancelar",
			"action.apply": "Aplicar",
			"action.reset": "Reiniciar",
			"action.customize": "Personalizar",
			// Dashboard
			"dashboard.title": "Panel Financiero",
			"dashboard.overview": "Resumen",
			"dashboard.performance": "Rendimiento",
			"dashboard.projects": "Proyectos",
			"dashboard.geography": "Geografía",
			"dashboard.lastUpdated": "Última actualización",
			"dashboard.liveData": "Datos en vivo",
			"dashboard.filterData": "Filtrar datos",
			"dashboard.export": "Exportar",
			"dashboard.customize": "Diseño del Panel",
			"dashboard.savedLayouts": "Diseños Guardados",
			// Charts
			"charts.revenueEbitda.title": "Proyección de Ingresos y EBITDA",
			"charts.revenueEbitda.description": "Muestra un crecimiento exponencial de 2025 a 2026 cuando los proyectos entran en línea",
			"charts.portfolioOverview.title": "Resumen de Cartera de Proyectos",
			"charts.portfolioOverview.description": "Tamaño de inversión vs. capacidad vs. rendimientos esperados",
			"charts.projectType.title": "Desglose por Tipo de Proyecto",
			"charts.projectType.description": "Distribución entre capacidad eólica y solar",
			"charts.geographicDistribution.title": "Distribución Geográfica",
			"charts.geographicDistribution.description": "Ubicaciones de proyectos e inversiones regionales",
			"charts.investmentReturns.title": "Retornos de Inversión",
			"charts.investmentReturns.description": "Análisis de TIR vs. rendimiento sobre costo",
			"charts.ebitdaMargin.title": "Margen EBITDA",
			"charts.ebitdaMargin.description": "Análisis de rentabilidad por tipo de proyecto",
			"charts.countryComparison.title": "Comparación por País",
			"charts.countryComparison.description": "Inversión y capacidad por país",
			// Upload
			"upload.title": "Subir Datos",
			"upload.dragDrop": "Arrastra y suelta tus archivos aquí",
			"upload.browse": "Explorar archivos",
			"upload.supportedFormats": "Formatos compatibles: CSV, XLSX",
			"upload.success": "Archivo subido con éxito",
			"upload.error": "Error al subir el archivo",
			"upload.validation": "Validando datos...",
			// Export
			"export.title": "Exportar Panel",
			"export.pdf": "Documento PDF",
			"export.excel": "Hoja de Cálculo Excel",
			"export.image": "Imagen",
			"export.asPdf": "Exportar como PDF",
			"export.asExcel": "Exportar como Excel",
			"export.asImage": "Exportar como Imagen",
			"export.print": "Imprimir Panel",
			// Settings
			"settings.title": "Configuración",
			"settings.appearance": "Apariencia",
			"settings.darkMode": "Modo Oscuro",
			"settings.language": "Idioma",
			"settings.currency": "Moneda",
			"settings.dataOptions": "Opciones de Datos",
			// Metrics
			"metric.investment": "Inversión",
			"metric.revenue": "Ingresos",
			"metric.ebitda": "EBITDA",
			"metric.profit": "Beneficio",
			"metric.irr": "TIR",
			"metric.capacity": "Capacidad",
			"metric.yieldOnCost": "Rendimiento sobre Coste",
			"metric.value": "Valor",
			// Filter menu
			"dashboard.filters.title": "Filtrar Panel",
			"dashboard.filters.projectType": "Tipo de Proyecto",
			"dashboard.filters.country": "País",
			"dashboard.filters.capacityRange": "Rango de Capacidad",
			"dashboard.filters.apply": "Aplicar Filtros",
			// KPIs
			"kpi.totalCapacity": "Capacidad de Cartera",
			"kpi.averageIrr": "TIR Promedio",
			"kpi.totalInvestment": "Inversión Total",
			"kpi.annualEbitda": "EBITDA Anual",
			// Footer
			"footer.quickLinks": "Enlaces Rápidos",
			"footer.legalInfo": "Información Legal",
			"footer.privacyPolicy": "Política de Privacidad",
			"footer.termsOfService": "Términos de Servicio",
			"footer.allRightsReserved": "Todos los Derechos Reservados",
			"footer.poweredBy": "Desarrollado por",
			// Company
			"company.name": "Grupo ZEN Energy",
			"company.description": "Panel de Rendimiento Financiero",
			"company.address": "123 Calle Financiera, Distrito de Negocios",
			// Dashboard Customizer
			"customizer.layout": "Diseño",
			"customizer.savedLayouts": "Diseños Guardados",
			"customizer.reset": "Restablecer",
			"customizer.order": "Orden",
			"customizer.chart": "Gráfico",
			"customizer.size": "Tamaño",
			"customizer.visibility": "Visibilidad",
			"customizer.lock": "Bloquear",
			"customizer.saveLayout": "Guardar Este Diseño",
			"customizer.enterLayoutName": "Ingrese nombre del diseño",
			"customizer.save": "Guardar",
			"customizer.load": "Cargar",
			"customizer.noSavedLayouts": "Aún no hay diseños guardados. Personalice su panel y guarde diseños para verlos aquí.",
			"customizer.visibleCharts": "gráficos visibles",
			"customizer.cancel": "Cancelar",
			"customizer.applyChanges": "Aplicar Cambios",
			// Common
			"common.cancel": "Cancelar"
		}
	},
	fr: {
		name: "French",
		nativeName: "Français",
		translations: {
			// Navigation
			"nav.dashboard": "Tableau de Bord",
			"nav.upload": "Télécharger",
			"nav.export": "Exporter",
			"nav.settings": "Paramètres",
			// Common actions
			"action.filter": "Filtrer",
			"action.export": "Exporter",
			"action.download": "Télécharger",
			"action.save": "Enregistrer",
			"action.cancel": "Annuler",
			"action.apply": "Appliquer",
			"action.reset": "Réinitialiser",
			"action.customize": "Personnaliser",
			// Dashboard
			"dashboard.title": "Tableau de Bord Financier",
			"dashboard.overview": "Aperçu",
			"dashboard.performance": "Performance",
			"dashboard.projects": "Projets",
			"dashboard.geography": "Géographie",
			// Upload
			"upload.title": "Télécharger des Données",
			"upload.dragDrop": "Glissez et déposez vos fichiers ici",
			"upload.browse": "Parcourir les fichiers",
			"upload.supportedFormats": "Formats pris en charge: CSV, XLSX",
			"upload.success": "Fichier téléchargé avec succès",
			"upload.error": "Erreur lors du téléchargement du fichier",
			"upload.validation": "Validation des données...",
			// Export
			"export.title": "Exporter le Tableau de Bord",
			"export.pdf": "Document PDF",
			"export.excel": "Feuille de Calcul Excel",
			"export.image": "Image",
			// Settings
			"settings.title": "Paramètres",
			"settings.appearance": "Apparence",
			"settings.darkMode": "Mode Sombre",
			"settings.language": "Langue",
			"settings.currency": "Devise",
			"settings.dataOptions": "Options de Données",
			// Metrics
			"metric.investment": "Investissement",
			"metric.revenue": "Revenu",
			"metric.ebitda": "EBITDA",
			"metric.profit": "Bénéfice",
			"metric.irr": "TRI",
			"metric.capacity": "Capacité",
			"metric.yieldOnCost": "Rendement sur Coût"
		}
	},
	de: {
		name: "German",
		nativeName: "Deutsch",
		translations: {
			// Navigation
			"nav.dashboard": "Dashboard",
			"nav.upload": "Hochladen",
			"nav.export": "Exportieren",
			"nav.settings": "Einstellungen",
			// Common actions
			"action.filter": "Filtern",
			"action.export": "Exportieren",
			"action.download": "Herunterladen",
			"action.save": "Speichern",
			"action.cancel": "Abbrechen",
			"action.apply": "Anwenden",
			"action.reset": "Zurücksetzen",
			"action.customize": "Anpassen",
			// Dashboard
			"dashboard.title": "Finanz-Dashboard",
			"dashboard.overview": "Überblick",
			"dashboard.performance": "Leistung",
			"dashboard.projects": "Projekte",
			"dashboard.geography": "Geographie",
			// Upload
			"upload.title": "Daten hochladen",
			"upload.dragDrop": "Ziehen Sie Ihre Dateien hierher",
			"upload.browse": "Dateien durchsuchen",
			"upload.supportedFormats": "Unterstützte Formate: CSV, XLSX",
			"upload.success": "Datei erfolgreich hochgeladen",
			"upload.error": "Fehler beim Hochladen der Datei",
			"upload.validation": "Daten werden validiert...",
			// Export
			"export.title": "Dashboard exportieren",
			"export.pdf": "PDF-Dokument",
			"export.excel": "Excel-Tabelle",
			"export.image": "Bild",
			// Settings
			"settings.title": "Einstellungen",
			"settings.appearance": "Erscheinungsbild",
			"settings.darkMode": "Dunkelmodus",
			"settings.language": "Sprache",
			"settings.currency": "Währung",
			"settings.dataOptions": "Datenoptionen",
			// Metrics
			"metric.investment": "Investition",
			"metric.revenue": "Umsatz",
			"metric.ebitda": "EBITDA",
			"metric.profit": "Gewinn",
			"metric.irr": "IRR",
			"metric.capacity": "Kapazität",
			"metric.yieldOnCost": "Rendite auf Kosten"
		}
	}
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
	const { getConfig } = useConfig();
	const [currentLanguage, setCurrentLanguage] = useState("en");
	const [translations, setTranslations] = useState(AVAILABLE_LANGUAGES.en.translations);

	// Initialize language from config
	useEffect(() => {
		const configLanguage = getConfig("app.language", "en");
		if (AVAILABLE_LANGUAGES[configLanguage]) {
			setCurrentLanguage(configLanguage);
			setTranslations(AVAILABLE_LANGUAGES[configLanguage].translations);
		}
	}, [getConfig]);

	// Function to change language
	const changeLanguage = languageCode => {
		if (AVAILABLE_LANGUAGES[languageCode]) {
			setCurrentLanguage(languageCode);
			setTranslations(AVAILABLE_LANGUAGES[languageCode].translations);
			// Could save preference to localStorage here
			localStorage.setItem("preferredLanguage", languageCode);
		}
	};

	// Translation function
	const t = (key, defaultValue = key) => {
		return translations[key] || defaultValue;
	};

	return (
		<I18nContext.Provider
			value={{
				currentLanguage,
				changeLanguage,
				t,
				availableLanguages: AVAILABLE_LANGUAGES
			}}>
			{children}
		</I18nContext.Provider>
	);
}

export function useI18n() {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return context;
}
