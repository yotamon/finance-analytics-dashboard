declare module "d3-sankey" {
  export interface SankeyNodeMinimal {
    name?: string;
    [key: string]: any;
  }

  export interface SankeyLinkMinimal {
    source: string | number | SankeyNodeMinimal;
    target: string | number | SankeyNodeMinimal;
    value: number;
    [key: string]: any;
  }

  export interface SankeyGraph<N extends SankeyNodeMinimal, L extends SankeyLinkMinimal> {
    nodes: N[];
    links: L[];
  }

  export interface SankeyNode extends SankeyNodeMinimal {
    x0?: number;
    y0?: number;
    x1?: number;
    y1?: number;
    value?: number;
    index?: number;
  }

  export interface SankeyLink extends SankeyLinkMinimal {
    width?: number;
    y0?: number;
    y1?: number;
  }

  export interface SankeyLayout<N extends SankeyNodeMinimal, L extends SankeyLinkMinimal> {
    (graph: SankeyGraph<N, L>): SankeyGraph<N & SankeyNode, L & SankeyLink>;
    nodeWidth(): number;
    nodeWidth(width: number): this;
    nodePadding(): number;
    nodePadding(padding: number): this;
    extent(): [[number, number], [number, number]];
    extent(extent: [[number, number], [number, number]]): this;
    size(): [number, number];
    size(size: [number, number]): this;
    iterations(): number;
    iterations(iterations: number): this;
  }

  export function sankey<N extends SankeyNodeMinimal, L extends SankeyLinkMinimal>(): SankeyLayout<
    N,
    L
  >;

  export function sankeyLinkHorizontal(): (link: any) => string;

  export function sankeyLeft(): SankeyNodePositioner;
  export function sankeyRight(): SankeyNodePositioner;
  export function sankeyCenter(): SankeyNodePositioner;
  export function sankeyJustify(): SankeyNodePositioner;

  export type SankeyNodePositioner = (node: SankeyNode, n: number) => number;
}
