export interface Rule {
  id: string;
  rule_name: string;
  description: string;
  rule_condition: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  active: boolean;
  created_at: Date;
}

export interface RuleExecution {
  id: string;
  rule_id: string;
  transaction_id: string;
  fired: boolean;
  confidence: number;
  executed_at: Date;
}
