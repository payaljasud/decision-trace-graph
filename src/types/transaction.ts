import { GraphNode, GraphEdge, DecisionGraph, NodeType, EdgeType } from './graph';

export interface TransactionData {
  transaction_id: string;
  amount: number;
  currency: string;
  transaction_type: string;
  beneficiary: string;
  originator: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
}

export interface RiskAssessment {
  id: string;
  transaction_id: string;
  risk_score: number; // 0-10
  risk_category: 'low' | 'medium' | 'high';
  risk_factors: string[];
  assessed_at: Date;
}

export interface ComplianceCheckResult {
  id: string;
  transaction_id: string;
  rule_id: string;
  passed: boolean;
  checked_at: Date;
}

export interface Decision {
  id: string;
  transaction_id: string;
  decision_outcome: 'approved' | 'rejected' | 'escalated';
  confidence: number; // 0-100
  made_at: Date;
  decision_rules: string[];
}

export interface HumanApproval {
  id: string;
  transaction_id: string;
  approver_name: string;
  approved_at: Date;
  approval_status: 'approved' | 'rejected';
  comments: string;
}

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

export interface Approval {
  id: string;
  transaction_id: string;
  approver_name: string;
  approved_at: Date;
  approval_status: 'approved' | 'rejected';
}

export type Transaction = TransactionData;
