import { Injectable } from '@nestjs/common';
import { RuleActionType } from '@pharmapos/shared';

export interface RuleCondition {
  op: 'AND' | 'OR' | 'NOT' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ' | 'NEQ' | 'IN' | 'NOT_IN' | 'IS_NULL' | 'IS_NOT_NULL';
  field?: string;
  value?: unknown;
  conditions?: RuleCondition[];
}

export interface RuleAction {
  type: RuleActionType;
  message: string;
  messageAr: string;
  field?: string;
  value?: unknown;
}

export interface RuleDefinition {
  id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  priority: number;
  isActive: boolean;
}

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  action: RuleAction;
}

export interface EvaluationResult {
  violations: RuleViolation[];
  hasBlocker: boolean;
}

@Injectable()
export class RulesEngineService {
  /**
   * Evaluate rules against a context object.
   * Rules are sorted by priority DESC — highest priority evaluated first.
   * BLOCK actions stop evaluation immediately.
   */
  evaluate(rules: RuleDefinition[], context: Record<string, unknown>): EvaluationResult {
    const sorted = [...rules].filter((r) => r.isActive).sort((a, b) => b.priority - a.priority);
    const violations: RuleViolation[] = [];
    let hasBlocker = false;

    for (const rule of sorted) {
      const matches = this.evaluateCondition(rule.condition, context);
      if (matches) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          action: rule.action,
        });

        if (rule.action.type === RuleActionType.BLOCK) {
          hasBlocker = true;
          break;
        }
      }
    }

    return { violations, hasBlocker };
  }

  private evaluateCondition(condition: RuleCondition, context: Record<string, unknown>): boolean {
    switch (condition.op) {
      case 'AND':
        return (condition.conditions || []).every((c) => this.evaluateCondition(c, context));
      case 'OR':
        return (condition.conditions || []).some((c) => this.evaluateCondition(c, context));
      case 'NOT':
        return !(condition.conditions || []).some((c) => this.evaluateCondition(c, context));
      case 'GT':
        return (this.getField(context, condition.field!) as number) > (condition.value as number);
      case 'GTE':
        return (this.getField(context, condition.field!) as number) >= (condition.value as number);
      case 'LT':
        return (this.getField(context, condition.field!) as number) < (condition.value as number);
      case 'LTE':
        return (this.getField(context, condition.field!) as number) <= (condition.value as number);
      case 'EQ':
        return this.getField(context, condition.field!) === condition.value;
      case 'NEQ':
        return this.getField(context, condition.field!) !== condition.value;
      case 'IN':
        return (condition.value as unknown[]).includes(this.getField(context, condition.field!));
      case 'NOT_IN':
        return !(condition.value as unknown[]).includes(this.getField(context, condition.field!));
      case 'IS_NULL':
        return this.getField(context, condition.field!) == null;
      case 'IS_NOT_NULL':
        return this.getField(context, condition.field!) != null;
      default:
        return false;
    }
  }

  private getField(context: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((obj: unknown, key) => {
      if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[key];
      }
      return undefined;
    }, context);
  }
}
