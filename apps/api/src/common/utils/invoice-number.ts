/**
 * Invoice number format: {PREFIX}-{YEAR}-{SEQUENCE}
 * Example: INV-2026-000001
 * Sequence resets per fiscal year
 */
export function formatInvoiceNumber(prefix: string, year: number, sequence: number, pad: number = 6): string {
  return `${prefix}-${year}-${String(sequence).padStart(pad, '0')}`;
}

export function parseInvoiceNumber(invoiceNumber: string): {
  prefix: string;
  year: number;
  sequence: number;
} | null {
  const match = invoiceNumber.match(/^([A-Z]+)-(\d{4})-(\d+)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    year: parseInt(match[2], 10),
    sequence: parseInt(match[3], 10),
  };
}
