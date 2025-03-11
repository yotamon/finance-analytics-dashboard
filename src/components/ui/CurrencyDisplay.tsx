import { Typography, TypographyProps } from "@mui/material";
import { useCurrency } from "../../context/CurrencyContext";
import { ReactNode, ElementType } from "react";

/**
 * Props for the CurrencyDisplay component
 */
interface CurrencyDisplayProps extends Omit<TypographyProps, "value"> {
  /** The value in USD to be displayed */
  value?: number | null;
  /** Whether to show the currency symbol */
  showCurrency?: boolean;
  /** Whether to use compact notation for large numbers (K, M, B) */
  compact?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Component to render as */
  component?: ElementType;
}

/**
 * Utility component to display currency values consistently throughout the app.
 * Automatically handles currency conversion and formatting.
 */
export default function CurrencyDisplay({
  value,
  showCurrency = true,
  className = "",
  compact = false,
  sx = {},
  variant = "body1",
  color = "inherit",
  component,
  ...otherProps
}: CurrencyDisplayProps): JSX.Element {
  const { format, convert, currency } = useCurrency();

  // Use span instead of p to avoid nesting issues
  const defaultComponent = component || "span";

  if (value === undefined || value === null) {
    return (
      <Typography
        component={defaultComponent}
        variant={variant}
        color={color}
        className={className}
        sx={sx}
        {...otherProps}
      >
        —
      </Typography>
    );
  }

  if (compact && Math.abs(value) >= 1000) {
    const convertedValue = convert(value);

    // Handle potential null return from convert
    if (convertedValue === null) {
      return (
        <Typography
          component={defaultComponent}
          variant={variant}
          color={color}
          className={className}
          sx={sx}
          {...otherProps}
        >
          —
        </Typography>
      );
    }

    const absValue = Math.abs(convertedValue);

    let formatted: string;
    if (absValue >= 1e9) {
      formatted = (convertedValue / 1e9).toFixed(1) + "B";
    } else if (absValue >= 1e6) {
      formatted = (convertedValue / 1e6).toFixed(1) + "M";
    } else if (absValue >= 1e3) {
      formatted = (convertedValue / 1e3).toFixed(1) + "K";
    } else {
      formatted = convertedValue.toFixed(1);
    }

    return (
      <Typography
        component={defaultComponent}
        variant={variant}
        color={color}
        className={className}
        sx={sx}
        {...otherProps}
      >
        {showCurrency ? currency.symbol : ""}
        {formatted}
      </Typography>
    );
  }

  return (
    <Typography
      component={defaultComponent}
      variant={variant}
      color={color}
      className={className}
      sx={sx}
      {...otherProps}
    >
      {format(value)}
    </Typography>
  );
}
