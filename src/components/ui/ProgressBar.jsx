import React from "react";
import { LinearProgress, Box } from "@mui/material";

function ProgressBar({ progress, height = 8, color = "primary" }) {
	return (
		<Box
			sx={{
				width: "100%",
				backgroundColor: theme => (theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)"),
				borderRadius: height / 2,
				boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)"
			}}>
			<LinearProgress
				variant="determinate"
				value={progress}
				color={color}
				sx={{
					height: height,
					borderRadius: height / 2,
					"& .MuiLinearProgress-bar": {
						boxShadow: "0 0 5px rgba(34, 165, 132, 0.5)",
						transition: "width 0.5s ease-out"
					}
				}}
			/>
		</Box>
	);
}

export default ProgressBar;
