import { createContext, useContext, useState, useEffect } from "react";
import { useConfig } from "./ConfigContext";

// Currency configuration with symbols, locales and static exchange rates
// In a production app, these rates would come from an API
const CURRENCIES = {
	USD: {
		code: "USD",
		symbol: "$",
		name: "US Dollar",
		locale: "en-US",
		rate: 1, // Base currency
		format: value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
	},
	EUR: {
		code: "EUR",
		symbol: "€",
		name: "Euro",
		locale: "de-DE",
		rate: 0.93, // 1 USD = 0.93 EUR (example rate)
		format: value => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value)
	},
	GBP: {
		code: "GBP",
		symbol: "£",
		name: "British Pound",
		locale: "en-GB",
		rate: 0.79, // 1 USD = 0.79 GBP (example rate)
		format: value => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value)
	},
	JPY: {
		code: "JPY",
		symbol: "¥",
		name: "Japanese Yen",
		locale: "ja-JP",
		rate: 153.8, // 1 USD = 153.8 JPY (example rate)
		format: value => new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(value)
	},
	CNY: {
		code: "CNY",
		symbol: "¥",
		name: "Chinese Yuan",
		locale: "zh-CN",
		rate: 7.23, // 1 USD = 7.23 CNY (example rate)
		format: value => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(value)
	}
};

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
	const { getConfig } = useConfig();
	const [currency, setCurrency] = useState(CURRENCIES.USD);
	const [exchangeRates, setExchangeRates] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [lastUpdated, setLastUpdated] = useState(null);

	// Initialize currency from config or local storage
	useEffect(() => {
		const savedCurrency = localStorage.getItem("preferredCurrency");
		const configCurrency = getConfig("app.currency", "USD");

		const currencyToUse = savedCurrency || configCurrency;
		if (CURRENCIES[currencyToUse]) {
			setCurrency(CURRENCIES[currencyToUse]);
		}

		// Set initial static exchange rates
		setExchangeRates(
			Object.keys(CURRENCIES).reduce((acc, code) => {
				acc[code] = CURRENCIES[code].rate;
				return acc;
			}, {})
		);

		setLastUpdated(new Date());
	}, [getConfig]);

	// Function to fetch latest exchange rates from an API
	// In a real app, you would implement this using a currency API
	const fetchExchangeRates = async () => {
		setIsLoading(true);
		try {
			// Simulating API call with our static rates
			// In a real app, replace with actual API call:
			// const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
			// const data = await response.json();
			// setExchangeRates(data.rates);

			// For now, we'll just use our static rates with a slight randomization
			const simulatedRates = Object.keys(CURRENCIES).reduce((acc, code) => {
				// Add a small random fluctuation (+/- 0.5%)
				const fluctuation = 1 + (Math.random() * 0.01 - 0.005);
				acc[code] = CURRENCIES[code].rate * fluctuation;
				return acc;
			}, {});

			setExchangeRates(simulatedRates);
			setLastUpdated(new Date());
		} catch (error) {
			console.error("Error fetching exchange rates:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Function to change the currency
	const changeCurrency = currencyCode => {
		if (CURRENCIES[currencyCode]) {
			setCurrency(CURRENCIES[currencyCode]);
			localStorage.setItem("preferredCurrency", currencyCode);
		}
	};

	// Function to convert a value from USD to the current currency
	const convert = valueInUSD => {
		if (!valueInUSD && valueInUSD !== 0) return null;
		const rate = exchangeRates[currency.code] || currency.rate;
		return valueInUSD * rate;
	};

	// Function to format a value according to the current currency
	const format = valueInUSD => {
		if (!valueInUSD && valueInUSD !== 0) return "";
		const convertedValue = convert(valueInUSD);
		return currency.format(convertedValue);
	};

	return (
		<CurrencyContext.Provider
			value={{
				currency,
				availableCurrencies: CURRENCIES,
				changeCurrency,
				convert,
				format,
				fetchExchangeRates,
				isLoading,
				lastUpdated
			}}>
			{children}
		</CurrencyContext.Provider>
	);
}

export function useCurrency() {
	const context = useContext(CurrencyContext);
	if (!context) {
		throw new Error("useCurrency must be used within a CurrencyProvider");
	}
	return context;
}
