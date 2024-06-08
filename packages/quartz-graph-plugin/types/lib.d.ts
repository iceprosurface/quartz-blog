import * as d3 from 'd3';
type NodeData = {
    id: string;
    text: string;
    tags: string[];
    r?: number;
} & d3.SimulationNodeDatum;
type LinkData = {
    source: string;
    target: string;
};
export declare function renderGraph(container: HTMLElement, cfg: {
    graphData: {
        nodes: NodeData[];
        links: LinkData[];
    };
    slug: string;
    onNodeClick: (node: NodeData) => void;
    visited: Set<string>;
    enableDrag?: boolean;
    enableZoom?: boolean;
    depth?: number;
    scale?: number;
    repelForce?: number;
    centerForce?: number;
    linkDistance?: number;
    fontSize?: number;
    opacityScale?: number;
    focusOnHover?: boolean;
}): Promise<void>;
export {};
