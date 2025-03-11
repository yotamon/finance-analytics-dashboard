/**
 * UI component type definitions
 */

import { ReactNode } from "react";
import { SxProps, Theme } from "@mui/material";

/**
 * Common props shared by many components
 */
export interface CommonComponentProps {
  /**
   * Optional CSS class name
   */
  className?: string;

  /**
   * Optional inline styles
   */
  style?: React.CSSProperties;

  /**
   * Material UI's sx prop for styling
   */
  sx?: SxProps<Theme>;

  /**
   * Component ID
   */
  id?: string;
}

/**
 * Card component props
 */
export interface CardProps extends CommonComponentProps {
  /**
   * Card title
   */
  title?: string;

  /**
   * Card subtitle
   */
  subtitle?: string;

  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Optional header actions (usually buttons/icons)
   */
  headerActions?: ReactNode;

  /**
   * Optional footer content
   */
  footer?: ReactNode;

  /**
   * Whether the card is in loading state
   */
  isLoading?: boolean;

  /**
   * Optional error message
   */
  error?: string | null;

  /**
   * Whether the card can be expanded/collapsed
   */
  expandable?: boolean;

  /**
   * Whether the card is initially expanded (only used if expandable=true)
   */
  defaultExpanded?: boolean;
}

/**
 * Button variants
 */
export type ButtonVariant = "contained" | "outlined" | "text";

/**
 * Button sizes
 */
export type ButtonSize = "small" | "medium" | "large";

/**
 * Button colors
 */
export type ButtonColor = "primary" | "secondary" | "success" | "error" | "info" | "warning";

/**
 * Button props
 */
export interface ButtonProps extends CommonComponentProps {
  /**
   * Button label
   */
  label: string;

  /**
   * Optional icon to display
   */
  icon?: ReactNode;

  /**
   * Button variant
   */
  variant?: ButtonVariant;

  /**
   * Button color
   */
  color?: ButtonColor;

  /**
   * Button size
   */
  size?: ButtonSize;

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;

  /**
   * Whether the button shows a loading indicator
   */
  loading?: boolean;

  /**
   * Function to call when button is clicked
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Whether to display the icon after the label
   */
  iconPosition?: "start" | "end";

  /**
   * For full-width buttons
   */
  fullWidth?: boolean;
}

/**
 * Dialog (modal) props
 */
export interface DialogProps extends CommonComponentProps {
  /**
   * Dialog title
   */
  title: string;

  /**
   * Dialog content
   */
  children: ReactNode;

  /**
   * Whether the dialog is currently open
   */
  open: boolean;

  /**
   * Function to call when dialog should close
   */
  onClose: () => void;

  /**
   * Maximum width of the dialog
   */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";

  /**
   * Whether the dialog takes up the full width
   */
  fullWidth?: boolean;

  /**
   * Actions to display at bottom of dialog
   */
  actions?: ReactNode;

  /**
   * Whether to show close button in title
   */
  showCloseButton?: boolean;
}

/**
 * Grid layout item
 */
export interface GridItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * X position
   */
  x: number;

  /**
   * Y position
   */
  y: number;

  /**
   * Width in grid units
   */
  w: number;

  /**
   * Height in grid units
   */
  h: number;

  /**
   * Item content
   */
  content: ReactNode;

  /**
   * Whether item can be dragged
   */
  isDraggable?: boolean;

  /**
   * Whether item can be resized
   */
  isResizable?: boolean;

  /**
   * Minimum width
   */
  minW?: number;

  /**
   * Minimum height
   */
  minH?: number;
}

/**
 * Tab item definition
 */
export interface TabItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Tab label
   */
  label: string;

  /**
   * Optional icon
   */
  icon?: ReactNode;

  /**
   * Tab content
   */
  content: ReactNode;

  /**
   * Whether tab is disabled
   */
  disabled?: boolean;
}

/**
 * Menu item definition
 */
export interface MenuItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Menu item label
   */
  label: string;

  /**
   * Optional icon
   */
  icon?: ReactNode;

  /**
   * Function to call when item is clicked
   */
  onClick?: () => void;

  /**
   * Whether item is disabled
   */
  disabled?: boolean;

  /**
   * Divider below the item
   */
  divider?: boolean;

  /**
   * Nested menu items
   */
  children?: MenuItem[];
}

/**
 * Toast notification type
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Toast notification
 */
export interface Toast {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Message to display
   */
  message: string;

  /**
   * Toast type
   */
  type: ToastType;

  /**
   * How long to display the toast (ms)
   */
  duration?: number;

  /**
   * Optional action text
   */
  actionText?: string;

  /**
   * Function to call when action is clicked
   */
  onAction?: () => void;
}
