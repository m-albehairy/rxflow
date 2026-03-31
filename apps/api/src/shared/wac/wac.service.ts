import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface WACResult {
  prevQty: Decimal;
  prevAvgCost: Decimal;
  newAvgCost: Decimal;
  newTotalQty: Decimal;
  newTotalValue: Decimal;
}

@Injectable()
export class WACService {
  /**
   * Recalculate Weighted Average Cost for a product after purchase.
   * MUST be called within a transaction (QueryRunner).
   * avgCost is NEVER modified by sales — only purchases and manual adjustments.
   *
   * Formula:
   * newAvgCost = ((oldQty × oldAvgCost) + (newQty × newUnitCost)) / (oldQty + newQty)
   */
  async recalculate(
    queryRunner: QueryRunner,
    productId: string,
    purchaseQty: string | number,
    unitCost: string | number,
  ): Promise<WACResult> {
    // Lock the inventory row for update
    const [inventory] = await queryRunner.query(
      `SELECT quantity, avg_cost, total_value FROM inventories WHERE product_id = $1 FOR UPDATE`,
      [productId],
    );

    if (!inventory) {
      throw new Error(`Inventory not found for product ${productId}`);
    }

    const oldQty = new Decimal(inventory.quantity);
    const oldAvgCost = new Decimal(inventory.avg_cost);
    const newQty = new Decimal(purchaseQty);
    const newUnitCost = new Decimal(unitCost);

    const oldValue = oldQty.times(oldAvgCost);
    const addedValue = newQty.times(newUnitCost);
    const totalQty = oldQty.plus(newQty);
    const totalValue = oldValue.plus(addedValue);

    const newAvgCost = totalQty.isZero() ? new Decimal(0) : totalValue.dividedBy(totalQty);

    // Update inventory
    await queryRunner.query(
      `UPDATE inventories SET quantity = $1, avg_cost = $2, total_value = $3, last_purchase_date = NOW(), updated_at = NOW()
       WHERE product_id = $4`,
      [totalQty.toFixed(4), newAvgCost.toFixed(4), totalValue.toFixed(4), productId],
    );

    return {
      prevQty: oldQty,
      prevAvgCost: oldAvgCost,
      newAvgCost,
      newTotalQty: totalQty,
      newTotalValue: totalValue,
    };
  }

  /**
   * Reverse WAC calculation when voiding a purchase (same-day only).
   */
  async reverse(
    queryRunner: QueryRunner,
    productId: string,
    removeQty: string | number,
    removeCost: string | number,
  ): Promise<void> {
    const [inventory] = await queryRunner.query(
      `SELECT quantity, avg_cost, total_value FROM inventories WHERE product_id = $1 FOR UPDATE`,
      [productId],
    );

    if (!inventory) {
      throw new Error(`Inventory not found for product ${productId}`);
    }

    const currentQty = new Decimal(inventory.quantity);
    const currentAvgCost = new Decimal(inventory.avg_cost);
    const rq = new Decimal(removeQty);
    const rc = new Decimal(removeCost);

    const currentValue = currentQty.times(currentAvgCost);
    const removeValue = rq.times(rc);
    const newQty = currentQty.minus(rq);
    const newValue = currentValue.minus(removeValue);

    const newAvgCost = newQty.isZero() ? new Decimal(0) : newValue.dividedBy(newQty);

    await queryRunner.query(
      `UPDATE inventories SET quantity = $1, avg_cost = $2, total_value = $3, updated_at = NOW()
       WHERE product_id = $4`,
      [newQty.toFixed(4), newAvgCost.toFixed(4), newValue.toFixed(4), productId],
    );
  }
}
