import { GraphEngine } from './GraphEngine';
import { GraphNode, GraphEdge } from '@/types/graph';
import { LineageJourney } from '@/types/lineage';

export class LineageTracer {
  private engine: GraphEngine;

  constructor(engine: GraphEngine) {
    this.engine = engine;
  }

  getCompleteLineage(nodeId: string): LineageJourney {
    const node = this.engine.getNode(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    const ancestors = this.engine.getUpstream(nodeId);
    const descendants = this.engine.getDownstream(nodeId);

    // Find source (first transaction node)
    const sourceNode = ancestors[ancestors.length - 1] || node;
    const sinkNode = descendants[descendants.length - 1] || node;

    const pathToNode = this.engine.getPath(sourceNode.id, nodeId);
    const pathFromNode = this.engine.getPath(nodeId, sinkNode.id);
    const completePath = this.engine.getPath(sourceNode.id, sinkNode.id);

    const pathEdges: GraphEdge[] = [];
    for (let i = 0; i < completePath.length - 1; i++) {
      const edge = this.engine.getEdge(completePath[i].id, completePath[i + 1].id);
      if (edge) pathEdges.push(edge);
    }

    return {
      source_node: sourceNode,
      target_node: sinkNode,
      path_nodes: completePath,
      path_edges: pathEdges,
      complete_ancestors: ancestors,
      complete_descendants: descendants,
      critical_path: completePath,
    };
  }

  getImpactAnalysis(nodeId: string): {
    direct_impact: GraphNode[];
    indirect_impact: GraphNode[];
    impact_chain: GraphNode[][];
  } {
    const directImpact = this.engine
      .getOutgoingEdges(nodeId)
      .map((e) => this.engine.getNode(e.target_node_id))
      .filter((n): n is GraphNode => n !== undefined);

    const indirectImpact = this.engine.getDownstream(nodeId);

    const allPaths = this.engine.getAllPaths(nodeId, '', 5);

    return {
      direct_impact: directImpact,
      indirect_impact: indirectImpact,
      impact_chain: allPaths,
    };
  }

  getRootCauses(nodeId: string): GraphNode[] {
    const ancestors = this.engine.getUpstream(nodeId);
    // Root causes are ancestors with in_degree of 0
    return ancestors.filter((n) => n.in_degree === 0);
  }

  getContributingFactors(nodeId: string, maxDepth: number = 3): GraphNode[] {
    const ancestors = this.engine.getUpstream(nodeId);
    return ancestors
      .filter((n) => n.depth_from_source >= nodeId.length - maxDepth)
      .sort((a, b) => b.centrality_score - a.centrality_score);
  }

  traceDecisionJourney(transactionId: string, decisionNodeId: string): {
    journey: GraphNode[];
    influencing_factors: GraphNode[];
    blocking_factors: GraphNode[];
  } {
    const journey = this.getCompleteLineage(decisionNodeId);
    const influencingFactors = journey.complete_ancestors.filter(
      (n) => n.node_type === 'risk_assessment' || n.node_type === 'compliance_check'
    );
    const blockingFactors = journey.complete_ancestors.filter(
      (n) => n.node_type === 'risk_assessment' && n.properties?.risk_score > 7
    );

    return {
      journey: journey.critical_path,
      influencing_factors: influencingFactors,
      blocking_factors: blockingFactors,
    };
  }
}
