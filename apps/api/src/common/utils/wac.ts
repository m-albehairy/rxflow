import Decimal from 'decimal.js';
import { toDecimal } from './money';

/**
 * Weighted Average Cost calculation
 * newAvgCost = ((oldQty × oldAvgCost) + (newQty × newUnitCost)) / (oldQty + newQty)
 */
export function calculateWAC(
  oldQty: string | number | Decimal,
  oldAvgCost: string | number | Decimal,
  newQty: string | number | Decimal,
  newUnitCost: string | number | Decimal,
): { newAvgCost: Decimal; newTotalQty: Decimal; newTotalValue: Decimal } {
  const oq = toDecimal(oldQty);
  const oc = toDecimal(oldAvgCost);
  const nq = toDecimal(newQty);
  const nc = toDecimal(newUnitCost);

  const oldValue = oq.times(oc);
  const newValue = nq.times(nc);
  const totalQty = oq.plus(nq);
  const totalValue = oldValue.plus(newValue);

  const newAvgCost = totalQty.isZero() ? toDecimal(0) : totalValue.dividedBy(totalQty);

  return {
    newAvgCost,
    newTotalQty: totalQty,
    newTotalValue: totalValue,
  };
}

/**
 * Reverse WAC calculation (for voiding a purchase)
 */
export function reverseWAC(
  currentQty: string | number | Decimal,
  currentAvgCost: string | number | Decimal,
  removeQty: string | number | Decimal,
  removeCost: string | number | Decimal,
): { newAvgCost: Decimal; newTotalQty: Decimal } {
  const cq = toDecimal(currentQty);
  const cc = toDecimal(currentAvgCost);
  const rq = toDecimal(removeQty);
  const rc = toDecimal(removeCost);

  const currentValue = cq.times(cc);
  const removeValue = rq.times(rc);
  const newQty = cq.minus(rq);
  const newValue = currentValue.minus(removeValue);

  const newAvgCost = newQty.isZero() ? toDecimal(0) : newValue.dividedBy(newQty);

  return { newAvgCost, newTotalQty: newQty };
}
