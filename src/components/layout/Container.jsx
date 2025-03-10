import { motion } from "framer-motion";
import { useUi } from "../../context/UiContext";
import { Container as MuiContainer } from "@mui/material";

function Container({ children, className = "", size = "default", animate = false, ...props }) {
	const { darkMode } = useUi();

	// Map size to Material UI Container maxWidth
	const sizeMap = {
		default: "lg", // max-w-7xl equivalent
		small: "md", // max-w-4xl equivalent
		large: "xl" // max-w-screen-2xl equivalent
	};

	const maxWidth = sizeMap[size] || sizeMap.default;

	// If animation is enabled, wrap the MUI Container in a motion div
	return animate ? (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className={className}>
			<MuiContainer maxWidth={maxWidth} {...props}>
				{children}
			</MuiContainer>
		</motion.div>
	) : (
		<MuiContainer maxWidth={maxWidth} className={className} {...props}>
			{children}
		</MuiContainer>
	);
}

export default Container;
