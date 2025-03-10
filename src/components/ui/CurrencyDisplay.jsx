import { Typography } from "@mui/material";
import { useCurrency } from "../../context/CurrencyContext";

/**
 * Utility component to display currency values consistently throughout the app.
 * Automatically handles currency conversion and formatting.
 *
 * @param {Object} props
 * @param {number} props.value - The value in USD to be displayed
 * @param {boolean} props.showCurrency - Whether to show the currency symbol
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.compact - Whether to use compact notation for large numbers
 * @param {Object} props.sx - Material UI sx prop for styling
 * @param {string} props.variant - Typography variant (body1, h6, etc.)
 * @param {any} props.color - Text color
 */
export default function CurrencyDisplay({ value, showCurrency = true, className = "", compact = false, sx = {}, variant = "body1", color = "inherit", component, ...otherProps }) {
	const { format, convert, currency } = useCurrency();

	// Use span instead of p to avoid nesting issues
	const defaultComponent = component || "span";

	if (value === undefined || value === null) {
		return (
			<Typography component={defaultComponent} variant={variant} color={color} className={className} sx={sx} {...otherProps}>
				—
			</Typography>
		);
	}

	if (compact && Math.abs(value) >= 1000) {
		const convertedValue = convert(value);
		const absValue = Math.abs(convertedValue);

		let formatted;
		if (absValue >= 1e9) {
			formatted = (convertedValue / 1e9).toFixed(1) + "B";
		} else if (absValue >= 1e6) {
			formatted = (convertedValue / 1e6).toFixed(1) + "M";
		} else if (absValue >= 1e3) {
			formatted = (convertedValue / 1e3).toFixed(1) + "K";
		}

		return (
			<Typography component={defaultComponent} variant={variant} color={color} className={className} sx={sx} {...otherProps}>
				{showCurrency ? currency.symbol : ""}
				{formatted}
			</Typography>
		);
	}

	return (
		<Typography component={defaultComponent} variant={variant} color={color} className={className} sx={sx} {...otherProps}>
			{format(value)}
		</Typography>
	);
}
