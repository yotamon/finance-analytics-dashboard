import { useRef } from "react";
import { FileText, FileSpreadsheet, FileImage, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../context/I18nContext";
import { Paper, MenuList, MenuItem, ListItemIcon, ListItemText, ClickAwayListener, Divider, useTheme } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";
import ImageIcon from "@mui/icons-material/Image";
import PrintIcon from "@mui/icons-material/Print";

function ExportMenu({ onClose }) {
	const navigate = useNavigate();
	const { t } = useI18n();
	const theme = useTheme();

	const handleExport = type => {
		// Close the menu
		onClose();

		// Navigate to the export page with the selected type as a URL parameter
		navigate(`/export?type=${type}`);
	};

	const exportOptions = [
		{
			id: "pdf",
			label: t("export.asPdf") || "Export as PDF",
			icon: <PictureAsPdfIcon fontSize="small" />,
			onClick: () => handleExport("pdf")
		},
		{
			id: "excel",
			label: t("export.asExcel") || "Export as Excel",
			icon: <GridOnIcon fontSize="small" />,
			onClick: () => handleExport("excel")
		},
		{
			id: "image",
			label: t("export.asImage") || "Export as Image",
			icon: <ImageIcon fontSize="small" />,
			onClick: () => handleExport("images")
		},
		{
			id: "print",
			label: t("export.print") || "Print Dashboard",
			icon: <PrintIcon fontSize="small" />,
			onClick: () => {
				window.print();
				onClose();
			}
		}
	];

	return (
		<ClickAwayListener onClickAway={onClose}>
			<Paper
				elevation={5}
				sx={{
					position: "absolute",
					right: 0,
					top: "100%",
					mt: 1,
					width: 220,
					zIndex: 1000,
					borderRadius: 2,
					overflow: "hidden",
					"&:before": {
						content: '""',
						display: "block",
						position: "absolute",
						top: 0,
						right: 14,
						width: 10,
						height: 10,
						bgcolor: theme.palette.background.paper,
						transform: "translateY(-50%) rotate(45deg)",
						zIndex: 0
					}
				}}>
				<MenuList dense sx={{ pt: 0.5, pb: 0.5 }}>
					{exportOptions.map((option, index) => (
						<MenuItem
							key={option.id}
							onClick={option.onClick}
							sx={{
								py: 1,
								"&:hover": {
									backgroundColor: theme.palette.action.hover
								}
							}}>
							<ListItemIcon sx={{ color: theme.palette.text.secondary }}>{option.icon}</ListItemIcon>
							<ListItemText
								primary={option.label}
								primaryTypographyProps={{
									variant: "body2"
								}}
							/>
						</MenuItem>
					))}
				</MenuList>
			</Paper>
		</ClickAwayListener>
	);
}

export default ExportMenu;
