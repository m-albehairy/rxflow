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
}
