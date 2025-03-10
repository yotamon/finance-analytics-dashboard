import React, { forwardRef } from "react";
import { useTheme } from "../ThemeProvider";

/**
 * Box Component
 *
 * A foundational component for the design system that can be extended to create other UI components.
 * It provides a consistent way to apply styles and properties across the application.
 */
const Box = forwardRef(
	(
		{
			as: Component = "div",
			children,
			className = "",
			style = {},

			// Margins
			m,
			mt,
			mr,
			mb,
			ml,
			mx,
			my,

			// Paddings
			p,
			pt,
			pr,
			pb,
			pl,
			px,
			py,

			// Colors
			bg,
			color,

			// Typography
			fontSize,
			fontWeight,
			lineHeight,
			letterSpacing,
			textAlign,

			// Layout
			display,
			width,
			height,
			minWidth,
			maxWidth,
			minHeight,
			maxHeight,

			// Flex properties
			flex,
			flexDirection,
			flexWrap,
			justifyContent,
			alignItems,
			alignContent,
			gap,

			// Border properties
			border,
			borderColor,
			borderRadius,

			// Shadow
			shadow,

			// Position
			position,
			top,
			right,
			bottom,
			left,
			zIndex,

			// Other
			overflow,
			cursor,
			opacity,
			transition,

			// Rest props
			...rest
		},
		ref
	) => {
		const { isDark } = useTheme();

		// Combine custom styles with prop-based styles
		const boxStyles = {
			// Margins
			...(m !== undefined && { margin: m }),
			...(mt !== undefined && { marginTop: mt }),
			...(mr !== undefined && { marginRight: mr }),
			...(mb !== undefined && { marginBottom: mb }),
			...(ml !== undefined && { marginLeft: ml }),
			...(mx !== undefined && { marginLeft: mx, marginRight: mx }),
			...(my !== undefined && { marginTop: my, marginBottom: my }),

			// Paddings
			...(p !== undefined && { padding: p }),
			...(pt !== undefined && { paddingTop: pt }),
			...(pr !== undefined && { paddingRight: pr }),
			...(pb !== undefined && { paddingBottom: pb }),
			...(pl !== undefined && { paddingLeft: pl }),
			...(px !== undefined && { paddingLeft: px, paddingRight: px }),
			...(py !== undefined && { paddingTop: py, paddingBottom: py }),

			// Colors
			...(bg !== undefined && { backgroundColor: bg }),
			...(color !== undefined && { color }),

			// Typography
			...(fontSize !== undefined && { fontSize }),
			...(fontWeight !== undefined && { fontWeight }),
			...(lineHeight !== undefined && { lineHeight }),
			...(letterSpacing !== undefined && { letterSpacing }),
			...(textAlign !== undefined && { textAlign }),

			// Layout
			...(display !== undefined && { display }),
			...(width !== undefined && { width }),
			...(height !== undefined && { height }),
			...(minWidth !== undefined && { minWidth }),
			...(maxWidth !== undefined && { maxWidth }),
			...(minHeight !== undefined && { minHeight }),
			...(maxHeight !== undefined && { maxHeight }),

			// Flex properties
			...(flex !== undefined && { flex }),
			...(flexDirection !== undefined && { flexDirection }),
			...(flexWrap !== undefined && { flexWrap }),
			...(justifyContent !== undefined && { justifyContent }),
			...(alignItems !== undefined && { alignItems }),
			...(alignContent !== undefined && { alignContent }),
			...(gap !== undefined && { gap }),

			// Border properties
			...(border !== undefined && { border }),
			...(borderColor !== undefined && { borderColor }),
			...(borderRadius !== undefined && { borderRadius }),

			// Shadow
			...(shadow !== undefined && { boxShadow: shadow }),

			// Position
			...(position !== undefined && { position }),
			...(top !== undefined && { top }),
			...(right !== undefined && { right }),
			...(bottom !== undefined && { bottom }),
			...(left !== undefined && { left }),
			...(zIndex !== undefined && { zIndex }),

			// Other
			...(overflow !== undefined && { overflow }),
			...(cursor !== undefined && { cursor }),
			...(opacity !== undefined && { opacity }),
			...(transition !== undefined && { transition }),

			// Additional custom styles
			...style
		};

		return (
			<Component ref={ref} className={className} style={boxStyles} data-dark-mode={isDark ? "true" : "false"} {...rest}>
				{children}
			</Component>
		);
	}
);

Box.displayName = "Box";

export default Box;
