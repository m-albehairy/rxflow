export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
  CREDIT = 'CREDIT',
  EXCHANGE = 'EXCHANGE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  CREDIT = 'CREDIT',
  SPLIT = 'SPLIT',
  REFUND = 'REFUND',
  WALLET = 'WALLET',
}

export enum HoldStatus {
  HELD = 'HELD',
  RESUMED = 'RESUMED',
  EXPIRED = 'EXPIRED',
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
}
