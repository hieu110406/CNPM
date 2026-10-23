export type MapGraphNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  category?: string;
};

export type MapGraphPoi = {
  id: string;
  name?: string;
  x: number | string;
  y: number | string;
  type?: string;
  category?: string;
  waypoint_id?: string;
};

export type MapGraphPath = {
  path: MapGraphNode[];
  totalDistance: number;
  stepsCount: number;
};

export const WAYPOINTS: MapGraphNode[];
export const EDGES: [string, string][];
export function buildGraph(pois?: MapGraphPoi[]): {
  graph: Map<string, { to: string; weight: number }[]>;
  nodes: Map<string, MapGraphNode>;
};
export function shortestPath(fromPoiId: string, toPoiId: string): MapGraphPath | null;
