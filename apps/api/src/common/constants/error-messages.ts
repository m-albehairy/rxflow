export const ErrorMessages = {
  // Auth
  INVALID_CREDENTIALS: 'auth.invalidCredentials',
  TOKEN_EXPIRED: 'auth.tokenExpired',
  UNAUTHORIZED: 'auth.unauthorized',
  FORBIDDEN: 'auth.forbidden',
  INVALID_PIN: 'auth.invalidPin',

  // Users
  USER_NOT_FOUND: 'users.notFound',
  USER_ALREADY_EXISTS: 'users.alreadyExists',
  USER_INACTIVE: 'users.inactive',

  // Products
  PRODUCT_NOT_FOUND: 'products.notFound',
  PRODUCT_BARCODE_EXISTS: 'products.barcodeExists',
  PRODUCT_INCOMPLETE: 'products.incomplete',

  // Inventory
  INSUFFICIENT_STOCK: 'inventory.insufficientStock',
  NEGATIVE_STOCK: 'inventory.negativeStock',
  BATCH_EXPIRED: 'inventory.batchExpired',
  BATCH_NOT_FOUND: 'inventory.batchNotFound',

  // Purchases
  PURCHASE_NOT_FOUND: 'purchases.notFound',
  PURCHASE_VOID_EXPIRED: 'purchases.voidExpired',
  PURCHASE_ALREADY_VOIDED: 'purchases.alreadyVoided',

  // Sales / Invoices
  INVOICE_NOT_FOUND: 'sales.invoiceNotFound',
  INVOICE_ALREADY_VOIDED: 'sales.alreadyVoided',
  BELOW_COST_BLOCKED: 'sales.belowCostBlocked',
  DISCOUNT_EXCEEDED: 'sales.discountExceeded',

  // Credit
  CREDIT_NOT_ENABLED: 'credit.notEnabled',
  CREDIT_LIMIT_EXCEEDED: 'credit.limitExceeded',
  CREDIT_ACCOUNT_SUSPENDED: 'credit.accountSuspended',
  CREDIT_ACCOUNT_NOT_FOUND: 'credit.accountNotFound',

  // Settings
  SETTING_NOT_FOUND: 'settings.notFound',
  SETTING_LOCKED: 'settings.locked',

  // Rules
  RULE_BLOCKED: 'rules.blocked',
  RULE_SYSTEM_CANNOT_DELETE: 'rules.systemCannotDelete',

  // Shifts
  SHIFT_NOT_OPEN: 'shifts.notOpen',
  SHIFT_ALREADY_OPEN: 'shifts.alreadyOpen',

  // General
  NOT_FOUND: 'general.notFound',
  VERSION_CONFLICT: 'general.versionConflict',
  SETUP_REQUIRED: 'general.setupRequired',
  SETUP_ALREADY_COMPLETE: 'general.setupAlreadyComplete',
} as const;
