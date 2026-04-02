// ── Event name constants ──────────────────────────────────────────
export const LARGE_SALE_EVENT = 'notification.largeSale';
export const SALE_VOIDED_EVENT = 'notification.saleVoided';
export const SALE_REFUNDED_EVENT = 'notification.saleRefunded';
export const BELOW_COST_SALE_EVENT = 'notification.belowCostSale';
export const CREDIT_LIMIT_APPROACHING_EVENT = 'notification.creditLimitApproaching';
export const EXPENSE_SUBMITTED_EVENT = 'notification.expenseSubmitted';
export const EXPENSE_APPROVED_EVENT = 'notification.expenseApproved';
export const EXPENSE_REJECTED_EVENT = 'notification.expenseRejected';
export const TRANSFER_CREATED_EVENT = 'notification.transferCreated';
export const TRANSFER_APPROVED_EVENT = 'notification.transferApproved';
export const TRANSFER_REJECTED_EVENT = 'notification.transferRejected';

// ── Event payload classes ─────────────────────────────────────────

export class LargeSaleEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly invoiceNumber: string,
    public readonly total: number,
    public readonly cashierId: string,
    public readonly branchId: string,
  ) {}
}

export class SaleVoidedEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly invoiceNumber: string,
    public readonly total: number,
    public readonly userId: string,
  ) {}
}

export class SaleRefundedEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly refundInvoiceId: string,
    public readonly invoiceNumber: string,
    public readonly amount: number,
    public readonly userId: string,
  ) {}
}

export class BelowCostSaleEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly productId: string,
    public readonly productNameEn: string,
    public readonly productNameAr: string,
    public readonly cost: number,
    public readonly sellingPrice: number,
    public readonly userId: string,
  ) {}
}

export class CreditLimitApproachingEvent {
  constructor(
    public readonly customerId: string,
    public readonly customerName: string,
    public readonly customerNameAr: string,
    public readonly currentBalance: number,
    public readonly creditLimit: number,
    public readonly userId: string,
  ) {}
}

export class ExpenseSubmittedEvent {
  constructor(
    public readonly expenseId: string,
    public readonly amount: number,
    public readonly category: string,
    public readonly description: string,
    public readonly submitterId: string,
  ) {}
}

export class ExpenseApprovedEvent {
  constructor(
    public readonly expenseId: string,
    public readonly amount: number,
    public readonly approverId: string,
    public readonly submitterId: string,
  ) {}
}

export class ExpenseRejectedEvent {
  constructor(
    public readonly expenseId: string,
    public readonly amount: number,
    public readonly approverId: string,
    public readonly submitterId: string,
  ) {}
}

export class TransferCreatedEvent {
  constructor(
    public readonly transferId: string,
    public readonly transferNumber: string,
    public readonly fromBranchId: string,
    public readonly fromBranchName: string,
    public readonly fromBranchNameAr: string,
    public readonly toBranchId: string,
    public readonly requestedById: string,
  ) {}
}

export class TransferApprovedEvent {
  constructor(
    public readonly transferId: string,
    public readonly transferNumber: string,
    public readonly approverId: string,
    public readonly requestedById: string,
  ) {}
}

export class TransferRejectedEvent {
  constructor(
    public readonly transferId: string,
    public readonly transferNumber: string,
    public readonly approverId: string,
    public readonly requestedById: string,
  ) {}
}
