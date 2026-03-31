import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PricingMode } from '@pharmapos/shared';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface PriceCalculationInput {
  pricingMode: PricingMode;
  avgCost: string;
  defaultSellingPrice: string;
  margin: string;
  minSellingPrice?: string | null;
}

export interface PriceCalculationResult {
  suggestedPrice: Decimal;
  cost: Decimal;
  isBelowMinimum: boolean;
}

@Injectable()
export class PricingService {
  /**
   * Calculate suggested price based on pricing mode.
   *
   * FIXED:     Product.defaultSellingPrice
   * COST_PLUS: avgCost × (1 + margin/100)
   * HYBRID:    Product.defaultSellingPrice (editable by cashier)
   */
  calculateSuggestedPrice(input: PriceCalculationInput): PriceCalculationResult {
    const cost = new Decimal(input.avgCost);
    let suggestedPrice: Decimal;

    switch (input.pricingMode) {
      case PricingMode.COST_PLUS: {
        const margin = new Decimal(input.margin);
        suggestedPrice = cost.times(new Decimal(1).plus(margin.dividedBy(100)));
        break;
      }
      case PricingMode.FIXED:
      case PricingMode.HYBRID:
      default:
        suggestedPrice = new Decimal(input.defaultSellingPrice);
        break;
    }

    const minPrice = input.minSellingPrice ? new Decimal(input.minSellingPrice) : null;
    let isBelowMinimum = false;

    if (minPrice && suggestedPrice.lessThan(minPrice)) {
      suggestedPrice = minPrice;
      isBelowMinimum = true;
    }

    return { suggestedPrice, cost, isBelowMinimum };
  }

  /**
   * Round price to nearest increment (0.25, 0.50, 1.00, or no rounding).
   */
  roundPrice(price: Decimal, roundTo: string | null): Decimal {
    if (!roundTo || roundTo === '0') return price;

    const increment = new Decimal(roundTo);
    return price.dividedBy(increment).round().times(increment);
  }

  /**
   * Check if selling price is below cost.
   */
  isBelowCost(sellingPrice: string | Decimal, avgCost: string | Decimal): boolean {
    return new Decimal(sellingPrice).lessThan(new Decimal(avgCost));
  }
}
