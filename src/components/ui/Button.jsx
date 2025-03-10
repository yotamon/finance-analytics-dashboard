import { forwardRef } from "react";
import { Button as MuiButton, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

// Create a custom styled Material UI Button
const StyledButton = styled(MuiButton, {
	shouldForwardProp: prop => prop !== "fullWidth" && prop !== "gradient"
})(({ theme, variant, size, fullWidth, gradient }) => ({
	borderRadius: "0.75rem", // rounded-xl equivalent
	fontWeight: 500,
	textTransform: "none",
	boxShadow: variant === "contained" ? theme.shadows[2] : "none",
	transition: "all 0.3s ease",

	...(variant === "primary" && {
		background: gradient ? `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` : theme.palette.primary.main,
		color: "#fff",
		"&:hover": {
			background: gradient ? `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` : theme.palette.primary.dark,
			boxShadow: theme.shadows[4],
			transform: "translateY(-1px)"
		}
	}),

	...(variant === "secondary" && {
		backgroundColor: theme.palette.grey[700],
		color: "#fff",
		"&:hover": {
			backgroundColor: theme.palette.grey[800],
			boxShadow: theme.shadows[4],
			transform: "translateY(-1px)"
		}
	}),

	...(variant === "danger" && {
		backgroundColor: theme.palette.error.main,
		color: "#fff",
		"&:hover": {
			backgroundColor: theme.palette.error.dark,
			boxShadow: theme.shadows[4],
			transform: "translateY(-1px)"
		}
	}),

	...(variant === "success" && {
		backgroundColor: theme.palette.success.main,
		color: "#fff",
		"&:hover": {
			backgroundColor: theme.palette.success.dark,
			boxShadow: theme.shadows[4],
			transform: "translateY(-1px)"
		}
	}),

	...(variant === "link" && {
		color: theme.palette.primary.main,
		background: "none",
		padding: 0,
		height: "auto",
		boxShadow: "none",
		"&:hover": {
			background: "none",
			color: theme.palette.primary.dark,
			textDecoration: "underline",
			textUnderlineOffset: "4px"
		}
	}),

	...(fullWidth && {
		width: "100%"
	})
}));

const Button = forwardRef(
	({ children, variant = "primary", size = "medium", className = "", isLoading = false, icon: Icon = null, iconPosition = "left", fullWidth = false, gradient = false, ...props }, ref) => {
		// Map custom sizes to Material UI sizes
		const sizeMap = {
			xs: "small",
			sm: "small",
			md: "medium",
			lg: "large",
			xl: "large"
		};

		// Map custom variants to Material UI variants
		const variantMap = {
			primary: "contained",
			secondary: "contained",
			outline: "outlined",
			ghost: "text",
			danger: "contained",
			success: "contained",
			link: "text"
		};

		const muiSize = sizeMap[size] || "medium";
		const muiVariant = variantMap[variant] || "contained";

		return (
			<StyledButton
				ref={ref}
				variant={muiVariant}
				size={muiSize}
				fullWidth={fullWidth}
				disabled={isLoading || props.disabled}
				gradient={variant === "primary" && gradient}
				className={className}
				{...props}>
				{isLoading && <CircularProgress size={muiSize === "small" ? 16 : 20} color="inherit" sx={{ mr: 1 }} />}

				{Icon && iconPosition === "left" && !isLoading && <Icon className="mr-2" size={muiSize === "small" ? 16 : 20} />}

				{children}

				{Icon && iconPosition === "right" && !isLoading && <Icon className="ml-2" size={muiSize === "small" ? 16 : 20} />}
			</StyledButton>
		);
	}
);

Button.displayName = "Button";

export default Button;
