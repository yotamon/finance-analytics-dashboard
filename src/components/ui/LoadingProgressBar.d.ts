import { ReactNode } from "react";
import { DataLoadingState } from "../../context/DataContext";

/**
 * Props for the LoadingProgressBar component
 */
export interface LoadingProgressBarProps {
  /**
   * The current loading state from DataContext
   */
  loadingState: DataLoadingState;

  /**
   * The current progress percentage (0-100)
   */
  progress: number;

  /**
   * Optional custom message to display
   */
  message?: string;

  /**
   * Whether to automatically hide when loading is complete
   * @default true
   */
  autoHide?: boolean;
}

/**
 * Component that displays a loading progress bar with status text
 * Shows different colors and messages based on the loading state
 */
declare const LoadingProgressBar: React.FC<LoadingProgressBarProps>;

export default LoadingProgressBar;
