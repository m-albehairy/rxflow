import { useCallback } from 'react';

interface RuleCondition {
  op: string;
  field?: string;
  value?: unknown;
  conditions?: RuleCondition[];
}

interface RuleViolation {
  ruleId: string;
  ruleName: string;
  action: { type: string; message: string; messageAr: string };
}

/**
 * Client-side rule evaluation for real-time UX feedback.
 * Server is always authoritative — this is UX only.
 */
export function useRules() {
  const evaluateCondition = useCallback(
    (condition: RuleCondition, context: Record<string, unknown>): boolean => {
      switch (condition.op) {
        case 'AND':
          return (condition.conditions || []).every((c) => evaluateCondition(c, context));
        case 'OR':
          return (condition.conditions || []).some((c) => evaluateCondition(c, context));
        case 'NOT':
          return !(condition.conditions || []).some((c) => evaluateCondition(c, context));
        case 'GT':
          return getField(context, condition.field!) > (condition.value as number);
        case 'GTE':
          return getField(context, condition.field!) >= (condition.value as number);
        case 'LT':
          return getField(context, condition.field!) < (condition.value as number);
        case 'LTE':
          return getField(context, condition.field!) <= (condition.value as number);
        case 'EQ':
          return getField(context, condition.field!) === condition.value;
        case 'NEQ':
          return getField(context, condition.field!) !== condition.value;
        default:
          return false;
      }
    },
    [],
  );

  const evaluate = useCallback(
    (rules: Array<{ id: string; name: string; condition: RuleCondition; action: any; priority: number; isActive: boolean }>, context: Record<string, unknown>) => {
      const sorted = [...rules].filter((r) => r.isActive).sort((a, b) => b.priority - a.priority);
      const violations: RuleViolation[] = [];
      let hasBlocker = false;

      for (const rule of sorted) {
        if (evaluateCondition(rule.condition, context)) {
          violations.push({ ruleId: rule.id, ruleName: rule.name, action: rule.action });
          if (rule.action.type === 'BLOCK') {
            hasBlocker = true;
            break;
          }
        }
      }

      return { violations, hasBlocker };
    },
    [evaluateCondition],
  );

  return { evaluate };
}

function getField(context: Record<string, unknown>, path: string): any {
  return path.split('.').reduce((obj: any, key) => obj?.[key], context);
}
