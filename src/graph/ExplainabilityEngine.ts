import { GraphEngine } from './GraphEngine';
import { LineageTracer } from './LineageTracer';
import { ExplainabilityTrace, FiredRule, PathExplanation } from '@/types/explainability';

export class ExplainabilityEngine {
  private graphEngine: GraphEngine;
  private lineageTracer: LineageTracer;

  constructor(graphEngine: GraphEngine, lineageTracer: LineageTracer) {
    this.graphEngine = graphEngine;
    this.lineageTracer = lineageTracer;
  }

  explainDecision(decisionNodeId: string): ExplainabilityTrace {
    const decisionNode = this.graphEngine.getNode(decisionNodeId);
    if (!decisionNode) throw new Error(`Decision node ${decisionNodeId} not found`);

    const lineage = this.lineageTracer.getCompleteLineage(decisionNodeId);
    const rootCauses = this.lineageTracer.getRootCauses(decisionNodeId);
    const impactAnalysis = this.lineageTracer.getImpactAnalysis(decisionNodeId);

    // Get all rule execution nodes
    const ruleNodes = lineage.complete_ancestors.filter((n) => n.node_type === 'rule_execution');
    const firedRules = ruleNodes.map((ruleNode) => this.explainRule(ruleNode));

    // Build path explanation
    const pathExplanation = this.buildPathExplanation(lineage.critical_path);

    // Calculate metrics
    const explainabilityScore = this.calculateExplainabilityScore(lineage);
    const ruleConfidence = this.calculateRuleConfidence(firedRules);
    const traceability = this.calculateTraceability(lineage);

    // Generate summary
    const summary = this.generateSummary(
      decisionNode,
      rootCauses,
      firedRules,
      lineage.critical_path.length
    );

    const justification = this.generateJustification(
      decisionNode,
      rootCauses,
      firedRules,
      lineage.complete_ancestors
    );

    return {
      summary,
      justification,
      overall_explainability_score: explainabilityScore,
      rule_confidence: ruleConfidence,
      traceability,
      fired_rules: firedRules,
      path_explanation: pathExplanation,
    };
  }

  private explainRule(ruleNode: any): FiredRule {
    return {
      rule_name: ruleNode.properties?.rule_name || `Rule ${ruleNode.node_id.substring(0, 8)}`,
      fired: ruleNode.properties?.fired || false,
      confidence: ruleNode.properties?.confidence || 0.85,
      contribution_score: (ruleNode.properties?.confidence || 0.85) * ruleNode.centrality_score,
    };
  }

  private buildPathExplanation(pathNodes: any[]): PathExplanation[] {
    const explanations: PathExplanation[] = [];

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const source = pathNodes[i];
      const target = pathNodes[i + 1];
      const edge = this.graphEngine.getEdge(source.id, target.id);

      explanations.push({
        edge_order: i,
        source_label: source.label,
        target_label: target.label,
        explanation_text: this.generateEdgeExplanation(source, target, edge),
      });
    }

    return explanations;
  }

  private generateEdgeExplanation(source: any, target: any, edge: any): string {
    const edgeType = edge?.edge_type || 'influences';
    const sourceType = source.node_type.replace(/_/g, ' ');
    const targetType = target.node_type.replace(/_/g, ' ');

    const explanations: Record<string, string> = {
      triggers: `${sourceType} triggers the ${targetType}`,
      influences: `${sourceType} influences the ${targetType}`,
      depends_on: `${targetType} depends on ${sourceType}`,
      supports: `${sourceType} supports the ${targetType}`,
      contradicts: `${sourceType} contradicts the ${targetType}`,
      overrides: `${sourceType} overrides the ${targetType}`,
      escalates_to: `${sourceType} escalates to ${targetType}`,
    };

    return explanations[edgeType] || `${sourceType} connects to ${targetType}`;
  }

  private calculateExplainabilityScore(lineage: any): number {
    const pathLength = lineage.critical_path.length;
    const ancestorCount = lineage.complete_ancestors.length;
    const hasRuleExecution = lineage.complete_ancestors.some((n: any) => n.node_type === 'rule_execution');

    let score = 50; // Base score
    score += Math.min(pathLength * 3, 20); // Path clarity
    score += hasRuleExecution ? 20 : 0; // Rule-based decisions
    score += Math.min(ancestorCount, 10); // Complete lineage

    return Math.min(score, 100);
  }

  private calculateRuleConfidence(firedRules: FiredRule[]): number {
    if (firedRules.length === 0) return 0;
    const avgConfidence = firedRules.reduce((sum, r) => sum + r.confidence, 0) / firedRules.length;
    return Math.round(avgConfidence * 100);
  }

  private calculateTraceability(lineage: any): number {
    const pathLength = lineage.critical_path.length;
    const ancestorCount = lineage.complete_ancestors.length;
    return Math.min((pathLength + ancestorCount) * 5, 100);
  }

  private generateSummary(
    decisionNode: any,
    rootCauses: any[],
    firedRules: FiredRule[],
    pathLength: number
  ): string {
    const outcome = decisionNode.properties?.decision_outcome || 'made';
    const ruleCount = firedRules.filter((r) => r.fired).length;

    return `Decision was ${outcome} based on ${ruleCount} fired rules and ${rootCauses.length} root cause(s). The decision path spans ${pathLength} steps.`;
  }

  private generateJustification(
    decisionNode: any,
    rootCauses: any[],
    firedRules: FiredRule[],
    ancestors: any[]
  ): string {
    const firedRuleNames = firedRules
      .filter((r) => r.fired)
      .map((r) => r.rule_name)
      .join(', ');

    const rootCauseTypes = [...new Set(rootCauses.map((n) => n.node_type))]
      .map((t) => t.replace(/_/g, ' '))
      .join(', ');

    return `The decision was based on the following factors: ${firedRuleNames}. Root causes include: ${rootCauseTypes || 'transaction initiation'}. The decision considered ${ancestors.length} upstream factors to reach this conclusion.`;
  }
}
