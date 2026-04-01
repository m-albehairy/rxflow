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

  async dashboardWidgets() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const [cashierPerformance, expiryCalendar, stockValueByCategory, hourlySales] = await Promise.all([
      // Cashier performance for today's shifts
      this.dataSource.query(
        `SELECT u.full_name as cashier_name, u.full_name_ar as cashier_name_ar,
                COUNT(i.id) as invoice_count,
                COALESCE(SUM(CAST(i.total AS numeric)), 0) as total_revenue,
                COALESCE(SUM(CAST(i.profit AS numeric)), 0) as total_profit
         FROM shifts s
         JOIN users u ON s.cashier_id = u.id
         LEFT JOIN invoices i ON i.cashier_id = s.cashier_id
           AND i.deleted_at IS NULL AND i.status != 'VOIDED'
           AND i.created_at >= s.opened_at
           AND (s.closed_at IS NULL OR i.created_at <= s.closed_at)
         WHERE s.deleted_at IS NULL AND s.opened_at >= $1
         GROUP BY u.id, u.full_name, u.full_name_ar`,
        [todayStr],
      ),

      // Batches expiring in next 90 days grouped by ISO week
      this.dataSource.query(
        `SELECT TO_CHAR(DATE_TRUNC('week', b.expiry_date), 'IYYY-"W"IW') as week_label,
                DATE_TRUNC('week', b.expiry_date) as week_start,
                COUNT(*) as batch_count,
                SUM(CAST(b.remaining_qty AS numeric)) as total_qty
         FROM batches b
         WHERE b.deleted_at IS NULL
           AND CAST(b.remaining_qty AS numeric) > 0
           AND b.expiry_date IS NOT NULL
           AND b.expiry_date >= CURRENT_DATE
           AND b.expiry_date <= CURRENT_DATE + INTERVAL '90 days'
         GROUP BY DATE_TRUNC('week', b.expiry_date)
         ORDER BY week_start ASC`,
      ),

      // Stock value by category
      this.dataSource.query(
        `SELECT COALESCE(c.name_en, 'Uncategorized') as category_en,
                COALESCE(c.name_ar, 'بدون تصنيف') as category_ar,
                COUNT(DISTINCT p.id) as product_count,
                COALESCE(SUM(CAST(i.total_value AS numeric)), 0) as total_value
         FROM inventories i
         JOIN products p ON i.product_id = p.id
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE i.deleted_at IS NULL
         GROUP BY c.id, c.name_en, c.name_ar
         ORDER BY total_value DESC`,
      ),

      // Hourly sales for today
      this.dataSource.query(
        `SELECT EXTRACT(HOUR FROM created_at)::int as hour,
                COUNT(*) as invoice_count,
                COALESCE(SUM(CAST(total AS numeric)), 0) as revenue
         FROM invoices
         WHERE deleted_at IS NULL AND status != 'VOIDED'
           AND created_at >= $1
         GROUP BY EXTRACT(HOUR FROM created_at)
         ORDER BY hour ASC`,
        [todayStr],
      ),
    ]);

    return {
      cashierPerformance: cashierPerformance.map((r: any) => ({
        ...r,
        invoice_count: parseInt(r.invoice_count || '0'),
        total_revenue: parseFloat(r.total_revenue || '0'),
        total_profit: parseFloat(r.total_profit || '0'),
      })),
      expiryCalendar: expiryCalendar.map((r: any) => ({
        ...r,
        batch_count: parseInt(r.batch_count || '0'),
        total_qty: parseFloat(r.total_qty || '0'),
      })),
      stockValueByCategory: stockValueByCategory.map((r: any) => ({
        ...r,
        product_count: parseInt(r.product_count || '0'),
        total_value: parseFloat(r.total_value || '0'),
      })),
      hourlySales: hourlySales.map((r: any) => ({
        hour: parseInt(r.hour),
        invoice_count: parseInt(r.invoice_count || '0'),
        revenue: parseFloat(r.revenue || '0'),
      })),
    };
  }

  async demandForecast(params: { categoryId?: string; urgency?: string }) {
    let query = `
      SELECT p.id as product_id, p.name_en, p.name_ar, p.barcode,
             COALESCE(c.name_en, 'Uncategorized') as category_en,
             COALESCE(c.name_ar, 'بدون تصنيف') as category_ar,
             CAST(i.quantity AS numeric) as current_qty,
             CAST(i.avg_cost AS numeric) as avg_cost,
             COALESCE(sales.avg_daily_sales, 0) as avg_daily_sales,
             CAST(i.reorder_level AS numeric) as reorder_level
      FROM inventories i
      JOIN products p ON i.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN LATERAL (
        SELECT SUM(CAST(ii.quantity AS numeric)) / 30.0 as avg_daily_sales
        FROM invoice_items ii
        JOIN invoices inv ON ii.invoice_id = inv.id
        WHERE ii.product_id = p.id
          AND inv.deleted_at IS NULL AND inv.status != 'VOIDED'
          AND inv.created_at >= NOW() - INTERVAL '30 days'
      ) sales ON true
      WHERE i.deleted_at IS NULL AND p.is_active = true
    `;
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (params.categoryId) {
      query += ` AND p.category_id = $${paramIndex++}`;
      queryParams.push(params.categoryId);
    }

    query += ` ORDER BY CASE WHEN COALESCE(sales.avg_daily_sales, 0) = 0 THEN 9999 ELSE CAST(i.quantity AS numeric) / sales.avg_daily_sales END ASC`;

    const rows = await this.dataSource.query(query, queryParams);

    const results = rows.map((r: any) => {
      const currentQty = parseFloat(r.current_qty || '0');
      const avgCost = parseFloat(r.avg_cost || '0');
      const avgDailySales = parseFloat(r.avg_daily_sales || '0');
      const reorderLevel = parseFloat(r.reorder_level || '0');
      const daysOfStock = avgDailySales > 0 ? currentQty / avgDailySales : 9999;
      const suggestedQty = Math.max(0, (avgDailySales * 14) - currentQty + reorderLevel);
      const urgency = daysOfStock <= 7 ? 'critical' : daysOfStock <= 14 ? 'warning' : 'ok';

      return {
        product_id: r.product_id,
        name_en: r.name_en,
        name_ar: r.name_ar,
        barcode: r.barcode,
        category_en: r.category_en,
        category_ar: r.category_ar,
        current_qty: currentQty,
        avg_cost: avgCost,
        avg_daily_sales: parseFloat(avgDailySales.toFixed(4)),
        days_of_stock: parseFloat(daysOfStock.toFixed(2)),
        reorder_level: reorderLevel,
        suggested_qty: parseFloat(suggestedQty.toFixed(4)),
        urgency,
      };
    });

    if (params.urgency) {
      return results.filter((r: any) => r.urgency === params.urgency);
    }

    return results;
  }

  async deadStock(days: number = 30) {
    const rows = await this.dataSource.query(
      `SELECT p.id as product_id, p.name_en, p.name_ar, p.barcode,
              COALESCE(c.name_en, 'Uncategorized') as category_en,
              COALESCE(c.name_ar, 'بدون تصنيف') as category_ar,
              CAST(i.quantity AS numeric) as current_qty,
              CAST(i.avg_cost AS numeric) as avg_cost,
              i.last_sale_date,
              CASE
                WHEN i.last_sale_date IS NULL THEN EXTRACT(DAY FROM NOW() - p.created_at)::int
                ELSE EXTRACT(DAY FROM NOW() - i.last_sale_date)::int
              END as days_idle
       FROM inventories i
       JOIN products p ON i.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE i.deleted_at IS NULL
         AND CAST(i.quantity AS numeric) > 0
         AND (
           i.last_sale_date IS NULL
           OR i.last_sale_date < NOW() - MAKE_INTERVAL(days => $1)
         )
         AND NOT EXISTS (
           SELECT 1 FROM invoice_items ii
           JOIN invoices inv ON ii.invoice_id = inv.id
           WHERE ii.product_id = p.id
             AND inv.deleted_at IS NULL AND inv.status != 'VOIDED'
             AND inv.created_at >= NOW() - MAKE_INTERVAL(days => $1)
         )
       ORDER BY days_idle DESC`,
      [days],
    );

    const items = rows.map((r: any) => {
      const currentQty = parseFloat(r.current_qty || '0');
      const avgCost = parseFloat(r.avg_cost || '0');
      return {
        product_id: r.product_id,
        name_en: r.name_en,
        name_ar: r.name_ar,
        barcode: r.barcode,
        category_en: r.category_en,
        category_ar: r.category_ar,
        current_qty: currentQty,
        avg_cost: avgCost,
        tied_up_value: parseFloat((currentQty * avgCost).toFixed(4)),
        last_sale_date: r.last_sale_date,
        days_idle: parseInt(r.days_idle || '0'),
      };
    });

    const summary = {
      total_items: items.length,
      total_tied_up_value: parseFloat(items.reduce((sum: number, i: any) => sum + i.tied_up_value, 0).toFixed(4)),
    };

    return { items, summary };
  }

  async customerAnalytics(customerId?: string) {
    if (customerId) {
      // Single customer detail
      const [customerRows, preferredProducts, monthlySpending] = await Promise.all([
        this.dataSource.query(
          `SELECT c.name, c.name_ar, c.phone,
                  COALESCE(c.invoice_count, 0) as invoice_count,
                  COALESCE(CAST(c.total_purchases AS numeric), 0) as total_spent
           FROM customers c
           WHERE c.id = $1 AND c.deleted_at IS NULL`,
          [customerId],
        ),
        this.dataSource.query(
          `SELECT p.name_en, p.name_ar,
                  SUM(CAST(ii.quantity AS numeric)) as total_qty,
                  SUM(CAST(ii.total AS numeric)) as total_revenue
           FROM invoice_items ii
           JOIN invoices inv ON ii.invoice_id = inv.id
           JOIN products p ON ii.product_id = p.id
           WHERE inv.customer_id = $1 AND inv.deleted_at IS NULL AND inv.status != 'VOIDED'
           GROUP BY p.id, p.name_en, p.name_ar
           ORDER BY total_qty DESC
           LIMIT 10`,
          [customerId],
        ),
        this.dataSource.query(
          `SELECT TO_CHAR(DATE_TRUNC('month', inv.created_at), 'YYYY-MM') as month,
                  SUM(CAST(inv.total AS numeric)) as total_spent,
                  COUNT(*) as invoice_count
           FROM invoices inv
           WHERE inv.customer_id = $1 AND inv.deleted_at IS NULL AND inv.status != 'VOIDED'
             AND inv.created_at >= NOW() - INTERVAL '12 months'
           GROUP BY DATE_TRUNC('month', inv.created_at)
           ORDER BY month ASC`,
          [customerId],
        ),
      ]);

      if (!customerRows.length) {
        return { customer: null, preferredProducts: [], monthlySpending: [] };
      }

      const c = customerRows[0];
      const totalSpent = parseFloat(c.total_spent || '0');
      const invoiceCount = parseInt(c.invoice_count || '0');

      return {
        customer: {
          name: c.name,
          name_ar: c.name_ar,
          phone: c.phone,
          invoice_count: invoiceCount,
          total_spent: totalSpent,
          avg_basket: invoiceCount > 0 ? parseFloat((totalSpent / invoiceCount).toFixed(4)) : 0,
        },
        preferredProducts: preferredProducts.map((r: any) => ({
          name_en: r.name_en,
          name_ar: r.name_ar,
          total_qty: parseFloat(r.total_qty || '0'),
          total_revenue: parseFloat(r.total_revenue || '0'),
        })),
        monthlySpending: monthlySpending.map((r: any) => ({
          month: r.month,
          total_spent: parseFloat(r.total_spent || '0'),
          invoice_count: parseInt(r.invoice_count || '0'),
        })),
      };
    }

    // Overview mode
    const [segmentRows, topCustomers, overviewRows] = await Promise.all([
      this.dataSource.query(
        `SELECT
           CASE
             WHEN CAST(COALESCE(total_purchases, '0') AS numeric) > 10000 THEN 'high'
             WHEN CAST(COALESCE(total_purchases, '0') AS numeric) > 1000 THEN 'medium'
             ELSE 'low'
           END as segment,
           COUNT(*) as customer_count,
           COALESCE(SUM(CAST(total_purchases AS numeric)), 0) as total_revenue
         FROM customers
         WHERE deleted_at IS NULL
         GROUP BY segment
         ORDER BY total_revenue DESC`,
      ),
      this.dataSource.query(
        `SELECT c.id, c.name, c.name_ar, c.phone,
                COALESCE(c.invoice_count, 0) as invoice_count,
                COALESCE(CAST(c.total_purchases AS numeric), 0) as total_spent,
                (SELECT MAX(inv.created_at)
                 FROM invoices inv
                 WHERE inv.customer_id = c.id AND inv.deleted_at IS NULL AND inv.status != 'VOIDED'
                ) as last_purchase
         FROM customers c
         WHERE c.deleted_at IS NULL
         ORDER BY CAST(COALESCE(c.total_purchases, '0') AS numeric) DESC
         LIMIT 20`,
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as total_customers,
                COALESCE(AVG(CAST(COALESCE(total_purchases, '0') AS numeric) / NULLIF(CAST(COALESCE(invoice_count, '0') AS numeric), 0)), 0) as avg_basket_size,
                COALESCE(AVG(CAST(COALESCE(invoice_count, '0') AS numeric)), 0) as avg_purchase_frequency
         FROM customers
         WHERE deleted_at IS NULL`,
      ),
    ]);

    return {
      segments: segmentRows.map((r: any) => ({
        segment: r.segment,
        customer_count: parseInt(r.customer_count || '0'),
        total_revenue: parseFloat(r.total_revenue || '0'),
      })),
      topCustomers: topCustomers.map((r: any) => {
        const totalSpent = parseFloat(r.total_spent || '0');
        const invoiceCount = parseInt(r.invoice_count || '0');
        return {
          id: r.id,
          name: r.name,
          name_ar: r.name_ar,
          phone: r.phone,
          invoice_count: invoiceCount,
          total_spent: totalSpent,
          avg_basket: invoiceCount > 0 ? parseFloat((totalSpent / invoiceCount).toFixed(4)) : 0,
          last_purchase: r.last_purchase,
        };
      }),
      overview: {
        total_customers: parseInt(overviewRows[0]?.total_customers || '0'),
        avg_basket_size: parseFloat(parseFloat(overviewRows[0]?.avg_basket_size || '0').toFixed(4)),
        avg_purchase_frequency: parseFloat(parseFloat(overviewRows[0]?.avg_purchase_frequency || '0').toFixed(2)),
      },
    };
  }

  async comparativeReport(type: string = 'mom') {
    const now = new Date();
    let currentFrom: Date, currentTo: Date, previousFrom: Date, previousTo: Date;
    let currentLabel: string, previousLabel: string;

    if (type === 'yoy') {
      const currentYear = now.getFullYear();
      currentFrom = new Date(currentYear, 0, 1);
      currentTo = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      previousFrom = new Date(currentYear - 1, 0, 1);
      previousTo = new Date(currentYear - 1, 11, 31, 23, 59, 59, 999);
      currentLabel = `${currentYear}`;
      previousLabel = `${currentYear - 1}`;
    } else if (type === 'qoq') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      currentFrom = new Date(now.getFullYear(), currentQuarter * 3, 1);
      currentTo = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0, 23, 59, 59, 999);
      const prevQuarterMonth = currentQuarter * 3 - 3;
      const prevYear = prevQuarterMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const prevMonth = prevQuarterMonth < 0 ? prevQuarterMonth + 12 : prevQuarterMonth;
      previousFrom = new Date(prevYear, prevMonth, 1);
      previousTo = new Date(prevYear, prevMonth + 3, 0, 23, 59, 59, 999);
      currentLabel = `Q${currentQuarter + 1} ${now.getFullYear()}`;
      previousLabel = `Q${prevQuarterMonth < 0 ? 4 : currentQuarter} ${prevYear}`;
    } else {
      // mom (default)
      currentFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      currentTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      previousFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      currentLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      previousLabel = `${previousFrom.getFullYear()}-${String(previousFrom.getMonth() + 1).padStart(2, '0')}`;
    }

    const periodQuery = `
      SELECT
        COALESCE(SUM(CAST(total AS numeric)), 0) as revenue,
        COALESCE(SUM(CAST(total_cost AS numeric)), 0) as cost,
        COALESCE(SUM(CAST(profit AS numeric)), 0) as profit,
        COUNT(*) as invoice_count,
        CASE WHEN COUNT(*) > 0
          THEN COALESCE(SUM(CAST(total AS numeric)), 0) / COUNT(*)
          ELSE 0
        END as avg_ticket
      FROM invoices
      WHERE deleted_at IS NULL AND status NOT IN ('VOIDED', 'DRAFT')
        AND created_at >= $1 AND created_at <= $2
    `;

    const topProductsQuery = `
      SELECT p.name_en, p.name_ar,
             SUM(CAST(ii.quantity AS numeric)) as total_qty,
             SUM(CAST(ii.total AS numeric)) as total_revenue
      FROM invoice_items ii
      JOIN invoices inv ON ii.invoice_id = inv.id
      JOIN products p ON ii.product_id = p.id
      WHERE inv.deleted_at IS NULL AND inv.status NOT IN ('VOIDED', 'DRAFT')
        AND inv.created_at >= $1 AND inv.created_at <= $2
      GROUP BY p.id, p.name_en, p.name_ar
      ORDER BY total_revenue DESC
      LIMIT 10
    `;

    const [currentPeriod, previousPeriod, currentProducts, previousProducts] = await Promise.all([
      this.dataSource.query(periodQuery, [currentFrom.toISOString(), currentTo.toISOString()]),
      this.dataSource.query(periodQuery, [previousFrom.toISOString(), previousTo.toISOString()]),
      this.dataSource.query(topProductsQuery, [currentFrom.toISOString(), currentTo.toISOString()]),
      this.dataSource.query(topProductsQuery, [previousFrom.toISOString(), previousTo.toISOString()]),
    ]);

    const parsePeriod = (row: any, label: string, from: Date, to: Date) => ({
      label,
      from: from.toISOString(),
      to: to.toISOString(),
      revenue: parseFloat(row.revenue || '0'),
      cost: parseFloat(row.cost || '0'),
      profit: parseFloat(row.profit || '0'),
      invoice_count: parseInt(row.invoice_count || '0'),
      avg_ticket: parseFloat(parseFloat(row.avg_ticket || '0').toFixed(4)),
    });

    const current = parsePeriod(currentPeriod[0], currentLabel, currentFrom, currentTo);
    const previous = parsePeriod(previousPeriod[0], previousLabel, previousFrom, previousTo);

    const pctChange = (curr: number, prev: number) => {
      if (prev === 0) return curr === 0 ? 0 : 100;
      return parseFloat((((curr - prev) / prev) * 100).toFixed(2));
    };

    const parseProducts = (rows: any[]) =>
      rows.map((r: any) => ({
        name_en: r.name_en,
        name_ar: r.name_ar,
        total_qty: parseFloat(r.total_qty || '0'),
        total_revenue: parseFloat(r.total_revenue || '0'),
      }));

    return {
      current,
      previous,
      changes: {
        revenue_pct: pctChange(current.revenue, previous.revenue),
        cost_pct: pctChange(current.cost, previous.cost),
        profit_pct: pctChange(current.profit, previous.profit),
        invoice_count_pct: pctChange(current.invoice_count, previous.invoice_count),
        avg_ticket_pct: pctChange(current.avg_ticket, previous.avg_ticket),
      },
      topProducts: {
        current: parseProducts(currentProducts),
        previous: parseProducts(previousProducts),
      },
    };
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
