/**
 * Type definitions for XLSX library
 * This is a simplified version for our specific use cases in ExportPage
 */

declare module "xlsx" {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
    Props?: any;
    Custprops?: any;
    Workbook?: any;
    vbaraw?: any;
  }

  export interface WorkSheet {
    [cell: string]: CellObject | any;
  }

  export interface CellObject {
    t: string; // Cell type
    v: any; // Cell value
    r?: string; // Rich text
    h?: string; // HTML rendering
    w?: string; // Formatted text
    f?: string; // Formula
    c?: any[]; // Comments
    z?: string; // Number format
    l?: any; // Cell hyperlink
    s?: any; // Style/theme
  }

  export interface WritingOptions {
    type?: string;
    bookType?: string;
    bookSST?: boolean;
    sheet?: string;
    compression?: boolean;
    Props?: any;
    Custprops?: any;
    ignoreEC?: boolean;
  }

  /**
   * Creates a new workbook
   */
  export function utils_book_new(): WorkBook;

  /**
   * Converts an array of JS objects to a worksheet
   */
  export function utils_json_to_sheet<T>(data: T[], opts?: any): WorkSheet;

  /**
   * Adds a worksheet to a workbook
   */
  export function utils_book_append_sheet(
    workbook: WorkBook,
    worksheet: WorkSheet,
    name: string
  ): void;

  /**
   * Writes a workbook to a file
   */
  export function writeFile(workbook: WorkBook, filename: string, opts?: WritingOptions): void;

  /**
   * Writes a workbook to a file (alias for writeFile)
   */
  export function write(workbook: WorkBook, opts?: WritingOptions): any;

  /**
   * Reads a workbook from a file
   */
  export function readFile(filename: string, opts?: any): WorkBook;

  /**
   * Object aliases for workbook functions
   */
  export const utils: {
    book_new: typeof utils_book_new;
    json_to_sheet: typeof utils_json_to_sheet;
    book_append_sheet: typeof utils_book_append_sheet;
  };
}
