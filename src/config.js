/**
 * Application Configuration
 *
 * This file contains all configuration settings for the Finance Analyzer application.
 * Edit this file to customize the application to your needs.
 */

// In Vite, use import.meta.env instead of process.env
const NODE_ENV = import.meta.env.MODE || "development";
const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL;

const config = {
	// Company details
	company: {
		name: "Finance Analyzer", // Your company or application name
		logo: "/images/logo.png", // Path to your logo file (relative to public directory)
		favicon: "/favicon.ico", // Path to favicon
		tagline: "Simplifying financial analysis", // Company or product tagline
		description: "A comprehensive tool for analyzing financial data", // Brief description
		contactEmail: "support@example.com", // Support or contact email
		website: "https://example.com", // Company website
		copyright: `© ${new Date().getFullYear()} Finance Analyzer. All rights reserved.`, // Copyright notice
		socialMedia: {
			twitter: "https://twitter.com/yourcompany",
			linkedin: "https://linkedin.com/company/yourcompany",
			github: "https://github.com/yourusername/finance-analyzer"
		}
	},

	// Developer information
	developer: {
		name: "Yotam Faraggi", // Your name or team name
		email: "yotamon@gmail.com", // Developer contact email
		website: "https://github.com/yotamon", // Developer website or portfolio
		repository: "https://github.com/yotamon/finance-analyzer" // GitHub repository URL
	},

	// Application settings
	app: {
		name: "Finance Analyzer",
		version: "0.1.0", // Application version (should match package.json)
		environment: NODE_ENV, // Current environment
		apiUrl: API_URL || "http://localhost:3000/api", // Backend API URL
		baseUrl: BASE_URL || "http://localhost:5173", // Frontend base URL
		defaultLanguage: "en", // Default application language
		supportedLanguages: ["en", "es", "fr"], // Languages supported by the application
		defaultTheme: "light", // Default theme (light/dark)
		showDevTools: NODE_ENV === "development", // Show developer tools
		isProd: NODE_ENV === "production", // Is production environment
		isDev: NODE_ENV === "development", // Is development environment
		analytics: {
			enabled: NODE_ENV === "production", // Enable analytics in production
			trackingId: "UA-XXXXXXXXX-X" // Google Analytics tracking ID
		}
	},

	// Authentication settings
	auth: {
		tokenStorageKey: "finance_analyzer_token", // Local storage key for auth token
		tokenExpirationKey: "finance_analyzer_token_expiration", // Expiration time storage key
		refreshTokenKey: "finance_analyzer_refresh_token", // Refresh token storage key
		sessionDuration: 86400000, // Session duration in milliseconds (24 hours)
		authEndpoint: "/auth" // Authentication endpoint
	},

	// API configuration
	api: {
		timeout: 30000, // API request timeout in milliseconds
		retryAttempts: 3, // Number of retry attempts for failed requests
		retryDelay: 1000, // Delay between retry attempts in milliseconds
		cacheEnabled: true, // Enable API response caching
		cacheDuration: 300000 // Cache duration in milliseconds (5 minutes)
	},

	// Features configuration
	features: {
		// Use environment variables with fallbacks for feature flags
		enableDataExport: import.meta.env.VITE_ENABLE_DATA_EXPORT === "true" || true, // Enable data export functionality
		enableDataImport: import.meta.env.VITE_ENABLE_DATA_IMPORT === "true" || true, // Enable data import functionality
		enableCharting: import.meta.env.VITE_ENABLE_CHARTING === "true" || true, // Enable charting and visualization features
		enableReporting: import.meta.env.VITE_ENABLE_REPORTING === "true" || true, // Enable reporting features
		enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === "true" || true, // Enable notifications
		enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === "true" || true, // Enable offline functionality
		enableSubscriptions: import.meta.env.VITE_ENABLE_SUBSCRIPTIONS === "true" || false // Enable subscription features
	},

	// UI configuration
	ui: {
		theme: {
			primary: "#3b82f6", // Primary color
			secondary: "#10b981", // Secondary color
			accent: "#f59e0b", // Accent color
			error: "#ef4444", // Error color
			warning: "#f59e0b", // Warning color
			info: "#3b82f6", // Info color
			success: "#10b981", // Success color
			background: "#ffffff", // Default background color
			text: "#1f2937", // Default text color
			borderRadius: "0.375rem", // Default border radius
			fontFamily: "'Inter', 'Segoe UI', Roboto, Arial, sans-serif" // Default font family
		},
		layout: {
			sidebarWidth: 250, // Sidebar width in pixels
			topbarHeight: 64, // Top bar height in pixels
			contentMaxWidth: 1200, // Content max width in pixels
			footerHeight: 60 // Footer height in pixels
		},
		animation: {
			defaultDuration: 300, // Default animation duration in milliseconds
			defaultEasing: "cubic-bezier(0.4, 0, 0.2, 1)" // Default animation easing
		},
		dateFormat: "YYYY-MM-DD", // Default date format
		timeFormat: "HH:mm:ss", // Default time format
		currencyFormat: {
			locale: "en-US", // Default currency locale
			currency: "USD" // Default currency
		},
		pagination: {
			defaultPageSize: 10, // Default items per page
			pageSizeOptions: [10, 20, 50, 100] // Page size options
		},
		responsive: {
			mobileBreakpoint: 640, // Mobile breakpoint in pixels
			tabletBreakpoint: 768, // Tablet breakpoint in pixels
			desktopBreakpoint: 1024, // Desktop breakpoint in pixels
			largeDesktopBreakpoint: 1280 // Large desktop breakpoint in pixels
		}
	},

	// File upload configuration
	uploads: {
		maxFileSize: 10 * 1024 * 1024, // Maximum file size in bytes (10MB)
		allowedFileTypes: [".csv", ".xlsx", ".json", ".pdf"], // Allowed file types
		uploadEndpoint: "/api/upload", // File upload endpoint
		storageType: "local" // Storage type (local, s3, etc.)
	},

	// Data processing configuration
	dataProcessing: {
		batchSize: 1000, // Batch size for data processing
		parallelProcessing: true, // Enable parallel processing
		maxParallelJobs: 4, // Maximum number of parallel jobs
		timeoutMs: 60000, // Processing timeout in milliseconds
		defaultDateFormat: "YYYY-MM-DD" // Default date format for parsing
	},

	// Localization configuration
	localization: {
		defaultLocale: "en-US", // Default locale
		fallbackLocale: "en-US", // Fallback locale
		datetimeFormats: {
			short: {
				year: "numeric",
				month: "short",
				day: "numeric"
			},
			long: {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "numeric",
				minute: "numeric"
			}
		},
		numberFormats: {
			currency: {
				style: "currency",
				currency: "USD"
			},
			percent: {
				style: "percent",
				minimumFractionDigits: 2
			}
		}
	},

	// Cache configuration
	cache: {
		enabled: true, // Enable caching
		type: "localStorage", // Cache type (localStorage, sessionStorage, etc.)
		ttl: 3600, // Time to live in seconds (1 hour)
		maxSize: 50 * 1024 * 1024, // Maximum cache size in bytes (50MB)
		prefix: "finance_analyzer_" // Cache key prefix
	},

	// Error reporting configuration
	errorReporting: {
		enabled: true, // Enable error reporting
		captureUncaught: true, // Capture uncaught exceptions
		captureUnhandledRejections: true, // Capture unhandled promise rejections
		ignoredErrors: ["Network request failed"], // Errors to ignore
		endpoint: "/api/log-error" // Error reporting endpoint
	},

	// Logging configuration
	logging: {
		level: NODE_ENV === "production" ? "error" : "debug", // Log level (debug, info, warn, error)
		console: true, // Log to console
		file: false, // Log to file
		remote: NODE_ENV === "production", // Log to remote server
		remoteEndpoint: "/api/logs" // Remote logging endpoint
	},

	// Performance monitoring
	performance: {
		enabled: true, // Enable performance monitoring
		traceUserInteractions: true, // Trace user interactions
		traceNetworkRequests: true, // Trace network requests
		traceSuspenseTransitions: true, // Trace React suspense transitions
		sampleRate: 0.1 // Sample rate (0.1 = 10% of events)
	}
};

export default config;
