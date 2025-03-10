import React, { forwardRef } from "react";
import Box from "./Box";
import { useTheme } from "../ThemeProvider";
import { typography } from "../tokens";

/**
 * Text Component
 *
 * A flexible typography component with various styles and properties
 */
const Text = forwardRef(
	(
		{
			children,
			className = "",
			style = {},

			// Typography props
			variant = "body1",
			size,
			weight,
			align = "inherit",
			transform,
			color,
			truncate = false,
			noOfLines,

			// Element type
			as,

			// Rest props
			...rest
		},
		ref
	) => {
		const { isDark } = useTheme();

		// Determine element type based on variant
		const getElementType = () => {
			if (as) return as;

			switch (variant) {
				case "h1":
					return "h1";
				case "h2":
					return "h2";
				case "h3":
					return "h3";
				case "h4":
					return "h4";
				case "h5":
					return "h5";
				case "h6":
					return "h6";
				case "subtitle1":
					return "h6";
				case "subtitle2":
					return "h6";
				case "body1":
					return "p";
				case "body2":
					return "p";
				case "caption":
					return "span";
				case "overline":
					return "span";
				case "label":
					return "label";
				default:
					return "p";
			}
		};

		// Define variant styles
		const getVariantStyles = () => {
			const variants = {
				h1: {
					fontSize: typography.fontSize["4xl"],
					fontWeight: typography.fontWeight.bold,
					lineHeight: typography.lineHeight.tight,
					letterSpacing: typography.letterSpacing.tight,
					marginBottom: "0.5em"
				},
				h2: {
					fontSize: typography.fontSize["3xl"],
					fontWeight: typography.fontWeight.bold,
					lineHeight: typography.lineHeight.tight,
					letterSpacing: typography.letterSpacing.tight,
					marginBottom: "0.5em"
				},
				h3: {
					fontSize: typography.fontSize["2xl"],
					fontWeight: typography.fontWeight.semibold,
					lineHeight: typography.lineHeight.tight,
					letterSpacing: typography.letterSpacing.tight,
					marginBottom: "0.5em"
				},
				h4: {
					fontSize: typography.fontSize.xl,
					fontWeight: typography.fontWeight.semibold,
					lineHeight: typography.lineHeight.tight,
					letterSpacing: typography.letterSpacing.tight,
					marginBottom: "0.5em"
				},
				h5: {
					fontSize: typography.fontSize.lg,
					fontWeight: typography.fontWeight.semibold,
					lineHeight: typography.lineHeight.tight,
					marginBottom: "0.5em"
				},
				h6: {
					fontSize: typography.fontSize.base,
					fontWeight: typography.fontWeight.semibold,
					lineHeight: typography.lineHeight.tight,
					marginBottom: "0.5em"
				},
				subtitle1: {
					fontSize: typography.fontSize.lg,
					fontWeight: typography.fontWeight.medium,
					lineHeight: typography.lineHeight.normal,
					letterSpacing: typography.letterSpacing.tight
				},
				subtitle2: {
					fontSize: typography.fontSize.base,
					fontWeight: typography.fontWeight.medium,
					lineHeight: typography.lineHeight.normal,
					letterSpacing: typography.letterSpacing.tight
				},
				body1: {
					fontSize: typography.fontSize.base,
					fontWeight: typography.fontWeight.regular,
					lineHeight: typography.lineHeight.normal
				},
				body2: {
					fontSize: typography.fontSize.sm,
					fontWeight: typography.fontWeight.regular,
					lineHeight: typography.lineHeight.normal
				},
				caption: {
					fontSize: typography.fontSize.sm,
					fontWeight: typography.fontWeight.regular,
					lineHeight: typography.lineHeight.normal,
					color: "var(--color-text-tertiary)"
				},
				overline: {
					fontSize: typography.fontSize.xs,
					fontWeight: typography.fontWeight.medium,
					lineHeight: typography.lineHeight.normal,
					letterSpacing: typography.letterSpacing.wider,
					textTransform: "uppercase"
				},
				label: {
					fontSize: typography.fontSize.sm,
					fontWeight: typography.fontWeight.medium,
					lineHeight: typography.lineHeight.tight,
					marginBottom: "0.25em"
				}
			};

			return variants[variant] || variants.body1;
		};

		// Merge styles
		const textStyles = {
			fontFamily: "var(--font-family-base)",
			margin: 0,
			color: color || (isDark ? "var(--color-text-primary)" : "var(--color-text-primary)"),
			textAlign: align,
			...(transform && { textTransform: transform }),
			...(size && { fontSize: size }),
			...(weight && { fontWeight: weight }),
			...(truncate && {
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap"
			}),
			...(noOfLines && {
				overflow: "hidden",
				textOverflow: "ellipsis",
				display: "-webkit-box",
				WebkitBoxOrient: "vertical",
				WebkitLineClamp: noOfLines
			}),
			...getVariantStyles(),
			...style
		};

		return (
			<Box as={getElementType()} ref={ref} className={`design-text design-text-${variant} ${className}`} style={textStyles} {...rest}>
				{children}
			</Box>
		);
	}
);

Text.displayName = "Text";

export default Text;
