export interface FiredRule {
  rule_name: string;
  fired: boolean;
  confidence: number;
  contribution_score: number;
}

export interface PathExplanation {
  edge_order: number;
  source_label: string;
  target_label: string;
  explanation_text: string;
}

export interface ExplainabilityTrace {
  summary: string;
  justification: string;
  overall_explainability_score: number;
  rule_confidence: number;
  traceability: number;
  fired_rules: FiredRule[];
  path_explanation: PathExplanation[];
}

export interface ExplainabilityMetrics {
  explainability_score: number;
  rule_coverage: number;
  traceability_percentage: number;
  decision_confidence: number;
}
