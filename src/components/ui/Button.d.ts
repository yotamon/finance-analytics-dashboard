import { ReactNode, RefObject, ForwardRefExoticComponent, RefAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps {
  /**
   * Button content
   */
  children: ReactNode;

  /**
   * Button variant
   * @default "primary"
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default "medium"
   */
  size?: ButtonSize;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Whether the button is in loading state
   */
  isLoading?: boolean;

  /**
   * Icon to display
   */
  icon?: ReactNode;

  /**
   * Position of the icon
   * @default "left"
   */
  iconPosition?: "left" | "right";

  /**
   * Whether the button should take full width
   */
  fullWidth?: boolean;

  /**
   * Whether to show gradient background (primary variant only)
   */
  gradient?: boolean;

  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;

  /**
   * Any other props to pass to the underlying button element
   */
  [key: string]: any;
}

/**
 * Button component
 */
declare const Button: ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>;

export default Button;
