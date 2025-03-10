import React, { forwardRef } from "react";
import Box from "./Box";
import { useTheme } from "../ThemeProvider";

/**
 * Card Component
 *
 * A flexible container component with various properties for creating cards
 */
const Card = forwardRef(
	(
		{
			children,
			className = "",
			style = {},

			// Card specific props
			variant = "default",
			padding = "md",
			shadow = "md",
			bordered = true,
			isHoverable = false,

			// Other props
			...rest
		},
		ref
	) => {
		const { isDark } = useTheme();

		// Define padding sizes
		const getPaddingSize = () => {
			const sizes = {
				xs: "0.5rem",
				sm: "0.75rem",
				md: "1rem",
				lg: "1.5rem",
				xl: "2rem",
				none: "0"
			};

			return sizes[padding] || sizes.md;
		};

		// Define shadow styles
		const getShadowStyle = () => {
			if (shadow === "none") return "none";

			const shadows = {
				sm: "var(--shadow-sm)",
				md: "var(--shadow-md)",
				lg: "var(--shadow-lg)",
				xl: "var(--shadow-xl)",
				inner: "var(--shadow-inner)"
			};

			return shadows[shadow] || shadows.md;
		};

		// Define variant styles
		const getVariantStyles = () => {
			const variants = {
				default: {
					backgroundColor: isDark ? "var(--color-bg-secondary)" : "var(--color-bg-primary)",
					color: "var(--color-text-primary)"
				},
				outline: {
					backgroundColor: "transparent",
					color: "var(--color-text-primary)",
					border: `1px solid ${isDark ? "var(--color-border-default)" : "var(--color-border-default)"}`
				},
				filled: {
					backgroundColor: isDark ? "var(--color-bg-tertiary)" : "var(--color-bg-tertiary)",
					color: "var(--color-text-primary)"
				},
				elevated: {
					backgroundColor: isDark ? "var(--color-bg-secondary)" : "var(--color-bg-primary)",
					color: "var(--color-text-primary)",
					boxShadow: isDark ? "var(--shadow-lg)" : "var(--shadow-lg)"
				}
			};

			return variants[variant] || variants.default;
		};

		// Combine styles
		const cardStyles = {
			borderRadius: "var(--border-radius-md)",
			overflow: "hidden",
			padding: getPaddingSize(),
			boxShadow: variant !== "elevated" ? getShadowStyle() : undefined,
			border: variant === "outline" ? undefined : bordered ? `1px solid ${isDark ? "var(--color-border-default)" : "var(--color-border-default)"}` : "none",
			transition: "all var(--transition-normal) var(--transition-timing-ease-in-out)",
			...(isHoverable && {
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: "var(--shadow-lg)"
				}
			}),
			...getVariantStyles(),
			...style
		};

		return (
			<Box ref={ref} className={`design-card design-card-${variant} ${className}`} style={cardStyles} {...rest}>
				{children}
			</Box>
		);
	}
);

Card.displayName = "Card";

// Card Header component
export const CardHeader = forwardRef(({ children, className = "", style = {}, ...rest }, ref) => {
	return (
		<Box
			ref={ref}
			className={`design-card-header ${className}`}
			style={{
				marginBottom: "0.75rem",
				borderBottom: "1px solid var(--color-border-muted)",
				paddingBottom: "0.75rem",
				...style
			}}
			{...rest}>
			{children}
		</Box>
	);
});

CardHeader.displayName = "CardHeader";

// Card Body component
export const CardBody = forwardRef(({ children, className = "", style = {}, ...rest }, ref) => {
	return (
		<Box
			ref={ref}
			className={`design-card-body ${className}`}
			style={{
				...style
			}}
			{...rest}>
			{children}
		</Box>
	);
});

CardBody.displayName = "CardBody";

// Card Footer component
export const CardFooter = forwardRef(({ children, className = "", style = {}, ...rest }, ref) => {
	return (
		<Box
			ref={ref}
			className={`design-card-footer ${className}`}
			style={{
				marginTop: "0.75rem",
				borderTop: "1px solid var(--color-border-muted)",
				paddingTop: "0.75rem",
				...style
			}}
			{...rest}>
			{children}
		</Box>
	);
});

CardFooter.displayName = "CardFooter";

// Export Card as default
export default Card;
