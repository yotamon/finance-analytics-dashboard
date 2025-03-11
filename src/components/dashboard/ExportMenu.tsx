import { useRef } from "react";
import { FileText, FileSpreadsheet, FileImage, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../context/I18nContext";
import {
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ClickAwayListener,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";
import ImageIcon from "@mui/icons-material/Image";
import PrintIcon from "@mui/icons-material/Print";

function ExportMenu({ onClose, open, data }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const theme = useTheme();

  const handleExport = (type) => {
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
      onClick: () => handleExport("pdf"),
    },
    {
      id: "excel",
      label: t("export.asExcel") || "Export as Excel",
      icon: <GridOnIcon fontSize="small" />,
      onClick: () => handleExport("excel"),
    },
    {
      id: "image",
      label: t("export.asImage") || "Export as Image",
      icon: <ImageIcon fontSize="small" />,
      onClick: () => handleExport("images"),
    },
    {
      id: "print",
      label: t("export.print") || "Print Dashboard",
      icon: <PrintIcon fontSize="small" />,
      onClick: () => {
        window.print();
        onClose();
      },
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: "auto",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle>{t("export.title") || "Export Dashboard"}</DialogTitle>
      <MenuList dense sx={{ pt: 0.5, pb: 0.5 }}>
        {exportOptions.map((option, index) => (
          <MenuItem
            key={option.id}
            onClick={option.onClick}
            sx={{
              py: 1,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.text.secondary }}>{option.icon}</ListItemIcon>
            <ListItemText
              primary={option.label}
              primaryTypographyProps={{
                variant: "body2",
              }}
            />
          </MenuItem>
        ))}
      </MenuList>
    </Dialog>
  );
}

export default ExportMenu;
