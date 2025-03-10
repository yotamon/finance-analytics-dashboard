import React, { forwardRef } from "react";
import { useTheme } from "../ThemeProvider";
import Box from "./Box";

/**
 * Button Component
 *
 * A customizable button component with different variants, sizes, and states
 */
const Button = forwardRef(
	(
		{
			children,
			className = "",
			style = {},

			// Button specific props
			variant = "primary",
			size = "md",
			isFullWidth = false,
			isDisabled = false,
			isLoading = false,
			leftIcon,
			rightIcon,
			onClick,
			type = "button",

			// Other props
			...rest
		},
		ref
	) => {
		const { isDark } = useTheme();

		// Define variant styles
		const getVariantStyles = () => {
			const variants = {
				primary: {
					backgroundColor: `var(--color-primary-${isDark ? "600" : "500"})`,
					color: "white",
					border: "none",
					":hover": {
						backgroundColor: `var(--color-primary-${isDark ? "700" : "600"})`
					},
					":active": {
						backgroundColor: `var(--color-primary-${isDark ? "800" : "700"})`
					}
				},
				secondary: {
					backgroundColor: "transparent",
					color: `var(--color-primary-${isDark ? "400" : "600"})`,
					border: `1px solid var(--color-primary-${isDark ? "500" : "600"})`,
					":hover": {
						backgroundColor: `var(--color-primary-${isDark ? "900" : "50"})`
					},
					":active": {
						backgroundColor: `var(--color-primary-${isDark ? "800" : "100"})`
					}
				},
				tertiary: {
					backgroundColor: "transparent",
					color: `var(--color-primary-${isDark ? "400" : "600"})`,
					border: "none",
					":hover": {
						backgroundColor: `var(--color-primary-${isDark ? "900" : "50"})`
					},
					":active": {
						backgroundColor: `var(--color-primary-${isDark ? "800" : "100"})`
					}
				},
				success: {
					backgroundColor: `var(--color-success-${isDark ? "600" : "500"})`,
					color: "white",
					border: "none",
					":hover": {
						backgroundColor: `var(--color-success-${isDark ? "700" : "600"})`
					},
					":active": {
						backgroundColor: `var(--color-success-${isDark ? "800" : "700"})`
					}
				},
				danger: {
					backgroundColor: `var(--color-error-${isDark ? "600" : "500"})`,
					color: "white",
					border: "none",
					":hover": {
						backgroundColor: `var(--color-error-${isDark ? "700" : "600"})`
					},
					":active": {
						backgroundColor: `var(--color-error-${isDark ? "800" : "700"})`
					}
				},
				ghost: {
					backgroundColor: "transparent",
					color: `var(--color-text-${isDark ? "secondary" : "primary"})`,
					border: "none",
					":hover": {
						backgroundColor: `var(--color-bg-${isDark ? "tertiary" : "tertiary"})`
					},
					":active": {
						backgroundColor: `var(--color-bg-${isDark ? "muted" : "muted"})`
					}
				}
			};

			return variants[variant] || variants.primary;
		};

		// Define size styles
		const getSizeStyles = () => {
			const sizes = {
				xs: {
					fontSize: "0.75rem",
					padding: "0.25rem 0.5rem",
					borderRadius: "var(--border-radius-sm)",
					height: "1.5rem"
				},
				sm: {
					fontSize: "0.875rem",
					padding: "0.375rem 0.75rem",
					borderRadius: "var(--border-radius-sm)",
					height: "2rem"
				},
				md: {
					fontSize: "1rem",
					padding: "0.5rem 1rem",
					borderRadius: "var(--border-radius-md)",
					height: "2.5rem"
				},
				lg: {
					fontSize: "1.125rem",
					padding: "0.75rem 1.25rem",
					borderRadius: "var(--border-radius-md)",
					height: "3rem"
				},
				xl: {
					fontSize: "1.25rem",
					padding: "1rem 1.5rem",
					borderRadius: "var(--border-radius-lg)",
					height: "3.5rem"
				}
			};

			return sizes[size] || sizes.md;
		};

		// Combine styles
		const buttonStyles = {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			fontWeight: 500,
			cursor: isDisabled ? "not-allowed" : "pointer",
			opacity: isDisabled ? 0.6 : 1,
			transition: "all var(--transition-fast) var(--transition-timing-ease-in-out)",
			width: isFullWidth ? "100%" : "auto",
			...getVariantStyles(),
			...getSizeStyles(),
			...style
		};

		return (
			<Box
				as="button"
				ref={ref}
				className={`design-button design-button-${variant} design-button-${size} ${className}`}
				style={buttonStyles}
				disabled={isDisabled || isLoading}
				onClick={isDisabled || isLoading ? undefined : onClick}
				type={type}
				{...rest}>
				{isLoading && (
					<span className="loading-spinner" style={{ marginRight: children ? "0.5rem" : 0 }}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="1em"
							height="1em"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								animation: "spin 1s linear infinite",
								display: "inline-block",
								"@keyframes spin": {
									"0%": { transform: "rotate(0deg)" },
									"100%": { transform: "rotate(360deg)" }
								}
							}}>
							<circle cx="12" cy="12" r="10" opacity="0.25" />
							<path d="M12 2a10 10 0 0 1 10 10" />
						</svg>
					</span>
				)}

				{leftIcon && !isLoading && (
					<span className="button-icon-left" style={{ marginRight: children ? "0.5rem" : 0 }}>
						{leftIcon}
					</span>
				)}

				{children}

				{rightIcon && (
					<span className="button-icon-right" style={{ marginLeft: children ? "0.5rem" : 0 }}>
						{rightIcon}
					</span>
				)}
			</Box>
		);
	}
);

Button.displayName = "Button";

export default Button;
