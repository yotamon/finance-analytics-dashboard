import { ReactNode } from "react";
import { ContainerProps as MuiContainerProps } from "@mui/material";

/**
 * Size options for the Container component
 */
export type ContainerSize = "default" | "small" | "large";

/**
 * Props for the Container component
 */
export interface ContainerProps extends Omit<MuiContainerProps, "maxWidth"> {
  /**
   * Container content
   */
  children: ReactNode;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Container size which maps to Material UI maxWidth
   * @default "default"
   */
  size?: ContainerSize;

  /**
   * Whether to apply animation when the container mounts
   * @default false
   */
  animate?: boolean;
}

/**
 * Container component that wraps Material UI Container
 * Provides consistent container sizing across the application
 */
declare const Container: React.FC<ContainerProps>;

export default Container;
