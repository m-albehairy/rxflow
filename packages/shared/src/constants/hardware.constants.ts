export const BARCODE_TIMEOUT_MS = 100;
export const BARCODE_MIN_LENGTH = 3;
export const DRAWER_KICK_DELAY_MS = 200;
export const PRINTER_TIMEOUT_MS = 5000;
export const DEFAULT_PAPER_WIDTH = 80;
export const RECEIPT_PAPER_SIZES = ['58mm', '80mm', 'A4'] as const;
export type ReceiptPaperSize = (typeof RECEIPT_PAPER_SIZES)[number];
