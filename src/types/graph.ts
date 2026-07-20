// Graph node types and structures
export type NodeType =
  | 'transaction'
  | 'risk_assessment'
  | 'compliance_check'
  | 'rule_execution'
  | 'decision'
  | 'human_approval'
  | 'remediation';

export type DomainEntityType = 'transaction' | 'customer' | 'rule' | 'policy' | 'decision_outcome';

export type EdgeType =
  | 'triggers'
  | 'influences'
  | 'depends_on'
  | 'contradicts'
  | 'supports'
  | 'overrides'
  | 'escalates_to';

export interface GraphNode {
  id: string;
  node_id: string;
  node_type: NodeType;
  label: string;
  domain_entity_type: DomainEntityType;
  in_degree: number;
  out_degree: number;
  depth_from_source: number;
  centrality_score: number;
  created_at: Date;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: EdgeType;
  weight: number;
  created_at: Date;
  metadata: Record<string, any>;
}

export interface DecisionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    created_at: Date;
    total_nodes: number;
    total_edges: number;
    source_node_id: string;
    sink_node_id: string;
  };
}

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

export const NODE_COLORS: Record<NodeType, string> = {
  transaction: '#4A90E2',
  risk_assessment: '#FF6B6B',
  compliance_check: '#27AE60',
  rule_execution: '#F5A623',
  decision: '#9B59B6',
  human_approval: '#3498DB',
  remediation: '#E74C3C',
};

export const EDGE_COLORS: Record<EdgeType, string> = {
  triggers: '#4A90E2',
  influences: '#F5A623',
  depends_on: '#27AE60',
  contradicts: '#E74C3C',
  supports: '#95E1D3',
  overrides: '#FF6B6B',
  escalates_to: '#9B59B6',
};

export const NODE_ICONS: Record<NodeType, string> = {
  transaction: '💳',
  risk_assessment: '⚠️',
  compliance_check: '✓',
  rule_execution: '⚙️',
  decision: '🎯',
  human_approval: '👤',
  remediation: '🔧',
};
