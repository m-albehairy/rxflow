import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(private dataSource: DataSource) {}

  async salesReport(params: { from?: string; to?: string; cashierId?: string; groupBy?: string }) {
    let query = `
      SELECT
        COUNT(*) as invoice_count,
        SUM(CAST(total AS numeric)) as total_revenue,
        SUM(CAST(tax_amount AS numeric)) as total_tax,
        SUM(CAST(discount_amount AS numeric)) as total_discount,
        SUM(CAST(profit AS numeric)) as total_profit
      FROM invoices
      WHERE deleted_at IS NULL AND status != 'VOIDED'
    `;
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (params.from) { query += ` AND created_at >= $${paramIndex++}`; queryParams.push(params.from); }
    if (params.to) { query += ` AND created_at <= $${paramIndex++}`; queryParams.push(params.to); }
    if (params.cashierId) { query += ` AND cashier_id = $${paramIndex++}`; queryParams.push(params.cashierId); }

    const [summary] = await this.dataSource.query(query, queryParams);

    // Top products
    const topProducts = await this.dataSource.query(
      `SELECT p.name_en, p.name_ar, SUM(CAST(ii.quantity AS numeric)) as total_qty,
              SUM(CAST(ii.total AS numeric)) as total_revenue
       FROM invoice_items ii
       JOIN products p ON ii.product_id = p.id
       JOIN invoices i ON ii.invoice_id = i.id
       WHERE i.deleted_at IS NULL AND i.status != 'VOIDED'
       GROUP BY p.id, p.name_en, p.name_ar
       ORDER BY total_revenue DESC LIMIT 20`,
    );

    return { summary, topProducts };
  }

  async profitReport(params: { from?: string; to?: string; groupBy?: string }) {
    const query = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as invoice_count,
        SUM(CAST(total AS numeric)) as revenue,
        SUM(CAST(total_cost AS numeric)) as cost,
        SUM(CAST(profit AS numeric)) as profit
      FROM invoices
      WHERE deleted_at IS NULL AND status != 'VOIDED'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 90
    `;
    return this.dataSource.query(query);
  }

  async inventoryReport(type: string) {
    switch (type) {
      case 'low':
        return this.dataSource.query(
          `SELECT p.name_en, p.name_ar, i.quantity, i.reorder_level, i.avg_cost
           FROM inventories i JOIN products p ON i.product_id = p.id
           WHERE i.deleted_at IS NULL AND CAST(i.quantity AS numeric) <= CAST(i.reorder_level AS numeric) AND CAST(i.reorder_level AS numeric) > 0`,
        );
      case 'expiry':
        return this.dataSource.query(
          `SELECT p.name_en, p.name_ar, b.batch_number, b.remaining_qty, b.expiry_date
           FROM batches b
           JOIN inventories i ON b.inventory_id = i.id
           JOIN products p ON i.product_id = p.id
           WHERE b.deleted_at IS NULL AND CAST(b.remaining_qty AS numeric) > 0
           AND b.expiry_date IS NOT NULL AND b.expiry_date <= NOW() + INTERVAL '30 days'
           ORDER BY b.expiry_date ASC`,
        );
      default:
        return this.dataSource.query(
          `SELECT p.name_en, p.name_ar, p.barcode, c.name_en as category,
                  i.quantity, i.avg_cost, i.total_value
           FROM inventories i
           JOIN products p ON i.product_id = p.id
           LEFT JOIN categories c ON p.category_id = c.id
           WHERE i.deleted_at IS NULL
           ORDER BY p.name_en ASC`,
        );
    }
  }

  async arReport(customerId?: string) {
    let query = `
      SELECT c.name, c.name_ar, c.phone,
             ca.credit_limit, ca.current_balance, ca.status,
             ca.last_payment_date
      FROM credit_accounts ca
      JOIN customers c ON ca.customer_id = c.id
      WHERE ca.deleted_at IS NULL AND CAST(ca.current_balance AS numeric) > 0
    `;
    const params: unknown[] = [];
    if (customerId) { query += ` AND ca.customer_id = $1`; params.push(customerId); }
    query += ` ORDER BY CAST(ca.current_balance AS numeric) DESC`;

    return this.dataSource.query(query, params);
  }

  async shiftReport(params: { cashierId?: string; from?: string; to?: string }) {
    let query = `
      SELECT s.*, u.full_name as cashier_name
      FROM shifts s
      JOIN users u ON s.cashier_id = u.id
      WHERE s.deleted_at IS NULL AND s.status = 'CLOSED'
    `;
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (params.cashierId) { query += ` AND s.cashier_id = $${paramIndex++}`; queryParams.push(params.cashierId); }
    if (params.from) { query += ` AND s.opened_at >= $${paramIndex++}`; queryParams.push(params.from); }
    if (params.to) { query += ` AND s.opened_at <= $${paramIndex++}`; queryParams.push(params.to); }

    query += ` ORDER BY s.opened_at DESC LIMIT 100`;
    return this.dataSource.query(query, queryParams);
  }

  async profitAndLoss(params: { from?: string; to?: string; groupBy?: string }) {
    const groupBy = params.groupBy || 'month';
    const interval = (groupBy === 'quarter' || groupBy === 'quarterly') ? 'quarter'
      : (groupBy === 'year' || groupBy === 'yearly') ? 'year' : 'month';

    // Revenue query
    let revenueQuery = `
      SELECT DATE_TRUNC('${interval}', created_at) as period,
             SUM(CAST(total AS numeric)) as revenue,
             SUM(CAST(total_cost AS numeric)) as cogs,
             SUM(CAST(total AS numeric)) - SUM(CAST(total_cost AS numeric)) as gross_profit,
             SUM(CAST(tax_amount AS numeric)) as tax,
             SUM(CAST(discount_amount AS numeric)) as discounts,
             COUNT(*) as invoice_count
      FROM invoices
      WHERE deleted_at IS NULL AND status NOT IN ('VOIDED', 'DRAFT')
    `;
    const revenueParams: unknown[] = [];
    let paramIndex = 1;

    if (params.from) { revenueQuery += ` AND created_at >= $${paramIndex++}`; revenueParams.push(params.from); }
    if (params.to) { revenueQuery += ` AND created_at <= $${paramIndex++}`; revenueParams.push(params.to); }
    revenueQuery += ` GROUP BY period ORDER BY period ASC`;

    // Expenses query
    let expenseQuery = `
      SELECT DATE_TRUNC('${interval}', date) as period,
             SUM(CAST(amount AS numeric)) as total_expenses,
             SUM(CASE WHEN category = 'RENT' THEN CAST(amount AS numeric) ELSE 0 END) as rent,
             SUM(CASE WHEN category = 'UTILITIES' THEN CAST(amount AS numeric) ELSE 0 END) as utilities,
             SUM(CASE WHEN category = 'SALARIES' THEN CAST(amount AS numeric) ELSE 0 END) as salaries,
             SUM(CASE WHEN category = 'SUPPLIES' THEN CAST(amount AS numeric) ELSE 0 END) as supplies,
             SUM(CASE WHEN category = 'MAINTENANCE' THEN CAST(amount AS numeric) ELSE 0 END) as maintenance,
             SUM(CASE WHEN category = 'MARKETING' THEN CAST(amount AS numeric) ELSE 0 END) as marketing,
             SUM(CASE WHEN category = 'INSURANCE' THEN CAST(amount AS numeric) ELSE 0 END) as insurance,
             SUM(CASE WHEN category = 'TRANSPORT' THEN CAST(amount AS numeric) ELSE 0 END) as transport,
             SUM(CASE WHEN category = 'OTHER' THEN CAST(amount AS numeric) ELSE 0 END) as other
      FROM expenses
      WHERE deleted_at IS NULL AND status = 'APPROVED'
    `;
    const expenseParams: unknown[] = [];
    let expParamIndex = 1;

    if (params.from) { expenseQuery += ` AND date >= $${expParamIndex++}`; expenseParams.push(params.from); }
    if (params.to) { expenseQuery += ` AND date <= $${expParamIndex++}`; expenseParams.push(params.to); }
    expenseQuery += ` GROUP BY period ORDER BY period ASC`;

    const [revenueRows, expenseRows] = await Promise.all([
      this.dataSource.query(revenueQuery, revenueParams),
      this.dataSource.query(expenseQuery, expenseParams),
    ]);

    // Merge by period
    const periodMap = new Map<string, any>();

    for (const row of revenueRows) {
      const key = new Date(row.period).toISOString();
      periodMap.set(key, {
        period: row.period,
        revenue: parseFloat(row.revenue || '0'),
        cogs: parseFloat(row.cogs || '0'),
        gross_profit: parseFloat(row.gross_profit || '0'),
        tax: parseFloat(row.tax || '0'),
        discounts: parseFloat(row.discounts || '0'),
        invoice_count: parseInt(row.invoice_count || '0'),
        total_expenses: 0,
        expense_breakdown: { rent: 0, utilities: 0, salaries: 0, supplies: 0, maintenance: 0, marketing: 0, insurance: 0, transport: 0, other: 0 },
        net_profit: 0,
      });
    }

    for (const row of expenseRows) {
      const key = new Date(row.period).toISOString();
      if (!periodMap.has(key)) {
        periodMap.set(key, {
          period: row.period,
          revenue: 0, cogs: 0, gross_profit: 0, tax: 0, discounts: 0, invoice_count: 0,
          total_expenses: 0,
          expense_breakdown: { rent: 0, utilities: 0, salaries: 0, supplies: 0, maintenance: 0, marketing: 0, insurance: 0, transport: 0, other: 0 },
          net_profit: 0,
        });
      }
      const entry = periodMap.get(key)!;
      entry.total_expenses = parseFloat(row.total_expenses || '0');
      entry.expense_breakdown = {
        rent: parseFloat(row.rent || '0'),
        utilities: parseFloat(row.utilities || '0'),
        salaries: parseFloat(row.salaries || '0'),
        supplies: parseFloat(row.supplies || '0'),
        maintenance: parseFloat(row.maintenance || '0'),
        marketing: parseFloat(row.marketing || '0'),
        insurance: parseFloat(row.insurance || '0'),
        transport: parseFloat(row.transport || '0'),
        other: parseFloat(row.other || '0'),
      };
    }

    // Calculate net profit and sort
    const periods = Array.from(periodMap.values())
      .map((p) => ({ ...p, net_profit: p.gross_profit - p.total_expenses }))
      .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());

    // Totals row
    const totals = periods.reduce(
      (acc, p) => ({
        revenue: acc.revenue + p.revenue,
        cogs: acc.cogs + p.cogs,
        gross_profit: acc.gross_profit + p.gross_profit,
        total_expenses: acc.total_expenses + p.total_expenses,
        net_profit: acc.net_profit + p.net_profit,
        tax: acc.tax + p.tax,
        discounts: acc.discounts + p.discounts,
        invoice_count: acc.invoice_count + p.invoice_count,
      }),
      { revenue: 0, cogs: 0, gross_profit: 0, total_expenses: 0, net_profit: 0, tax: 0, discounts: 0, invoice_count: 0 },
    );

    return { periods, totals };
  }

  async cashFlowReport(params: { from?: string; to?: string; groupBy?: string }) {
    const groupBy = params.groupBy || 'month';
    const interval = groupBy === 'quarter' ? 'quarter' : groupBy === 'year' ? 'year' : 'month';

    // Cash inflows from payments
    let inflowQuery = `
      SELECT DATE_TRUNC('${interval}', i.created_at) as period,
             SUM(CAST(p.amount AS numeric)) as cash_in
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE i.deleted_at IS NULL AND i.status NOT IN ('VOIDED', 'DRAFT') AND p.method = 'CASH'
    `;
    const inflowParams: unknown[] = [];
    let inflowIdx = 1;

    if (params.from) { inflowQuery += ` AND i.created_at >= $${inflowIdx++}`; inflowParams.push(params.from); }
    if (params.to) { inflowQuery += ` AND i.created_at <= $${inflowIdx++}`; inflowParams.push(params.to); }
    inflowQuery += ` GROUP BY period ORDER BY period ASC`;

    // Cash outflows from expenses
    let outflowQuery = `
      SELECT DATE_TRUNC('${interval}', e.date) as period,
             SUM(CAST(e.amount AS numeric)) as cash_out
      FROM expenses e
      WHERE e.deleted_at IS NULL AND e.status = 'APPROVED' AND e.payment_method = 'CASH'
    `;
    const outflowParams: unknown[] = [];
    let outflowIdx = 1;

    if (params.from) { outflowQuery += ` AND e.date >= $${outflowIdx++}`; outflowParams.push(params.from); }
    if (params.to) { outflowQuery += ` AND e.date <= $${outflowIdx++}`; outflowParams.push(params.to); }
    outflowQuery += ` GROUP BY period ORDER BY period ASC`;

    // Credit collections (cash)
    let creditQuery = `
      SELECT DATE_TRUNC('${interval}', cp.created_at) as period,
             SUM(CAST(cp.amount AS numeric)) as credit_collected
      FROM credit_payments cp
      WHERE cp.deleted_at IS NULL AND cp.method = 'CASH'
    `;
    const creditParams: unknown[] = [];
    let creditIdx = 1;

    if (params.from) { creditQuery += ` AND cp.created_at >= $${creditIdx++}`; creditParams.push(params.from); }
    if (params.to) { creditQuery += ` AND cp.created_at <= $${creditIdx++}`; creditParams.push(params.to); }
    creditQuery += ` GROUP BY period ORDER BY period ASC`;

    const [inflowRows, outflowRows, creditRows] = await Promise.all([
      this.dataSource.query(inflowQuery, inflowParams),
      this.dataSource.query(outflowQuery, outflowParams),
      this.dataSource.query(creditQuery, creditParams),
    ]);

    // Merge by period
    const periodMap = new Map<string, any>();

    for (const row of inflowRows) {
      const key = new Date(row.period).toISOString();
      periodMap.set(key, {
        period: row.period,
        cash_in: parseFloat(row.cash_in || '0'),
        cash_out: 0,
        credit_collected: 0,
        net_flow: 0,
        cumulative: 0,
      });
    }

    for (const row of outflowRows) {
      const key = new Date(row.period).toISOString();
      if (!periodMap.has(key)) {
        periodMap.set(key, { period: row.period, cash_in: 0, cash_out: 0, credit_collected: 0, net_flow: 0, cumulative: 0 });
      }
      periodMap.get(key)!.cash_out = parseFloat(row.cash_out || '0');
    }

    for (const row of creditRows) {
      const key = new Date(row.period).toISOString();
      if (!periodMap.has(key)) {
        periodMap.set(key, { period: row.period, cash_in: 0, cash_out: 0, credit_collected: 0, net_flow: 0, cumulative: 0 });
      }
      periodMap.get(key)!.credit_collected = parseFloat(row.credit_collected || '0');
    }

    // Calculate net flow, cumulative, and sort
    const periods = Array.from(periodMap.values())
      .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());

    let cumulative = 0;
    for (const p of periods) {
      p.net_flow = p.cash_in + p.credit_collected - p.cash_out;
      cumulative += p.net_flow;
      p.cumulative = cumulative;
    }

    // Totals
    const totals = periods.reduce(
      (acc, p) => ({
        cash_in: acc.cash_in + p.cash_in,
        cash_out: acc.cash_out + p.cash_out,
        credit_collected: acc.credit_collected + p.credit_collected,
        net_flow: acc.net_flow + p.net_flow,
      }),
      { cash_in: 0, cash_out: 0, credit_collected: 0, net_flow: 0 },
    );

    return { periods, totals };
  }

  async apReport(supplierId?: string) {
    let query = `
      SELECT s.id, s.name_en, s.name_ar, s.phone, s.current_balance, s.payment_term_days,
             COALESCE((
               SELECT SUM(CAST(p.grand_total AS numeric))
               FROM purchases p
               WHERE p.supplier_id = s.id AND p.deleted_at IS NULL AND p.status != 'VOIDED'
                 AND p.invoice_date >= NOW() - INTERVAL '30 days'
             ), 0) as current_bucket,
             COALESCE((
               SELECT SUM(CAST(p.grand_total AS numeric))
               FROM purchases p
               WHERE p.supplier_id = s.id AND p.deleted_at IS NULL AND p.status != 'VOIDED'
                 AND p.invoice_date < NOW() - INTERVAL '30 days'
                 AND p.invoice_date >= NOW() - INTERVAL '60 days'
             ), 0) as days_1_30,
             COALESCE((
               SELECT SUM(CAST(p.grand_total AS numeric))
               FROM purchases p
               WHERE p.supplier_id = s.id AND p.deleted_at IS NULL AND p.status != 'VOIDED'
                 AND p.invoice_date < NOW() - INTERVAL '60 days'
                 AND p.invoice_date >= NOW() - INTERVAL '90 days'
             ), 0) as days_31_60,
             COALESCE((
               SELECT SUM(CAST(p.grand_total AS numeric))
               FROM purchases p
               WHERE p.supplier_id = s.id AND p.deleted_at IS NULL AND p.status != 'VOIDED'
                 AND p.invoice_date < NOW() - INTERVAL '90 days'
                 AND p.invoice_date >= NOW() - INTERVAL '120 days'
             ), 0) as days_61_90,
             COALESCE((
               SELECT SUM(CAST(p.grand_total AS numeric))
               FROM purchases p
               WHERE p.supplier_id = s.id AND p.deleted_at IS NULL AND p.status != 'VOIDED'
                 AND p.invoice_date < NOW() - INTERVAL '120 days'
             ), 0) as days_90_plus
      FROM suppliers s
      WHERE s.deleted_at IS NULL AND CAST(s.current_balance AS numeric) > 0
    `;
    const params: unknown[] = [];
    if (supplierId) { query += ` AND s.id = $1`; params.push(supplierId); }
    query += ` ORDER BY CAST(s.current_balance AS numeric) DESC`;

    return this.dataSource.query(query, params);
  }
}
