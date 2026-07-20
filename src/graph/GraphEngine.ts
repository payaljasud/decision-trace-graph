import { GraphNode, GraphEdge, DecisionGraph, EdgeType } from '@/types/graph';

export class GraphEngine {
  private nodes: GraphNode[];
  private edges: GraphEdge[];
  private adjacencyList: Map<string, string[]>;
  private reverseAdjacencyList: Map<string, string[]>;

  constructor(nodes: GraphNode[], edges: GraphEdge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.adjacencyList = new Map();
    this.reverseAdjacencyList = new Map();
    this.buildAdjacencyLists();
  }

  private buildAdjacencyLists(): void {
    // Initialize
    this.nodes.forEach((node) => {
      this.adjacencyList.set(node.id, []);
      this.reverseAdjacencyList.set(node.id, []);
    });

    // Build lists
    this.edges.forEach((edge) => {
      const sourceEdges = this.adjacencyList.get(edge.source_node_id) || [];
      sourceEdges.push(edge.target_node_id);
      this.adjacencyList.set(edge.source_node_id, sourceEdges);

      const targetEdges = this.reverseAdjacencyList.get(edge.target_node_id) || [];
      targetEdges.push(edge.source_node_id);
      this.reverseAdjacencyList.set(edge.target_node_id, targetEdges);
    });
  }

  getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.find((n) => n.id === nodeId);
  }

  getEdge(sourceId: string, targetId: string): GraphEdge | undefined {
    return this.edges.find((e) => e.source_node_id === sourceId && e.target_node_id === targetId);
  }

  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return this.edges.filter((e) => e.source_node_id === nodeId);
  }

  getIncomingEdges(nodeId: string): GraphEdge[] {
    return this.edges.filter((e) => e.target_node_id === nodeId);
  }

  getDownstream(nodeId: string): GraphNode[] {
    const visited = new Set<string>();
    const result: GraphNode[] = [];

    const dfs = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const node = this.getNode(id);
      if (node) result.push(node);

      const outgoing = this.adjacencyList.get(id) || [];
      outgoing.forEach((targetId) => dfs(targetId));
    };

    dfs(nodeId);
    return result.filter((n) => n.id !== nodeId);
  }

  getUpstream(nodeId: string): GraphNode[] {
    const visited = new Set<string>();
    const result: GraphNode[] = [];

    const dfs = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const node = this.getNode(id);
      if (node) result.push(node);

      const incoming = this.reverseAdjacencyList.get(id) || [];
      incoming.forEach((sourceId) => dfs(sourceId));
    };

    dfs(nodeId);
    return result.filter((n) => n.id !== nodeId);
  }

  getPath(sourceId: string, targetId: string): GraphNode[] {
    const queue: { id: string; path: string[] }[] = [{ id: sourceId, path: [sourceId] }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;

      if (id === targetId) {
        return path.map((nodeId) => this.getNode(nodeId)!).filter((n) => n);
      }

      if (visited.has(id)) continue;
      visited.add(id);

      const outgoing = this.adjacencyList.get(id) || [];
      outgoing.forEach((targetId) => {
        if (!visited.has(targetId)) {
          queue.push({ id: targetId, path: [...path, targetId] });
        }
      });
    }

    return [];
  }

  getAllPaths(sourceId: string, targetId: string, maxDepth: number = 10): GraphNode[][] {
    const allPaths: GraphNode[][] = [];

    const dfs = (currentId: string, path: string[], visited: Set<string>, depth: number) => {
      if (depth > maxDepth) return;

      if (currentId === targetId) {
        allPaths.push(path.map((id) => this.getNode(id)!).filter((n) => n));
        return;
      }

      const outgoing = this.adjacencyList.get(currentId) || [];
      outgoing.forEach((nextId) => {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          dfs(nextId, [...path, nextId], visited, depth + 1);
          visited.delete(nextId);
        }
      });
    };

    dfs(sourceId, [sourceId], new Set([sourceId]), 0);
    return allPaths;
  }

  getGraphStatistics(): {
    total_nodes: number;
    total_edges: number;
    max_depth: number;
    graph_density: number;
    avg_degree: number;
  } {
    const maxDepth = Math.max(...this.nodes.map((n) => n.depth_from_source), 0);
    const graphDensity = this.edges.length / (this.nodes.length * (this.nodes.length - 1));
    const avgDegree = (this.edges.length * 2) / this.nodes.length;

    return {
      total_nodes: this.nodes.length,
      total_edges: this.edges.length,
      max_depth: maxDepth,
      graph_density: graphDensity,
      avg_degree: avgDegree,
    };
  }

  getNodesByType(nodeType: string): GraphNode[] {
    return this.nodes.filter((n) => n.node_type === nodeType);
  }

  getEdgesByType(edgeType: EdgeType): GraphEdge[] {
    return this.edges.filter((e) => e.edge_type === edgeType);
  }

  getMostCentralNodes(count: number = 10): GraphNode[] {
    return [...this.nodes]
      .sort((a, b) => b.centrality_score - a.centrality_score)
      .slice(0, count);
  }
}
