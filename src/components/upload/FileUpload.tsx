import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Description as FileIcon,
  InsertDriveFile as CsvIcon,
  TableChart as ExcelIcon,
  Code as JsonIcon,
  Delete as DeleteIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

type SupportedFileType = "csv" | "xlsx" | "xls" | "json";

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
  supportedFileTypes?: SupportedFileType[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  minSize?: number; // in bytes
  isLoading?: boolean;
  error?: string;
  helperText?: string;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "csv":
      return <CsvIcon />;
    case "xlsx":
    case "xls":
      return <ExcelIcon />;
    case "json":
      return <JsonIcon />;
    default:
      return <FileIcon />;
  }
};

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesAccepted,
  supportedFileTypes = ["csv", "xlsx", "xls", "json"],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  minSize = 0,
  isLoading = false,
  error,
  helperText = "Drag and drop your financial data files here, or click to select files",
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const theme = useTheme();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(newFiles);
      onFilesAccepted(newFiles);
    },
    [files, maxFiles, onFilesAccepted]
  );

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesAccepted(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "text/csv": supportedFileTypes.includes("csv") ? [".csv"] : [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        supportedFileTypes.includes("xlsx") ? [".xlsx"] : [],
      "application/vnd.ms-excel": supportedFileTypes.includes("xls") ? [".xls"] : [],
      "application/json": supportedFileTypes.includes("json") ? [".json"] : [],
    },
    maxFiles,
    maxSize,
    minSize,
  });

  const getBackgroundColor = () => {
    if (isDragActive && !isDragReject) {
      return theme.palette.mode === "dark" ? "rgba(25, 118, 210, 0.2)" : "rgba(33, 150, 243, 0.1)";
    }
    if (isDragReject) {
      return theme.palette.mode === "dark" ? "rgba(211, 47, 47, 0.2)" : "rgba(244, 67, 54, 0.1)";
    }
    return "transparent";
  };

  const getBorderColor = () => {
    if (isDragActive && !isDragReject) {
      return theme.palette.primary.main;
    }
    if (isDragReject) {
      return theme.palette.error.main;
    }
    return theme.palette.divider;
  };

  return (
    <Box sx={{ width: "100%" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        component={motion.div}
        whileHover={{ boxShadow: theme.shadows[3] }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          border: `2px dashed ${getBorderColor()}`,
          borderRadius: 2,
          backgroundColor: getBackgroundColor(),
          transition: "background-color 0.3s, border-color 0.3s",
          p: 3,
          mb: 2,
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 2,
          }}
        >
          {isLoading ? (
            <CircularProgress size={50} sx={{ mb: 2 }} />
          ) : (
            <CloudUploadIcon
              sx={{
                fontSize: 50,
                color: isDragReject
                  ? theme.palette.error.main
                  : isDragActive
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                mb: 1,
              }}
            />
          )}

          <Typography variant="h6" component="h2" gutterBottom>
            {isDragActive
              ? isDragReject
                ? "File type not supported"
                : "Drop files here"
              : "Upload Financial Data"}
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 500, mb: 2 }}>
            {helperText}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Supported formats:
            </Typography>
            {supportedFileTypes.map((type) => (
              <Tooltip key={type} title={`.${type.toUpperCase()} files`}>
                <Box
                  component="span"
                  sx={{
                    bgcolor: theme.palette.action.hover,
                    color: theme.palette.text.primary,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    fontWeight: "medium",
                    textTransform: "uppercase",
                  }}
                >
                  {type}
                </Box>
              </Tooltip>
            ))}
          </Box>

          <Button
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 2 }}
            startIcon={<CloudUploadIcon />}
          >
            Select Files
          </Button>
        </Box>
      </Paper>

      {files.length > 0 && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}
          >
            <Typography variant="subtitle1" component="h3">
              {files.length} {files.length === 1 ? "file" : "files"} ready for processing
            </Typography>
            <Tooltip title="Learn about file processing">
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <List dense>
            {files.map((file, index) => (
              <ListItem
                key={`${file.name}-${index}`}
                secondaryAction={
                  <IconButton edge="end" onClick={() => removeFile(index)} disabled={isLoading}>
                    <DeleteIcon />
                  </IconButton>
                }
                component={motion.li}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                sx={{
                  bgcolor: theme.palette.background.default,
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemIcon>{getFileIcon(file.name)}</ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  primaryTypographyProps={{
                    sx: {
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default FileUpload;
