/**
 * Type definitions for jsPDF library
 * This is a simplified version for our specific use cases in ExportPage
 */

declare module "jspdf" {
  export type Orientation = "p" | "portrait" | "l" | "landscape";
  export type Unit = "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";
  export type Format =
    | "a0"
    | "a1"
    | "a2"
    | "a3"
    | "a4"
    | "a5"
    | "a6"
    | "a7"
    | "a8"
    | "a9"
    | "a10"
    | "b0"
    | "b1"
    | "b2"
    | "b3"
    | "b4"
    | "b5"
    | "b6"
    | "b7"
    | "b8"
    | "b9"
    | "b10"
    | "c0"
    | "c1"
    | "c2"
    | "c3"
    | "c4"
    | "c5"
    | "c6"
    | "c7"
    | "c8"
    | "c9"
    | "c10"
    | "dl"
    | "letter"
    | "government-letter"
    | "legal"
    | "junior-legal"
    | "ledger"
    | "tabloid"
    | "credit-card"
    | [number, number];

  export interface JsPDFOptions {
    orientation?: Orientation;
    unit?: Unit;
    format?: Format;
    hotfixes?: string[];
    encryption?: {
      userPassword?: string;
      ownerPassword?: string;
      userPermissions?: string[];
    };
    compression?: boolean;
    precision?: number;
    filters?: string[];
  }

  export default class JsPDF {
    constructor(options?: JsPDFOptions);
    constructor(orientation?: Orientation, unit?: Unit, format?: Format, hotfixes?: string[]);

    /**
     * Adds text to the PDF
     */
    text(text: string | string[], x: number, y: number, options?: any): JsPDF;

    /**
     * Adds a line to the PDF
     */
    line(x1: number, y1: number, x2: number, y2: number, style?: any): JsPDF;

    /**
     * Adds an image to the PDF
     */
    addImage(
      imageData: string | HTMLElement | HTMLCanvasElement | Uint8Array,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number,
      alias?: string,
      compression?: string,
      rotation?: number
    ): JsPDF;

    /**
     * Adds a new page to the PDF
     */
    addPage(format?: Format, orientation?: Orientation): JsPDF;

    /**
     * Sets the font for text
     */
    setFont(fontName: string, fontStyle?: string): JsPDF;

    /**
     * Sets the font size
     */
    setFontSize(size: number): JsPDF;

    /**
     * Sets the text color
     */
    setTextColor(r: number, g?: number, b?: number): JsPDF;

    /**
     * Sets the stroke color
     */
    setDrawColor(r: number, g?: number, b?: number): JsPDF;

    /**
     * Sets the fill color
     */
    setFillColor(r: number, g?: number, b?: number): JsPDF;

    /**
     * Sets the line width
     */
    setLineWidth(width: number): JsPDF;

    /**
     * Saves the PDF as a file with the given filename
     */
    save(filename: string): JsPDF;

    /**
     * Outputs the PDF in different formats
     */
    output(type?: string, options?: any): any;
  }
}
