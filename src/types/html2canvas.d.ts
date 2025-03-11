/**
 * Type definitions for html2canvas library
 * This is a simplified version for our specific use cases in ExportPage
 */

declare module "html2canvas" {
  export interface Html2CanvasOptions {
    /**
     * Whether to allow mixed content
     */
    allowTaint?: boolean;

    /**
     * Whether to use CORS for images
     */
    useCORS?: boolean;

    /**
     * Scale factor for rendering
     */
    scale?: number;

    /**
     * Whether to log debug information
     */
    logging?: boolean;

    /**
     * Background color
     */
    backgroundColor?: string;

    /**
     * X coordinate to start drawing from
     */
    x?: number;

    /**
     * Y coordinate to start drawing from
     */
    y?: number;

    /**
     * Width of the canvas
     */
    width?: number;

    /**
     * Height of the canvas
     */
    height?: number;

    /**
     * Additional options
     */
    [key: string]: any;
  }

  /**
   * Renders an HTML element to a canvas
   * @param element - The HTML element to render
   * @param options - Rendering options
   * @returns A Promise that resolves with the canvas
   */
  export default function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;
}
