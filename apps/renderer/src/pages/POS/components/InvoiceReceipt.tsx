import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ReceiptPaperSize } from '@pharmapos/shared';

export interface InvoiceReceiptProps {
  invoice: any;
  pharmacyName?: string;
  pharmacyNameAr?: string;
  pharmacyAddress?: string;
  pharmacyPhone?: string;
  currency?: string;
  headerText?: string;
  headerTextAr?: string;
  footerText?: string;
  footerTextAr?: string;
  paperSize?: ReceiptPaperSize;
}

const PAPER_WIDTHS: Record<string, number> = {
  '58mm': 210,
  '80mm': 290,
  A4: 700,
};

export function InvoiceReceipt({
  invoice,
  pharmacyName,
  pharmacyNameAr,
  pharmacyAddress,
  pharmacyPhone,
  currency = 'EGP',
  headerText,
  headerTextAr,
  footerText,
  footerTextAr,
  paperSize = '80mm',
}: InvoiceReceiptProps) {
  const { t } = useTranslation('pos');

  if (!invoice) return null;

  const isA4 = paperSize === 'A4';
  const width = PAPER_WIDTHS[paperSize] || 290;

  const fmt = (v: string | number) => parseFloat(String(v || 0)).toFixed(2);
  const fmtQty = (v: string | number) => parseFloat(String(v || 0)).toFixed(0);

  const items: any[] = invoice.items || [];
  const payments: any[] = invoice.payments || [];
  const cashPayment = payments.find((p: any) => p.method === 'CASH');
  const hasDiscount = parseFloat(invoice.discountAmount || 0) > 0;

  const base: React.CSSProperties = {
    fontFamily: isA4 ? 'Arial, sans-serif' : "'Courier New', monospace",
    fontSize: isA4 ? 13 : 11,
    color: '#000',
    background: '#fff',
    width,
    margin: '0 auto',
    padding: isA4 ? 24 : 8,
    boxSizing: 'border-box',
  };

  const center: React.CSSProperties = { textAlign: 'center' };
  const bold: React.CSSProperties = { fontWeight: 700 };
  const dashed: React.CSSProperties = {
    borderTop: '1px dashed #000',
    margin: isA4 ? '12px 0' : '6px 0',
  };
  const row: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    lineHeight: 1.6,
  };

  if (isA4) {
    return (
      <div className="receipt-print-container" style={base}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            {pharmacyNameAr && <div style={{ ...bold, fontSize: 18, direction: 'rtl' }}>{pharmacyNameAr}</div>}
            {pharmacyName && <div style={{ ...bold, fontSize: 16 }}>{pharmacyName}</div>}
            {pharmacyAddress && <div style={{ fontSize: 12, color: '#555' }}>{pharmacyAddress}</div>}
            {pharmacyPhone && <div style={{ fontSize: 12, color: '#555' }}>{pharmacyPhone}</div>}
            {headerTextAr && <div style={{ fontSize: 11, color: '#555', direction: 'rtl', marginTop: 4 }}>{headerTextAr}</div>}
            {headerText && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{headerText}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...bold, fontSize: 18 }}>{t('receiptInvoice')}</div>
            <div style={{ fontSize: 13 }}>#{invoice.invoiceNumber}</div>
            <div style={{ fontSize: 12, color: '#555' }}>{new Date(invoice.createdAt).toLocaleString()}</div>
            {invoice.cashier && <div style={{ fontSize: 12, color: '#555' }}>{t('receiptCashier')}: {invoice.cashier.fullName}</div>}
          </div>
        </div>

        {/* Customer */}
        {invoice.customer && (
          <div style={{ marginBottom: 12, padding: 8, border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}>
            <span style={bold}>{t('receiptCustomer')}: </span>{invoice.customer.fullName}
            {invoice.customer.phone && <span> | {invoice.customer.phone}</span>}
          </div>
        )}

        {/* Items table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '6px 4px' }}>#</th>
              <th style={{ textAlign: 'left', padding: '6px 4px' }}>{t('receiptItem')}</th>
              <th style={{ textAlign: 'center', padding: '6px 4px' }}>{t('quantity')}</th>
              <th style={{ textAlign: 'right', padding: '6px 4px' }}>{t('receiptPrice')}</th>
              {hasDiscount && <th style={{ textAlign: 'right', padding: '6px 4px' }}>{t('receiptDisc')}</th>}
              <th style={{ textAlign: 'right', padding: '6px 4px' }}>{t('total')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px' }}>{i + 1}</td>
                <td style={{ padding: '4px' }}>
                  {item.product?.nameEn || item.service?.nameEn || t('receiptItem')}
                  {item.product?.nameAr && (
                    <div style={{ fontSize: 10, color: '#777', direction: 'rtl' }}>{item.product.nameAr}</div>
                  )}
                </td>
                <td style={{ textAlign: 'center', padding: '4px' }}>{fmtQty(item.quantity)}</td>
                <td style={{ textAlign: 'right', padding: '4px' }}>{fmt(item.sellingPrice)}</td>
                {hasDiscount && <td style={{ textAlign: 'right', padding: '4px' }}>{parseFloat(item.discountPct || 0) > 0 ? `${parseFloat(item.discountPct).toFixed(1)}%` : '-'}</td>}
                <td style={{ textAlign: 'right', padding: '4px' }}>{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginTop: 12, borderTop: '2px solid #000', paddingTop: 8 }}>
          <div style={{ ...row, fontSize: 12 }}>
            <span>{t('receiptSubtotal')}</span><span>{fmt(invoice.subtotal)} {currency}</span>
          </div>
          {hasDiscount && (
            <div style={{ ...row, fontSize: 12, color: '#c00' }}>
              <span>{t('receiptDiscount')}</span><span>-{fmt(invoice.discountAmount)} {currency}</span>
            </div>
          )}
          <div style={{ ...row, fontSize: 12 }}>
            <span>{t('receiptTax')}</span><span>{fmt(invoice.taxAmount)} {currency}</span>
          </div>
          <div style={{ ...row, ...bold, fontSize: 16, marginTop: 4 }}>
            <span>{t('receiptTotal')}</span><span>{fmt(invoice.total)} {currency}</span>
          </div>
        </div>

        {/* Payment */}
        <div style={{ marginTop: 12, fontSize: 12 }}>
          {payments.map((p: any, i: number) => (
            <div key={i} style={row}>
              <span>{t('receiptPaid')} ({p.method})</span><span>{fmt(p.amount)} {currency}</span>
            </div>
          ))}
          {cashPayment && parseFloat(cashPayment.amount) > parseFloat(invoice.total) && (
            <div style={{ ...row, ...bold }}>
              <span>{t('receiptChange')}</span><span>{fmt(parseFloat(cashPayment.amount) - parseFloat(invoice.total))} {currency}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ ...center, marginTop: 24, fontSize: 11, color: '#777' }}>
          {footerTextAr && <div dir="rtl">{footerTextAr}</div>}
          {footerText && <div>{footerText}</div>}
          <div style={{ marginTop: 8, fontSize: 9 }}>Powered by RxFlow</div>
        </div>
      </div>
    );
  }

  // ─── Thermal receipt (58mm / 80mm) ───
  return (
    <div className="receipt-print-container" style={base}>
      {/* Pharmacy header */}
      {pharmacyNameAr && <div style={{ ...center, ...bold, fontSize: 14, direction: 'rtl' }}>{pharmacyNameAr}</div>}
      {pharmacyName && <div style={{ ...center, ...bold, fontSize: 13 }}>{pharmacyName}</div>}
      {pharmacyAddress && <div style={{ ...center, fontSize: 9, color: '#555' }}>{pharmacyAddress}</div>}
      {pharmacyPhone && <div style={{ ...center, fontSize: 9, color: '#555' }}>{pharmacyPhone}</div>}
      {headerTextAr && <div style={{ ...center, fontSize: 9, direction: 'rtl', marginTop: 2 }}>{headerTextAr}</div>}
      {headerText && <div style={{ ...center, fontSize: 9, marginTop: 1 }}>{headerText}</div>}

      <div style={dashed} />

      {/* Invoice info */}
      <div style={row}><span>#{invoice.invoiceNumber}</span><span>{new Date(invoice.createdAt).toLocaleString()}</span></div>
      {invoice.cashier && <div style={{ fontSize: 9, color: '#555' }}>{t('receiptCashier')}: {invoice.cashier.fullName}</div>}
      {invoice.customer && <div style={{ fontSize: 9, color: '#555' }}>{t('receiptCustomer')}: {invoice.customer.fullName}</div>}

      <div style={dashed} />

      {/* Items */}
      {items.map((item: any, i: number) => (
        <div key={i} style={{ marginBottom: 3 }}>
          <div style={{ fontSize: 10, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {item.product?.nameEn || item.service?.nameEn || t('receiptItem')}
          </div>
          <div style={{ ...row, fontSize: 10 }}>
            <span>{fmtQty(item.quantity)} x {fmt(item.sellingPrice)}</span>
            <span>{fmt(item.total)}</span>
          </div>
        </div>
      ))}

      <div style={dashed} />

      {/* Totals */}
      <div style={{ ...row, fontSize: 10 }}>
        <span>{t('receiptSubtotal')}</span><span>{fmt(invoice.subtotal)}</span>
      </div>
      {hasDiscount && (
        <div style={{ ...row, fontSize: 10 }}>
          <span>{t('receiptDiscount')}</span><span>-{fmt(invoice.discountAmount)}</span>
        </div>
      )}
      <div style={{ ...row, fontSize: 10 }}>
        <span>{t('receiptTax')}</span><span>{fmt(invoice.taxAmount)}</span>
      </div>
      <div style={dashed} />
      <div style={{ ...row, ...bold, fontSize: 14 }}>
        <span>{t('receiptTotal')}</span><span>{fmt(invoice.total)} {currency}</span>
      </div>

      {/* Payment */}
      <div style={dashed} />
      {payments.map((p: any, i: number) => (
        <div key={i} style={{ ...row, fontSize: 10 }}>
          <span>{p.method}</span><span>{fmt(p.amount)}</span>
        </div>
      ))}
      {cashPayment && parseFloat(cashPayment.amount) > parseFloat(invoice.total) && (
        <div style={{ ...row, ...bold, fontSize: 11 }}>
          <span>{t('receiptChange')}</span><span>{fmt(parseFloat(cashPayment.amount) - parseFloat(invoice.total))}</span>
        </div>
      )}

      {/* Footer */}
      <div style={{ ...center, marginTop: 8, fontSize: 9, color: '#555' }}>
        {footerTextAr && <div dir="rtl">{footerTextAr}</div>}
        {footerText && <div>{footerText}</div>}
        <div style={{ marginTop: 6, fontSize: 8 }}>Powered by RxFlow</div>
      </div>
    </div>
  );
}
