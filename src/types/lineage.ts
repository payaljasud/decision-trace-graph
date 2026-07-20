import { GraphNode, GraphEdge } from './graph';

export interface LineageNode {
  node: GraphNode;
  incoming_edges: GraphEdge[];
  outgoing_edges: GraphEdge[];
  ancestors: GraphNode[];
  descendants: GraphNode[];
}

export interface LineageJourney {
  source_node: GraphNode;
  target_node: GraphNode;
  path_nodes: GraphNode[];
  path_edges: GraphEdge[];
  complete_ancestors: GraphNode[];
  complete_descendants: GraphNode[];
  critical_path: GraphNode[];
}

export interface LineageTrace {
  source_node_id: string;
  target_node_id: string;
  path: string[];
  distance: number;
}
