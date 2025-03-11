/**
 * Project-related type definitions
 */

/**
 * Represents a renewable energy project
 */
export interface Project {
  /**
   * Project name
   */
  name: string;

  /**
   * Project type (e.g., "Solar PV", "On-shore Wind", "Off-shore Wind")
   */
  type: string;

  /**
   * Project country
   */
  country: string;

  /**
   * Project status (e.g., "Planning", "Development", "Operating")
   */
  status: string;

  /**
   * Capacity in MW
   */
  capacity: number;

  /**
   * Total investment cost
   */
  investmentCost: number;

  /**
   * Equity investment
   */
  equity: number;

  /**
   * Annual revenue
   */
  revenue: number;

  /**
   * Annual EBITDA
   */
  ebitda: number;

  /**
   * Annual profit
   */
  profit: number;

  /**
   * Yield on cost
   */
  yieldOnCost: number;

  /**
   * Internal rate of return (IRR)
   */
  irr: number;

  /**
   * Cash return
   */
  cashReturn: number;

  /**
   * Location as [longitude, latitude]
   */
  location: [number, number];

  /**
   * Optional additional properties
   */
  [key: string]: any;
}
