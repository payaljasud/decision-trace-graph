export interface Decision {
  id: string;
  transaction_id: string;
  decision_outcome: 'approved' | 'rejected' | 'escalated';
  confidence: number;
  made_at: Date;
  decision_rules: string[];
}

export interface DecisionMetrics {
  total_decisions: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  success_rate: number;
  avg_confidence: number;
}
