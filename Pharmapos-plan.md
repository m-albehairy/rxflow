# 💊 PharmaPOS — Complete System Plan

### Phase 1: Full Pharmacy Desktop POS System

> **Version:** 1.0 — Production-Ready  
> **Stack:** Electron · React · NestJS · PostgreSQL · Prisma · Zustand · Ant Design v5  
> **Target:** Small-to-medium pharmacies, offline-first, ERP-ready architecture

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Database Design](#3-database-design)
4. [Module 1 — Setup Wizard](#4-module-1--setup-wizard)
5. [Module 2 — Global Settings](#5-module-2--global-settings)
6. [Module 3 — Products & Categories](#6-module-3--products--categories)
7. [Module 4 — Inventory](#7-module-4--inventory)
8. [Module 5 — Suppliers & Purchases](#8-module-5--suppliers--purchases)
9. [Module 6 — POS / Sales](#9-module-6--pos--sales)
10. [Module 7 — Credit Sales & Accounts Receivable](#10-module-7--credit-sales--accounts-receivable)
11. [Module 8 — Pricing Engine](#11-module-8--pricing-engine)
12. [Module 9 — Rules Engine](#12-module-9--rules-engine)
13. [Module 10 — Customers & Loyalty](#13-module-10--customers--loyalty)
14. [Module 11 — Users, Roles & Permissions](#14-module-11--users-roles--permissions)
15. [Module 12 — Reports & Analytics](#15-module-12--reports--analytics)
16. [Module 13 — Audit Logs](#16-module-13--audit-logs)
17. [Module 14 — Multi-language & Theming](#17-module-14--multi-language--theming)
18. [Module 15 — Hardware Integration](#18-module-15--hardware-integration)
19. [Module 16 — Backup & Data Integrity](#19-module-16--backup--data-integrity)
20. [Frontend Architecture](#20-frontend-architecture)
21. [Backend Architecture](#21-backend-architecture)
22. [API Design](#22-api-design)
23. [Security Model](#23-security-model)
24. [Development Roadmap](#24-development-roadmap)
25. [Phase 2 Preview — ERP Expansion](#25-phase-2-preview--erp-expansion)

---

## 1. System Overview

### What Is This?

A **fully offline-capable, production-grade Pharmacy POS Desktop System** built on modern web technologies wrapped in Electron. It handles everything a pharmacy needs day-to-day: selling, purchasing, inventory, credit sales, reporting, and hardware — with full Arabic/English support and a customizable rules engine.

### Core Principles

| Principle               | Implementation                                                 |
| ----------------------- | -------------------------------------------------------------- |
| **Offline First**       | All data lives locally in PostgreSQL; sync is optional         |
| **Data Integrity**      | Transactions for all financial operations; no orphaned records |
| **Immutable Costing**   | WAC method locked after setup — cannot be changed              |
| **Audit Everything**    | Every price override, stock change, credit sale is logged      |
| **Role Enforcement**    | Rules engine + RBAC applied at API level, not just UI          |
| **Bilingual by Design** | All data has `nameEn` / `nameAr`; UI fully RTL/LTR             |
| **ERP-Ready**           | Modular architecture designed to expand into full ERP          |

### Key Actors

- **Administrator** — Full system access, settings, user management
- **Pharmacist** — POS, inventory, purchases, reports
- **Cashier** — POS only, limited price editing, no cost visibility
- **Manager** — Approve below-cost sales, credit approvals, all reports
- **Inventory Clerk** — Purchase invoices, inventory adjustments only

---

## 2. Tech Stack & Architecture

### Technology Choices

| Layer            | Technology                | Reason                                 |
| ---------------- | ------------------------- | -------------------------------------- |
| Desktop Shell    | **Electron 30+**          | Cross-platform, IPC for hardware       |
| Frontend         | **React 18 + Vite**       | Fast HMR, ecosystem                    |
| UI Library       | **Ant Design v5**         | Design tokens, RTL, rich components    |
| State Management | **Zustand + Immer**       | Simple, scalable, no boilerplate       |
| Backend          | **NestJS 10**             | Modular, dependency injection, guards  |
| ORM              | **Prisma 5**              | Type-safe, migrations, transactions    |
| Database         | **PostgreSQL 16**         | ACID, JSON support, reliable           |
| i18n             | **react-i18next**         | Namespace support, dynamic loading     |
| Numbers/Money    | **Decimal.js**            | No floating-point errors on money      |
| Validation       | **Zod + class-validator** | Runtime type safety frontend + backend |
| Testing          | **Vitest + Supertest**    | Unit + integration                     |
| Build            | **Electron Builder**      | Auto-update, NSIS/DMG/AppImage         |

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Electron Main Process                         │
│  ┌──────────────────┐   ┌──────────────────┐                   │
│  │  Window Manager  │   │  Hardware IPC    │                   │
│  │  Auto-Updater    │   │  Printer/Scanner │                   │
│  │  Deep Link       │   │  Cash Drawer     │                   │
│  └────────┬─────────┘   └────────┬─────────┘                   │
└───────────┼──────────────────────┼─────────────────────────────┘
            │ contextBridge        │ ipcRenderer.invoke
┌───────────▼──────────────────────▼─────────────────────────────┐
│                    React Renderer (Vite)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Ant Design │  │   Zustand    │  │   react-i18next (AR/EN)│  │
│  │  v5 Tokens  │  │   Stores     │  │   RTL / LTR Support   │  │
│  └─────────────┘  └──────────────┘  └───────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Page Components                         │   │
│  │  Setup │ POS │ Products │ Inventory │ Purchases │ Reports │   │
│  │  Credit │ Customers │ Users │ Settings │ Dashboard       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP (localhost:3001)
┌─────────────────────────▼───────────────────────────────────────┐
│                  NestJS Backend (localhost:3001)                  │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐  │
│  │  Auth  │ │ Sales  │ │Inventory │ │ Users  │ │   Rules    │  │
│  └────────┘ └────────┘ └──────────┘ └────────┘ └────────────┘  │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐  │
│  │Products│ │Purchases│ │ Customers│ │Reports │ │   Audit    │  │
│  └────────┘ └────────┘ └──────────┘ └────────┘ └────────────┘  │
│                    Guards │ Interceptors │ Pipes                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Prisma ORM
┌─────────────────────────▼───────────────────────────────────────┐
│                     PostgreSQL 16 (local)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
pharmapos/
├── apps/
│   ├── desktop/              # Electron main process
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   └── hardware/         # Printer, scanner, drawer IPC
│   ├── renderer/             # React frontend
│   │   ├── src/
│   │   └── vite.config.ts
│   └── api/                  # NestJS backend
│       ├── src/
│       └── prisma/
├── packages/
│   ├── shared/               # Shared types, DTOs, enums
│   ├── rules-engine/         # Portable rules evaluator
│   ├── printer/              # ESC/POS wrapper
│   └── decimal-utils/        # Money calculation helpers
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── scripts/
    ├── setup.ts
    ├── seed.ts
    └── build.ts
```

---

## 3. Database Design

### Core Tables Overview

```
users ──────────────── roles
  │                      │
  └── user_preferences    └── role_permissions
  │
  ├── invoices ────────── invoice_items ──── products
  │     │                                      │
  │     └── payments                        inventory
  │     │                                      │
  │     └── audit_logs                       batches
  │
  ├── credit_accounts ─── credit_payments
  │
  └── purchase_creator
        │
      purchases ──────── purchase_items ──── products

customers ─────────── credit_accounts
suppliers ─────────── purchases
categories ────────── products
settings
rules
audit_logs
```

### Full Prisma Schema

```prisma
// ─── ENUMS ──────────────────────────────────────────────────────

enum CostingMethod {
  WEIGHTED_AVERAGE
}

enum PricingMode {
  FIXED
  COST_PLUS
  HYBRID
}

enum RuleType {
  SALE
  INVENTORY
  USER
  CREDIT
}

enum RuleActionType {
  BLOCK
  WARN
  REQUIRE_APPROVAL
  AUTO_ADJUST
  NOTIFY
}

enum InvoiceStatus {
  DRAFT
  COMPLETED
  VOIDED
  REFUNDED
  CREDIT
}

enum PaymentMethod {
  CASH
  CARD
  CREDIT
  SPLIT
  REFUND
}

enum CreditStatus {
  ACTIVE
  OVERDUE
  SUSPENDED
  SETTLED
}

enum AuditAction {
  PRICE_OVERRIDE
  BELOW_COST_SALE
  INVENTORY_ADJUST
  CREDIT_SALE
  CREDIT_PAYMENT
  DISCOUNT_OVERRIDE
  SETTING_CHANGE
  PURCHASE_CREATED
  REFUND_ISSUED
  USER_LOGIN
  USER_LOGOUT
  RULE_TRIGGERED
}

// ─── USERS & ROLES ───────────────────────────────────────────────

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  nameAr      String
  description String?
  permissions Json
  // {
  //   canAccessPOS: bool, canAccessInventory: bool,
  //   canAccessReports: bool, canAccessSettings: bool,
  //   canEditPrice: bool, canSellBelowCost: bool,
  //   canApproveCreditSale: bool, canAdjustInventory: bool,
  //   canViewCost: bool, canGiveDiscount: bool,
  //   maxDiscountPercent: number, canVoidInvoice: bool,
  //   canRefundInvoice: bool, canManageUsers: bool
  // }
  users       User[]
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id            String          @id @default(cuid())
  username      String          @unique
  passwordHash  String
  fullName      String
  fullNameAr    String?
  isActive      Boolean         @default(true)
  roleId        String
  role          Role            @relation(fields: [roleId], references: [id])
  preferences   UserPreference?
  invoices      Invoice[]
  auditLogs     AuditLog[]
  purchases     Purchase[]
  lastLoginAt   DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model UserPreference {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  language      String   @default("en")
  theme         String   @default("light")
  primaryColor  String   @default("#4F46E5")
  fontSize      String   @default("medium")
  showCostInPOS Boolean  @default(false)
  defaultPrinter String?
  updatedAt     DateTime @updatedAt
}

// ─── SETTINGS ────────────────────────────────────────────────────

model Setting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       Json
  isLocked    Boolean  @default(false)
  group       String   @default("general")
  updatedById String?
  updatedAt   DateTime @updatedAt
}

// Keys reference:
// PHARMACY_NAME, PHARMACY_NAME_AR, PHARMACY_ADDRESS
// CURRENCY, CURRENCY_SYMBOL, TAX_PERCENT, TAX_LABEL
// COSTING_METHOD (LOCKED), PRICING_MODE, DEFAULT_MARGIN
// ALLOW_BELOW_COST, REQUIRE_APPROVAL_BELOW_COST, MAX_DISCOUNT_CASHIER
// CREDIT_SALES_ENABLED, DEFAULT_CREDIT_LIMIT, CREDIT_APPROVAL_REQUIRED
// PRINTER_TYPE, PRINTER_PORT, PAPER_WIDTH, DRAWER_ENABLED
// BARCODE_MODE, INVOICE_FOOTER_EN, INVOICE_FOOTER_AR
// LOW_STOCK_THRESHOLD, EXPIRY_ALERT_DAYS, SETUP_COMPLETE
// SHIFT_ENABLED, REQUIRE_SHIFT_CLOSE, BACKUP_ENABLED, BACKUP_PATH

// ─── CATEGORIES ─────────────────────────────────────────────────

model Category {
  id        String    @id @default(cuid())
  nameEn    String
  nameAr    String
  color     String?
  icon      String?
  sortOrder Int       @default(0)
  isActive  Boolean   @default(true)
  products  Product[]
  createdAt DateTime  @default(now())
}

// ─── PRODUCTS ────────────────────────────────────────────────────

model Product {
  id                   String         @id @default(cuid())
  barcode              String?        @unique
  barcode2             String?        // secondary barcode
  nameEn               String
  nameAr               String
  genericNameEn        String?
  genericNameAr        String?
  categoryId           String?
  category             Category?      @relation(fields: [categoryId], references: [id])
  defaultSellingPrice  Decimal        @db.Decimal(12, 4)
  minSellingPrice      Decimal?       @db.Decimal(12, 4) // floor price
  margin               Decimal        @db.Decimal(5, 2)
  taxable              Boolean        @default(true)
  trackExpiry          Boolean        @default(false)
  requirePrescription  Boolean        @default(false)
  unit                 String         @default("piece") // piece, box, strip, bottle
  unitsPerPack         Int            @default(1)
  isActive             Boolean        @default(true)
  isService            Boolean        @default(false) // non-inventory item
  notes                String?
  imageUrl             String?
  inventory            Inventory?
  purchaseItems        PurchaseItem[]
  invoiceItems         InvoiceItem[]
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt
}

// ─── INVENTORY ───────────────────────────────────────────────────

model Inventory {
  id           String   @id @default(cuid())
  productId    String   @unique
  product      Product  @relation(fields: [productId], references: [id])
  quantity     Decimal  @db.Decimal(12, 4) @default(0)
  reservedQty  Decimal  @db.Decimal(12, 4) @default(0) // for pending orders
  avgCost      Decimal  @db.Decimal(12, 4) @default(0)
  totalValue   Decimal  @db.Decimal(14, 4) @default(0)
  reorderLevel Decimal  @db.Decimal(12, 4) @default(0)
  maxLevel     Decimal? @db.Decimal(12, 4)
  lastPurchaseDate DateTime?
  lastSaleDate     DateTime?
  batches      Batch[]
  updatedAt    DateTime @updatedAt
}

model Batch {
  id           String    @id @default(cuid())
  inventoryId  String
  inventory    Inventory @relation(fields: [inventoryId], references: [id])
  batchNumber  String?
  quantity     Decimal   @db.Decimal(12, 4)
  remainingQty Decimal   @db.Decimal(12, 4)
  cost         Decimal   @db.Decimal(12, 4)
  expiryDate   DateTime?
  isExpired    Boolean   @default(false)
  purchaseItemId String?
  createdAt    DateTime  @default(now())
}

// ─── SUPPLIERS ────────────────────────────────────────────────────

model Supplier {
  id          String     @id @default(cuid())
  nameEn      String
  nameAr      String
  contactName String?
  phone       String?
  email       String?
  address     String?
  taxNumber   String?
  notes       String?
  isActive    Boolean    @default(true)
  purchases   Purchase[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// ─── PURCHASES ───────────────────────────────────────────────────

model Purchase {
  id           String         @id @default(cuid())
  purchaseNumber String       @unique
  supplierId   String?
  supplier     Supplier?      @relation(fields: [supplierId], references: [id])
  createdById  String
  createdBy    User           @relation(fields: [createdById], references: [id])
  refNumber    String?
  invoiceDate  DateTime       @default(now())
  totalCost    Decimal        @db.Decimal(14, 4)
  taxAmount    Decimal        @db.Decimal(14, 4) @default(0)
  grandTotal   Decimal        @db.Decimal(14, 4)
  notes        String?
  status       String         @default("POSTED") // DRAFT, POSTED, VOIDED
  items        PurchaseItem[]
  auditLogs    AuditLog[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model PurchaseItem {
  id            String    @id @default(cuid())
  purchaseId    String
  purchase      Purchase  @relation(fields: [purchaseId], references: [id])
  productId     String
  product       Product   @relation(fields: [productId], references: [id])
  quantity      Decimal   @db.Decimal(12, 4)
  freeQuantity  Decimal   @db.Decimal(12, 4) @default(0)
  unitCost      Decimal   @db.Decimal(12, 4)
  totalCost     Decimal   @db.Decimal(14, 4)
  expiryDate    DateTime?
  batchNumber   String?
  // WAC snapshot
  prevQty       Decimal   @db.Decimal(12, 4)
  prevAvgCost   Decimal   @db.Decimal(12, 4)
  newAvgCost    Decimal   @db.Decimal(12, 4)
}

// ─── CUSTOMERS ────────────────────────────────────────────────────

model Customer {
  id             String         @id @default(cuid())
  name           String
  nameAr         String?
  phone          String?        @unique
  email          String?
  nationalId     String?
  dateOfBirth    DateTime?
  address        String?
  notes          String?
  isActive       Boolean        @default(true)
  loyaltyPoints  Int            @default(0)
  totalPurchases Decimal        @db.Decimal(14, 4) @default(0)
  invoiceCount   Int            @default(0)
  creditAccount  CreditAccount?
  invoices       Invoice[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

// ─── CREDIT / AR ─────────────────────────────────────────────────

model CreditAccount {
  id             String           @id @default(cuid())
  customerId     String           @unique
  customer       Customer         @relation(fields: [customerId], references: [id])
  creditLimit    Decimal          @db.Decimal(12, 4) @default(0)
  currentBalance Decimal          @db.Decimal(12, 4) @default(0)
  status         CreditStatus     @default(ACTIVE)
  lastPaymentDate DateTime?
  payments       CreditPayment[]
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

model CreditPayment {
  id              String        @id @default(cuid())
  creditAccountId String
  creditAccount   CreditAccount @relation(fields: [creditAccountId], references: [id])
  amount          Decimal       @db.Decimal(12, 4)
  method          PaymentMethod @default(CASH)
  notes           String?
  collectedById   String?
  invoiceId       String?
  createdAt       DateTime      @default(now())
}

// ─── INVOICES ────────────────────────────────────────────────────

model Invoice {
  id             String        @id @default(cuid())
  invoiceNumber  String        @unique
  cashierId      String
  cashier        User          @relation(fields: [cashierId], references: [id])
  customerId     String?
  customer       Customer?     @relation(fields: [customerId], references: [id])
  subtotal       Decimal       @db.Decimal(14, 4)
  discountAmount Decimal       @db.Decimal(14, 4) @default(0)
  discountPct    Decimal       @db.Decimal(5, 2)  @default(0)
  taxAmount      Decimal       @db.Decimal(14, 4) @default(0)
  total          Decimal       @db.Decimal(14, 4)
  totalCost      Decimal       @db.Decimal(14, 4)
  profit         Decimal       @db.Decimal(14, 4)
  profitMargin   Decimal       @db.Decimal(5, 2)
  status         InvoiceStatus @default(COMPLETED)
  notes          String?
  items          InvoiceItem[]
  payments       Payment[]
  auditLogs      AuditLog[]
  shiftId        String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model InvoiceItem {
  id             String  @id @default(cuid())
  invoiceId      String
  invoice        Invoice @relation(fields: [invoiceId], references: [id])
  productId      String
  product        Product @relation(fields: [productId], references: [id])
  quantity       Decimal @db.Decimal(12, 4)
  cost           Decimal @db.Decimal(12, 4) // WAC snapshot
  suggestedPrice Decimal @db.Decimal(12, 4)
  sellingPrice   Decimal @db.Decimal(12, 4)
  discountPct    Decimal @db.Decimal(5, 2)  @default(0)
  discountAmount Decimal @db.Decimal(12, 4) @default(0)
  total          Decimal @db.Decimal(14, 4)
  profit         Decimal @db.Decimal(14, 4)
  isBelowCost    Boolean @default(false)
  isOverride     Boolean @default(false)
  batchId        String?
  expiryDate     DateTime?
}

model Payment {
  id        String        @id @default(cuid())
  invoiceId String
  invoice   Invoice       @relation(fields: [invoiceId], references: [id])
  method    PaymentMethod
  amount    Decimal       @db.Decimal(12, 4)
  reference String?
  notes     String?
  createdAt DateTime      @default(now())
}

// ─── SHIFTS ──────────────────────────────────────────────────────

model Shift {
  id              String   @id @default(cuid())
  cashierId       String
  openedAt        DateTime @default(now())
  closedAt        DateTime?
  openingCash     Decimal  @db.Decimal(12, 4) @default(0)
  closingCash     Decimal? @db.Decimal(12, 4)
  systemCash      Decimal? @db.Decimal(12, 4)
  variance        Decimal? @db.Decimal(12, 4)
  invoiceCount    Int      @default(0)
  totalRevenue    Decimal  @db.Decimal(14, 4) @default(0)
  totalProfit     Decimal  @db.Decimal(14, 4) @default(0)
  notes           String?
  status          String   @default("OPEN")
}

// ─── RULES ───────────────────────────────────────────────────────

model Rule {
  id          String         @id @default(cuid())
  name        String
  nameAr      String?
  description String?
  type        RuleType
  condition   Json
  action      Json
  priority    Int            @default(0)
  isActive    Boolean        @default(true)
  isSystem    Boolean        @default(false) // system rules can't be deleted
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

// ─── AUDIT LOGS ──────────────────────────────────────────────────

model AuditLog {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  action      AuditAction
  entityType  String
  entityId    String
  invoiceId   String?
  invoice     Invoice?    @relation(fields: [invoiceId], references: [id])
  purchaseId  String?
  purchase    Purchase?   @relation(fields: [purchaseId], references: [id])
  before      Json?
  after       Json?
  metadata    Json?
  ipAddress   String?
  createdAt   DateTime    @default(now())
}
```

---

## 4. Module 1 — Setup Wizard

> **Triggered:** First launch only. `SETUP_COMPLETE` setting is `false`.  
> **Immutable decisions** are locked in settings after this step.

### Wizard Steps

```
Step 1: Pharmacy Information
  ├── Pharmacy Name (EN + AR)
  ├── Address
  ├── Tax Registration Number
  ├── Currency (dropdown: SAR, AED, EGP, USD…)
  ├── Tax Percentage (default 15%)
  └── Pharmacy Logo (optional)

Step 2: Inventory Costing Method  ← LOCKED AFTER THIS STEP
  ├── Weighted Average Cost (WAC) — selected & explained
  └── Info: "This cannot be changed after setup. WAC calculates a
           running average cost across all purchase batches."

Step 3: Pricing Strategy
  ├── FIXED — sell at product's fixed price
  ├── COST_PLUS — auto-calculate from cost + margin
  └── HYBRID (recommended) — suggested price, fully editable

Step 4: Credit Sales Configuration
  ├── Enable Credit Sales (yes/no)
  ├── Default Credit Limit (SAR)
  ├── Require Manager Approval for credit sales?
  └── Alert when credit exceeds X%

Step 5: Rules & Permissions
  ├── Allow selling below cost? (Block / Require Approval / Allow)
  ├── Max cashier discount % (default 10%)
  ├── Require prescription flag on controlled meds?
  └── Enable expiry date tracking?

Step 6: Hardware Setup
  ├── Printer Type (ESC/POS USB / Serial / Network / None)
  ├── Printer Port / IP
  ├── Paper Width (80mm / 58mm)
  ├── Barcode Scanner Mode (Keyboard / Serial)
  ├── Cash Drawer (connected to printer? yes/no)
  └── Test printer button

Step 7: Create Admin User
  ├── Full Name (EN + AR)
  ├── Username
  ├── Password + Confirm
  └── PIN Code (for quick approval flows)
```

### Wizard Technical Behavior

- Each step validates before proceeding
- All data is collected in memory; only committed to DB on final step
- On commit: creates settings, role seed data, admin user, default categories, default rules
- Sets `SETUP_COMPLETE = true` — never shows again
- Redirect to Dashboard on success

---

## 5. Module 2 — Global Settings

### Settings Groups

#### General

- Pharmacy name (EN/AR), address, logo
- Currency, currency symbol, decimal places
- Tax percentage, tax label (VAT/GST)
- Fiscal year start month
- Invoice prefix (INV-, RX-, etc.)

#### Pricing Settings

- Pricing mode (FIXED / COST_PLUS / HYBRID)
- Default product margin %
- Allow below-cost selling (BLOCK / REQUIRE_APPROVAL / ALLOW)
- Max cashier discount %
- Max manager discount %
- Show cost to cashier (yes/no)
- Round prices to nearest 0.25 / 0.5 / 1.00

#### Credit Sales Settings

- Enable/disable credit sales globally
- Default credit limit per new customer
- Require approval for credit sales
- Max credit age (days before overdue)
- Auto-suspend credit after X days overdue

#### Stock & Alerts

- Low stock threshold (units — global default)
- Expiry alert advance days (e.g., alert 30 days before expiry)
- Out-of-stock selling (block/warn)
- Auto-create reorder if below threshold (future)

#### Hardware Settings

- Printer type, port, IP
- Paper width (58mm / 80mm)
- Barcode scanner mode
- Cash drawer enabled
- Invoice language (EN / AR / Both)
- Print logo on invoice
- QR code on invoice (optional)

#### Shift Settings

- Enable shift management
- Require shift to be open to sell
- Allow opening cash declaration
- Print shift summary on close

#### Backup & Sync

- Auto-backup enabled
- Backup directory path
- Backup frequency
- Last backup timestamp

---

## 6. Module 3 — Products & Categories

### Category Management

- Add / Edit / Delete categories
- Name EN + AR
- Color coding for POS grid
- Icon from icon library
- Sort order
- Active/inactive toggle

### Product Fields

| Field                 | Type            | Notes                                   |
| --------------------- | --------------- | --------------------------------------- |
| `barcode`             | string (unique) | Primary barcode                         |
| `barcode2`            | string          | Secondary / alias barcode               |
| `nameEn`              | string          | English name                            |
| `nameAr`              | string          | Arabic name                             |
| `genericNameEn`       | string          | Generic / INN name                      |
| `genericNameAr`       | string          | Generic Arabic                          |
| `category`            | relation        | FK to categories                        |
| `defaultSellingPrice` | Decimal         | Used as suggested price                 |
| `minSellingPrice`     | Decimal         | Floor — cannot sell below this          |
| `margin`              | Decimal %       | Used in COST_PLUS mode                  |
| `taxable`             | boolean         | Apply tax or not                        |
| `trackExpiry`         | boolean         | Enable batch expiry tracking            |
| `requirePrescription` | boolean         | Block sale without Rx flag              |
| `unit`                | enum            | piece, box, strip, bottle, vial         |
| `unitsPerPack`        | int             | For unit conversion                     |
| `isService`           | boolean         | Non-inventory item (e.g., consultation) |

### Product Actions

- Add / Edit / Delete
- Bulk import via CSV/Excel
- Bulk price update (by category or margin)
- Barcode generation & print
- Product duplication
- Merge duplicate products
- Archive (soft delete)
- Product history (price changes, avg cost trend)

### Product Quick-Add (from POS)

- Cashier can add a product on-the-fly if it doesn't exist
- Requires minimum: name + price
- Flags the product as "incomplete" for follow-up
- Goes to audit log

---

## 7. Module 4 — Inventory

### Inventory Tracking

- Real-time quantity for every product
- Weighted Average Cost per product
- Total inventory value
- Reserved quantity (pending orders — Phase 2)
- Batch-level tracking (expiry, batch number)

### Inventory Operations

#### Manual Adjustment

- Add / Remove stock
- Reason required (physical count, damage, return, theft)
- Goes to audit log with before/after snapshot

#### Physical Count (Stock Take)

- Export current quantities to CSV/Excel
- Import counted quantities
- System calculates variance
- Apply adjustments in one transaction
- Generates stock take report

#### Batch Management

- Each purchase creates one or more batches
- FEFO (First Expiry First Out) sale deduction
- Expiry alerts configurable per product
- Mark batches as expired manually
- Expired batch prevention at POS (rules engine)

### Inventory Reports Built-In

- Current stock value by category
- Low stock list (below reorder level)
- Near-expiry list (within X days)
- Expired items list
- Dead stock (no movement in X days)
- Stock movement history per product

---

## 8. Module 5 — Suppliers & Purchases

### Supplier Management

- Full supplier profile (name EN/AR, contact, tax number)
- Purchase history per supplier
- Supplier performance (avg lead time — Phase 2)
- Active / inactive toggle

### Purchase Invoice Flow

```
1. Select supplier (or walk-in)
2. Add purchase items:
   - Search product by name / barcode
   - Enter: Qty, Free Qty, Unit Cost, Expiry Date, Batch #
3. System shows WAC Preview:
   - Old Qty, Old Avg Cost
   - New Qty, New Unit Cost
   - Calculated New Avg Cost  ← formula displayed live
4. Add invoice-level tax / discount if applicable
5. Confirm Purchase:
   - Creates Purchase record
   - Creates PurchaseItems
   - Updates Inventory (WAC recalculated in transaction)
   - Creates Batches
   - Logs to AuditLog
6. Option to print purchase receipt
```

### WAC Formula (Enforced at DB Level)

```
newAvgCost = ((oldQty × oldAvgCost) + (newQty × newUnitCost))
             ─────────────────────────────────────────────────
                        (oldQty + newQty)
```

- Calculated inside a Prisma `$transaction`
- `avgCost` on Inventory is NEVER touched by sales
- Only purchases and manual adjustments update `avgCost`
- Purchase can be voided (reverses WAC) within same day only

### Additional Purchase Features

- Draft purchases (save and return)
- Purchase return to supplier
- Free goods handling (zero-cost qty field)
- Multi-batch single product on one invoice
- Duplicate purchase detection (same supplier + ref number)

---

## 9. Module 6 — POS / Sales

### POS Screen Layout

```
┌─────────────────────────────────────────────┬──────────────────┐
│  [Search / Barcode Input]      [Scanner ●]  │  🛒 Cart         │
├─────────────────────────────────────────────│                  │
│  [All] [Pain Relief] [Vitamins] [Antibiotics]│  Item rows:      │
├─────────────────────────────────────────────│  - Name          │
│                                             │  - Cost (if perm)│
│   Product Grid                              │  - Suggested     │
│   (icon, name, price, stock)               │  - Sell Price ✎  │
│                                             │  - Disc %  ✎     │
│                                             │  - Qty  −  +     │
│                                             │  - Line Total    │
│                                             ├──────────────────│
│                                             │  Subtotal        │
│                                             │  Discount        │
│                                             │  Tax             │
│                                             │  ─────────────── │
│                                             │  TOTAL           │
│                                             │  [💳 CHECKOUT]   │
└─────────────────────────────────────────────┴──────────────────┘
```

### Sale Flow

```
1. Cashier opens POS
2. (Optional) Open shift — declare opening cash
3. Scan barcode OR search product OR Quick Add
4. Product added to cart with:
   - Cost (from Inventory.avgCost — snapshot)
   - Suggested price (per pricing mode)
   - Editable selling price (within permissions)
   - Per-item discount (within role limit)
5. Rules Engine evaluates cart in real-time:
   - Below cost? → warn / block / require approval
   - Expired batch? → block
   - Out of stock? → block
   - Discount exceeds role limit? → block / require approval
6. (Optional) Apply cart-level discount
7. (Optional) Select / add customer
8. Proceed to Checkout:
   - Choose payment method(s)
   - Cash → show change due
   - Card → confirm terminal
   - Credit → check credit limit → requires permission
   - Split → allocate cash + card amounts
9. Confirm Payment:
   - Creates Invoice + InvoiceItems
   - Deducts Inventory (FEFO batch selection)
   - Creates Payment record
   - If credit → updates CreditAccount balance
   - Logs any overrides to AuditLog
10. Print invoice (thermal)
11. Open cash drawer (if cash payment)
12. Cart resets for next sale
```

### Payment Methods Detail

| Method               | Behavior                                             |
| -------------------- | ---------------------------------------------------- |
| **Cash**             | Enter received amount → calculate change             |
| **Card**             | Confirm terminal signal → log reference number       |
| **Credit (Full)**    | Full invoice goes to AR → customer balance increases |
| **Credit (Partial)** | Part cash/card now, rest to AR                       |
| **Split**            | Any combination of Cash + Card + Credit              |

### Held Orders

- Save current cart with a label
- Resume any held order
- Up to 10 simultaneous holds
- Held orders persist across shift

### Refunds & Returns

- Open existing invoice
- Select items to return (full or partial)
- Return reason required
- Choose: cash refund / credit to account / exchange
- Inventory restocked on return
- Separate refund invoice created
- Audit logged

### Quick Sale Mode

- For items not in system (e.g., service fee)
- Enter price directly — no product selected
- Non-inventory — no stock deduction
- Goes to audit log

---

## 10. Module 7 — Credit Sales & Accounts Receivable

### Customer Credit Account

- Each customer can have one credit account
- Fields: credit limit, current balance, status
- Status: ACTIVE, OVERDUE, SUSPENDED, SETTLED
- Auto-suspend when balance exceeds limit × threshold

### Credit Sale Flow

```
1. Cashier selects payment method: Credit
2. Rules Engine checks:
   a. Credit sales enabled globally?
   b. Customer has credit account?
   c. New balance ≤ credit limit?
   d. Account not suspended?
   e. Manager approval required? → show approval flow
3. On approval:
   - Invoice created with status: CREDIT
   - CreditAccount.currentBalance += invoice.total
   - Payment record with method: CREDIT, amount: total
   - Invoice links to CreditAccount
4. Print credit invoice (shows balance due)
```

### Collecting Credit Payments

- Select customer → view open balance
- Enter payment amount (partial or full)
- Choose payment method (cash / card)
- System applies to oldest invoice first (FIFO)
- Creates CreditPayment record
- Updates CreditAccount.currentBalance
- Print payment receipt
- Audit logged

### Customer Ledger

- Full transaction history per customer
- Each row: date, invoice/payment, amount, running balance
- Filterable by date range
- Export to PDF

### AR Reports

- Aging report: 0–30 / 30–60 / 60–90 / 90+ days
- Total outstanding per customer
- Collection efficiency rate
- Overdue customers list
- Collection forecast

---

## 11. Module 8 — Pricing Engine

### Pricing Mode Behavior

| Mode        | Suggested Price Calculation  | Editable?          |
| ----------- | ---------------------------- | ------------------ |
| `FIXED`     | Product.defaultSellingPrice  | Role-dependent     |
| `COST_PLUS` | `avgCost × (1 + margin/100)` | Role-dependent     |
| `HYBRID`    | Product.defaultSellingPrice  | Yes (within rules) |

### Price Calculation Pipeline

```
1. Get avgCost from Inventory
2. Get pricingMode from Settings
3. Calculate suggestedPrice
4. Apply minSellingPrice floor (if set)
5. Present to cashier
6. Cashier override (if permitted):
   a. Check role.canEditPrice
   b. Check against minSellingPrice
   c. Check against avgCost (below cost rules)
   d. Log override to AuditLog
7. Apply per-item discount (within role.maxDiscountPercent)
8. Apply cart-level discount (Manager only)
```

### Price Rounding Options

- No rounding
- Round to nearest 0.25
- Round to nearest 0.50
- Round to nearest 1.00

### Bulk Price Update

- By category + new margin %
- By product list + fixed amount increase/decrease
- By product list + % increase/decrease
- Preview before applying
- All changes logged to AuditLog

---

## 12. Module 9 — Rules Engine

### Architecture

The rules engine is a standalone package that can evaluate any structured condition against any context object. It runs both on the backend (authoritative) and optionally on the frontend (for real-time UX feedback).

### Rule Structure

```typescript
interface Rule {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  type: "SALE" | "INVENTORY" | "USER" | "CREDIT";
  condition: RuleCondition; // JSON
  action: RuleAction; // JSON
  priority: number; // higher = evaluated first
  isActive: boolean;
  isSystem: boolean; // system rules can't be deleted
}

interface RuleCondition {
  op:
    | "AND"
    | "OR"
    | "NOT"
    | "GT"
    | "GTE"
    | "LT"
    | "LTE"
    | "EQ"
    | "NEQ"
    | "IN"
    | "NOT_IN"
    | "IS_NULL"
    | "IS_NOT_NULL";
  field?: string; // dot-path: "item.sellingPrice"
  value?: any;
  conditions?: RuleCondition[]; // for AND / OR / NOT
}

interface RuleAction {
  type: "BLOCK" | "WARN" | "REQUIRE_APPROVAL" | "AUTO_ADJUST" | "NOTIFY";
  message: string;
  messageAr: string;
  field?: string; // for AUTO_ADJUST
  value?: any;
}
```

### System Rules (Locked, Always Active)

| Rule               | Type   | Condition                   | Action |
| ------------------ | ------ | --------------------------- | ------ |
| No negative stock  | SALE   | `item.stockAvailable <= 0`  | BLOCK  |
| No expired product | SALE   | `item.batchExpired == true` | BLOCK  |
| No negative price  | SALE   | `item.sellingPrice < 0`     | BLOCK  |
| Credit limit check | CREDIT | `newBalance > creditLimit`  | BLOCK  |

### Configurable Rules

| Rule                            | Default      | Configurable                      |
| ------------------------------- | ------------ | --------------------------------- |
| Prevent below-cost sale         | BLOCK        | Change to WARN / REQUIRE_APPROVAL |
| Max cashier discount            | BLOCK at 10% | Change %                          |
| Require Rx for flagged products | WARN         | Enable / Disable                  |
| Expiry alert threshold          | WARN 30 days | Change days                       |
| Credit account suspended        | BLOCK        | Enable / Disable                  |

### Rule Evaluation Flow

```
1. Load all active rules for the given type (sorted by priority DESC)
2. For each rule:
   a. Evaluate condition against context
   b. If condition is TRUE → collect violation
   c. If action is BLOCK → stop evaluation (highest priority wins)
3. Return: violations[], hasBlocker: boolean
4. Frontend shows violations in real-time
5. Backend validates again before committing (authoritative check)
```

---

## 13. Module 10 — Customers & Loyalty

### Customer Profile

- Name (EN / AR), phone, email, national ID
- Date of birth (for loyalty birthday discount)
- Address, notes
- Purchase history
- Loyalty points balance
- Credit account link

### Loyalty Points System

- Earn X points per SAR spent (configurable)
- Redeem points for discount (Y points = Z SAR)
- Points expire after N months (configurable)
- Minimum redemption threshold
- Blacklist products from earning points (e.g., tobacco)
- Points ledger per customer

### Customer-Specific Features

- Custom price list (override default for VIP)
- Birthday discount auto-apply
- Inactive customer alerts (no visit in X days)
- Bulk SMS / notification for offers (Phase 2)

### Customer Segmentation

- New (< 30 days)
- Regular (1–12 purchases)
- VIP (top 10% by revenue)
- At-risk (no visit in 60+ days)
- Overdue credit

---

## 14. Module 11 — Users, Roles & Permissions

### Default Roles

| Role                | Description                                    |
| ------------------- | ---------------------------------------------- |
| **Admin**           | Full access to everything                      |
| **Manager**         | All operations + approvals, no system settings |
| **Pharmacist**      | POS + inventory + purchases + reports          |
| **Cashier**         | POS only, limited price editing                |
| **Inventory Clerk** | Purchases + inventory only                     |
| **Viewer**          | Reports read-only                              |

### Permission Matrix

| Permission         | Admin | Manager  | Pharmacist | Cashier | Clerk | Viewer |
| ------------------ | ----- | -------- | ---------- | ------- | ----- | ------ |
| Access POS         | ✓     | ✓        | ✓          | ✓       | —     | —      |
| Edit price         | ✓     | ✓        | ✓          | —       | —     | —      |
| Sell below cost    | ✓     | ✓        | —          | —       | —     | —      |
| Approve below cost | ✓     | ✓        | —          | —       | —     | —      |
| Apply discount     | ✓     | ✓ (100%) | ✓ (30%)    | ✓ (10%) | —     | —      |
| Void invoice       | ✓     | ✓        | —          | —       | —     | —      |
| Refund             | ✓     | ✓        | ✓          | —       | —     | —      |
| Access inventory   | ✓     | ✓        | ✓          | —       | ✓     | ✓      |
| Create purchase    | ✓     | ✓        | ✓          | —       | ✓     | —      |
| Adjust stock       | ✓     | ✓        | ✓          | —       | ✓     | —      |
| Access reports     | ✓     | ✓        | ✓          | —       | —     | ✓      |
| View cost          | ✓     | ✓        | ✓          | —       | ✓     | —      |
| Credit approval    | ✓     | ✓        | —          | —       | —     | —      |
| Manage users       | ✓     | —        | —          | —       | —     | —      |
| System settings    | ✓     | —        | —          | —       | —     | —      |

### Manager Approval Flow

When a cashier attempts a blocked action:

```
1. Cashier sees: "Manager approval required"
2. Options:
   a. Manager enters PIN on same screen (quick approval)
   b. Manager logs in on same screen temporarily
   c. Action is rejected
3. Approval is logged to AuditLog with both user IDs
4. Proceeds with the restricted action
```

### PIN Code System

- Each user has an optional PIN (4–6 digits)
- Used for quick approvals without full login
- PIN approval logs the approving user

---

## 15. Module 12 — Reports & Analytics

### Report 1: Sales Report

- Filters: date range, cashier, payment method
- Summary: total invoices, total revenue, total tax, total discount
- Daily/weekly/monthly trend
- Top products by revenue and quantity
- Revenue by category
- Payment method breakdown

### Report 2: Profit Report

- Per invoice: revenue, cost, gross profit, margin %
- Per product: sold qty, revenue, cost, profit
- Per category: aggregated profit
- Best/worst margin products
- Below-cost sales (with user who made them)

### Report 3: Product Movement

- Units sold per product (date range)
- Units purchased per product
- Net movement (in vs out)
- Turnover rate
- Dead stock (zero movement in X days)
- Fast movers vs slow movers

### Report 4: Inventory Report

- Current stock levels
- Low stock list
- Near-expiry batches (within X days)
- Expired items
- Stock value by category
- Stock valuation history

### Report 5: Credit / AR Report

- Outstanding balance per customer
- Aging buckets: 0–30 / 30–60 / 60–90 / 90+ days
- Total AR balance
- Payments received this month
- Overdue accounts list
- Customer ledger export

### Report 6: Cashier / Shift Report

- Per cashier per shift: invoice count, cash, card, credit
- Cash variance (declared vs system)
- Average invoice value
- Discount given

### Report 7: Audit Log Report

- Filters: action type, user, date range, entity
- Price override events
- Below-cost sales
- Inventory adjustments
- Credit approvals
- User logins

### Report 8: Supplier / Purchase Report

- Purchase history by supplier
- Product cost trend (avg cost over time)
- Most purchased products

### Export Options

- All reports exportable to PDF and Excel
- PDF: print-ready, bilingual header
- Excel: raw data for further analysis

---

## 16. Module 13 — Audit Logs

### What Gets Logged

| Event            | Trigger                    | Data Captured                               |
| ---------------- | -------------------------- | ------------------------------------------- |
| Price override   | Cashier changes sell price | before price, after price, product, invoice |
| Below-cost sale  | Sale price < avg cost      | cost, sell price, diff, approver            |
| Discount applied | Any discount > 0           | amount, %, who approved                     |
| Invoice voided   | Invoice status changed     | invoice data, reason                        |
| Refund issued    | Return processed           | original invoice, items, reason             |
| Stock adjusted   | Manual inventory change    | before qty, after qty, reason, user         |
| Purchase posted  | New purchase created       | purchase details, WAC change                |
| Credit sale      | Credit payment method used | customer, amount, balance before/after      |
| Credit payment   | Customer pays debt         | amount, method, balance before/after        |
| Setting changed  | Any setting updated        | key, before, after                          |
| Rule triggered   | Rules engine fires         | rule name, context, action                  |
| User login       | Successful auth            | user, timestamp, method                     |
| Manager approval | Override approved          | action, approver, cashier                   |

### Audit Log Retention

- Configurable retention period (default: 5 years)
- Cannot be deleted by anyone except Admin
- Exportable to signed PDF for compliance

---

## 17. Module 14 — Multi-language & Theming

### i18n Implementation

```
renderer/src/i18n/
├── index.ts             # i18next initialization
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── pos.json
    │   ├── products.json
    │   ├── inventory.json
    │   ├── purchases.json
    │   ├── customers.json
    │   ├── reports.json
    │   ├── settings.json
    │   ├── wizard.json
    │   ├── rules.json
    │   └── errors.json
    └── ar/
        └── (same files, Arabic translations)
```

### Language Switching Behavior

- Language switcher in topbar
- Changing language:
  1. Updates i18next language
  2. Sets `document.dir = 'rtl' | 'ltr'`
  3. Switches Ant Design locale (arEG / enUS)
  4. Updates `ConfigProvider direction`
  5. Saves preference to UserPreference
  6. All `nameEn` / `nameAr` fields display accordingly

### Theming System

```typescript
// Three theme levels:
// 1. Light / Dark — base appearance
// 2. Preset — color scheme preset (Default, Ocean, Forest, Sunset, Rose, Corporate)
// 3. Custom — any primary color

const themeTokens = {
  light: {
    colorPrimary: "#4F46E5",
    colorBgContainer: "#FFFFFF",
    colorBgLayout: "#F1F5F9",
    colorBorder: "#E2E8F0",
    colorText: "#0F172A",
    borderRadius: 8,
    fontFamily: '"IBM Plex Sans", "IBM Plex Sans Arabic", sans-serif',
  },
  dark: {
    colorPrimary: "#818CF8",
    colorBgContainer: "#1E293B",
    colorBgLayout: "#0F172A",
    colorBorder: "#2D3F5C",
    colorText: "#F1F5F9",
  },
};
```

### Ant Design RTL Support

```tsx
<ConfigProvider
  theme={activeTheme}
  locale={isAr ? arEG : enUS}
  direction={isAr ? "rtl" : "ltr"}
>
  <App />
</ConfigProvider>
```

---

## 18. Module 15 — Hardware Integration

### Thermal Printer (ESC/POS)

**Supported Connections:** USB, Serial COM, Network TCP/IP

```
Printer IPC Flow:
  Renderer → ipcRenderer.invoke('printer:print', payload)
  → Electron Main → ESC/POS library → Physical Printer
```

**Invoice Template Sections:**

```
[HEADER]
  Pharmacy name (large, centered)
  Address, phone, tax number
  Invoice number, date, cashier
  Customer (if set)

[ITEMS TABLE]
  # | Product name | Qty | Unit Price | Discount | Total
  (Arabic names if AR mode)

[TOTALS]
  Subtotal
  Discount
  Tax (VAT)
  ─────────
  TOTAL (large)
  Payment method
  Change (if cash)

[FOOTER]
  Thank you message (EN + AR)
  Return policy
  QR code (optional — links to digital invoice)
```

**Arabic Printing Support:**

- Use `iconv-lite` to encode Arabic text in CP1256 or UTF-8 depending on printer
- Right-align Arabic text segments
- Test page validates encoding

### Barcode Scanner

- Treated as keyboard emulation (default)
- Custom hook `useBarcode` buffers keystrokes
- Detects barcode by Enter key or timeout (100ms)
- Min length: 3 characters
- Works globally when POS is active

### Cash Drawer

- Triggered via ESC/POS command after cash payment
- Command: `ESC p m t1 t2` (standard kick pulse)
- Configurable delay (ms) after payment confirmed
- Manual open button in Settings → Hardware

### Hardware Status Panel

Real-time status display in POS status bar:

- Printer: Connected / Disconnected / Paper Low
- Scanner: Ready / Not detected
- Drawer: Open / Closed

---

## 19. Module 16 — Backup & Data Integrity

### Auto Backup

- Scheduled backup (daily / weekly / on every shift close)
- Backup destination: local path, USB drive, network share
- Backup format: PostgreSQL dump (`.pgdump`) + app config
- Backup naming: `pharmapos_backup_YYYY-MM-DD_HHMMSS.pgdump`
- Keep last N backups (configurable)
- Backup success/failure notification in UI

### Manual Backup & Restore

- Backup now button in Settings
- Restore from backup file (with confirmation + data loss warning)
- Restore creates a pre-restore backup first

### Data Export

- Products catalog → Excel/CSV
- Inventory snapshot → Excel
- All reports → PDF / Excel
- Full database export → JSON (for migration)

### Data Import

- Import products from Excel template
- Validate before import (duplicates, missing fields)
- Preview imported rows before confirming

### Integrity Checks

- Background job: validate inventory totalValue = qty × avgCost
- Detect and alert on negative stock quantities
- Detect invoices with orphaned items
- Monthly reconciliation report

### Offline-First Guarantee

- All operations work with no internet
- Backend runs locally — no cloud dependency
- NestJS boots with app (subprocess managed by Electron)
- PostgreSQL is a local instance (auto-started)
- Network features (sync, cloud backup) are opt-in Phase 2

---

## 20. Frontend Architecture

### Folder Structure

```
renderer/src/
├── main.tsx
├── App.tsx                   # Root — router + providers
│
├── i18n/                     # Translations (see Module 14)
├── theme/
│   ├── tokens.ts             # Ant Design token definitions
│   ├── themes.ts             # Light / dark / presets
│   └── ThemeProvider.tsx
│
├── store/                    # Zustand stores
│   ├── auth.store.ts
│   ├── cart.store.ts         # POS cart state
│   ├── settings.store.ts
│   ├── ui.store.ts           # theme, lang, sidebar
│   └── shift.store.ts
│
├── api/                      # Axios API clients
│   ├── client.ts             # Axios instance + interceptors
│   ├── auth.api.ts
│   ├── products.api.ts
│   ├── inventory.api.ts
│   ├── purchases.api.ts
│   ├── sales.api.ts
│   ├── customers.api.ts
│   ├── reports.api.ts
│   ├── settings.api.ts
│   └── users.api.ts
│
├── hooks/
│   ├── useBarcode.ts         # Barcode scanner buffer
│   ├── usePrinter.ts         # IPC printer interface
│   ├── usePermissions.ts     # Role-based permission checks
│   ├── useSettings.ts        # Cached settings access
│   ├── useRules.ts           # Client-side rule evaluation
│   └── useShift.ts
│
├── pages/
│   ├── Setup/                # Wizard (first-run)
│   ├── Dashboard/
│   ├── POS/
│   │   ├── POSPage.tsx
│   │   ├── components/
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CartPanel.tsx
│   │   │   ├── CartItem.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   ├── HoldOrderModal.tsx
│   │   │   ├── CustomerModal.tsx
│   │   │   ├── ShiftModal.tsx
│   │   │   └── ReceiptPreview.tsx
│   ├── Products/
│   ├── Inventory/
│   ├── Purchases/
│   ├── Customers/
│   │   ├── CustomerList.tsx
│   │   ├── CustomerProfile.tsx
│   │   └── CreditLedger.tsx
│   ├── Reports/
│   │   ├── SalesReport.tsx
│   │   ├── ProfitReport.tsx
│   │   ├── InventoryReport.tsx
│   │   ├── ARReport.tsx
│   │   └── AuditLog.tsx
│   └── Settings/
│
└── components/
    ├── layout/
    │   ├── AppLayout.tsx
    │   ├── Sidebar.tsx
    │   └── Topbar.tsx
    ├── common/
    │   ├── ProtectedRoute.tsx
    │   ├── PermissionGuard.tsx
    │   ├── LanguageSwitcher.tsx
    │   ├── ThemeCustomizer.tsx
    │   ├── ConfirmModal.tsx
    │   ├── ApprovalModal.tsx  # Manager PIN approval
    │   └── MoneyInput.tsx
    └── printing/
        ├── InvoiceTemplate.tsx
        └── receiptBuilder.ts
```

---

## 21. Backend Architecture

### Module Structure

```
api/src/
├── main.ts
├── app.module.ts
│
├── prisma/
│   └── prisma.service.ts
│
├── modules/
│   ├── auth/
│   ├── setup/
│   ├── settings/
│   ├── products/
│   ├── categories/
│   ├── inventory/
│   ├── suppliers/
│   ├── purchases/
│   ├── sales/
│   │   └── pricing.service.ts   # Pricing engine
│   ├── customers/
│   ├── credit/
│   ├── reports/
│   ├── users/
│   ├── rules/
│   │   └── rules.engine.ts      # Core evaluator
│   ├── audit/
│   ├── shifts/
│   └── backup/
│
└── common/
    ├── guards/
    │   ├── jwt.guard.ts
    │   └── permissions.guard.ts
    ├── decorators/
    │   ├── permission.decorator.ts
    │   └── audit.decorator.ts
    ├── interceptors/
    │   └── audit.interceptor.ts
    ├── filters/
    │   └── exception.filter.ts
    ├── pipes/
    │   └── decimal-validation.pipe.ts
    └── utils/
        ├── wac.ts               # WAC calculation pure function
        ├── money.ts             # Decimal.js helpers
        └── invoice-number.ts   # Sequential number generator
```

---

## 22. API Design

### Authentication

```
POST   /auth/login              { username, password }
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
POST   /auth/verify-pin         { userId, pin }
```

### Setup

```
GET    /setup/status            → { complete: boolean }
POST   /setup/run               → runs full setup wizard
```

### Settings

```
GET    /settings                → all settings grouped
GET    /settings/:key
PATCH  /settings                → bulk update (non-locked only)
PATCH  /settings/:key
```

### Products

```
GET    /products                ?search=&barcode=&category=&active=
POST   /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id            (soft delete)
GET    /products/barcode/:code
POST   /products/bulk-import
PATCH  /products/bulk-price-update
GET    /products/:id/history    → price + cost history
```

### Inventory

```
GET    /inventory               ?lowStock=&nearExpiry=
GET    /inventory/:productId
PATCH  /inventory/:productId/adjust   → manual adjustment (audited)
POST   /inventory/stock-take    → apply physical count
GET    /inventory/low-stock
GET    /inventory/near-expiry   ?days=30
GET    /inventory/expired
```

### Purchases

```
GET    /purchases               ?supplierId=&from=&to=
POST   /purchases               → creates + updates WAC
GET    /purchases/:id
PATCH  /purchases/:id/void      → same-day void only
GET    /purchases/:id/print
```

### Sales

```
POST   /sales/quote             → preview totals + rule check (no commit)
POST   /sales/invoice           → finalize sale
GET    /sales/invoices          ?from=&to=&cashierId=&status=
GET    /sales/invoices/:id
POST   /sales/invoices/:id/void
POST   /sales/invoices/:id/refund
GET    /sales/invoices/:id/print
```

### Customers

```
GET    /customers               ?search=
POST   /customers
GET    /customers/:id
PATCH  /customers/:id
GET    /customers/:id/invoices
GET    /customers/:id/ledger
GET    /customers/:id/credit
PATCH  /customers/:id/credit    → update limit / status
POST   /customers/:id/credit/payment
```

### Reports

```
GET    /reports/sales           ?from=&to=&cashierId=&groupBy=
GET    /reports/profit          ?from=&to=&groupBy=
GET    /reports/inventory       ?type=current|low|expiry|movement
GET    /reports/product-movement ?productId=&from=&to=
GET    /reports/ar              ?customerId=&aging=
GET    /reports/shift           ?cashierId=&from=&to=
GET    /reports/audit           ?action=&userId=&from=&to=
```

### Rules

```
GET    /rules                   ?type=&active=
POST   /rules
PATCH  /rules/:id
DELETE /rules/:id               (non-system only)
POST   /rules/evaluate          → evaluate rules against context
```

### Users

```
GET    /users
POST   /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
PATCH  /users/:id/pin
GET    /users/:id/preferences
PATCH  /users/:id/preferences
GET    /roles
POST   /roles
PATCH  /roles/:id
```

---

## 23. Security Model

### Authentication

- JWT tokens (access + refresh)
- Access token: 8-hour expiry
- Refresh token: 30-day expiry, stored httpOnly
- Token stored in Electron secure storage (not localStorage)
- Auto-refresh on expiry

### Authorization

- Every API endpoint decorated with `@RequirePermission()`
- `PermissionsGuard` checks `user.role.permissions` on every request
- Client-side `usePermissions()` hook for UI gating (UX only — not security)
- Server is always authoritative

### Data Protection

- Passwords hashed with bcrypt (cost 12)
- PINs hashed with bcrypt (cost 10)
- Sensitive settings encrypted at rest
- DB credentials stored in Electron keychain

### Input Validation

- All DTOs validated with `class-validator`
- Decimal inputs sanitized before DB write
- SQL injection prevented by Prisma parameterized queries
- XSS prevention via sanitization on free-text fields

---

## 24. Development Roadmap

### Sprint 1 — Foundation (Weeks 1–2)

- [ ] Monorepo setup (Turborepo / pnpm workspaces)
- [ ] Electron + React + Vite scaffold
- [ ] NestJS scaffold with Prisma
- [ ] PostgreSQL local setup + migrations
- [ ] Auth module (login, JWT, guards)
- [ ] Settings module (CRUD)
- [ ] Shared types package
- [ ] i18n skeleton (EN + AR)

### Sprint 2 — Setup Wizard (Week 3)

- [ ] Setup wizard UI (6 steps)
- [ ] Setup API endpoint
- [ ] Default data seeding (roles, system rules, default categories)
- [ ] First-run detection and routing

### Sprint 3 — Products & Inventory (Weeks 4–5)

- [ ] Categories CRUD
- [ ] Products CRUD + bulk import
- [ ] Inventory module + WAC logic
- [ ] Batch management
- [ ] Product search by name / barcode
- [ ] Low stock + expiry alerts

### Sprint 4 — Purchases (Week 6)

- [ ] Suppliers CRUD
- [ ] Purchase invoice creation
- [ ] WAC calculation in transaction
- [ ] Batch creation on purchase
- [ ] Purchase void (same day)
- [ ] WAC preview UI

### Sprint 5 — POS Core (Weeks 7–8)

- [ ] POS product grid + categories
- [ ] Barcode scanner hook
- [ ] Cart management (add, edit, remove)
- [ ] Pricing engine (FIXED / COST_PLUS / HYBRID)
- [ ] Rules engine (client-side + server-side)
- [ ] Payment modal (cash / card)
- [ ] Invoice creation + inventory deduction (FEFO)
- [ ] Receipt printing (thermal)

### Sprint 6 — Credit Sales & Customers (Weeks 9–10)

- [ ] Customer CRUD
- [ ] Credit account management
- [ ] Credit payment method in POS
- [ ] Credit payment collection UI
- [ ] Customer ledger
- [ ] AR aging report

### Sprint 7 — Users, Roles, Audit (Week 11)

- [ ] Role management CRUD
- [ ] Permission matrix UI
- [ ] Manager approval flow + PIN
- [ ] Audit log service (auto-logging interceptor)
- [ ] Audit log viewer

### Sprint 8 — Reports (Week 12)

- [ ] Sales report
- [ ] Profit report
- [ ] Inventory reports
- [ ] AR report
- [ ] Audit log report
- [ ] PDF export
- [ ] Excel export

### Sprint 9 — Shifts & Hardware (Week 13)

- [ ] Shift open / close flow
- [ ] Cash declaration
- [ ] Shift summary report
- [ ] Hardware IPC (printer, drawer)
- [ ] Hardware status panel
- [ ] Test/configure printer UI

### Sprint 10 — Polish & Stability (Week 14)

- [ ] Backup system
- [ ] Data export / import
- [ ] Error handling (global + per-module)
- [ ] Loading states and optimistic UI
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Electron build (Windows installer NSIS)
- [ ] User documentation

---

## 25. Phase 2 Preview — ERP Expansion

The following modules are architected in Phase 1 but implemented in Phase 2:

### Multi-Branch Support

- Branch table (already referenced in schema as future)
- Transfer between branches
- Consolidated reporting across branches
- Central product catalog, branch-level inventory

### Advanced Procurement

- Purchase orders (vs direct purchase invoices)
- PO approval workflow
- Supplier pricing contracts
- Auto reorder point system

### Accounts Payable

- Track what we owe suppliers
- Partial payments to suppliers
- Supplier aging report

### HR & Payroll Basics

- Employee profiles
- Attendance tracking
- Commission on sales
- Basic payroll calculations

### Cloud Sync & Multi-Device

- Central cloud PostgreSQL
- Offline queue with sync
- Conflict resolution (last-write-wins per entity)
- Mobile app for owner dashboard

### Advanced Analytics

- Sales forecasting
- Demand planning
- ABC analysis (product classification)
- Customer lifetime value

### Integrations

- ZATCA (Saudi e-invoicing) compliance
- VAT filing reports
- Bank statement import for reconciliation
- WhatsApp notifications for credit reminders

---

## Appendix A — Key Business Rules Summary

| Rule                                       | Enforcement                                        |
| ------------------------------------------ | -------------------------------------------------- |
| WAC method is immutable                    | `isLocked: true` on setting, backend rejects PATCH |
| Selling price never affects `avgCost`      | Only purchases + adjustments write to `avgCost`    |
| All financial operations are atomic        | Prisma `$transaction` on every write               |
| Below-cost sales are always logged         | Audit interceptor regardless of whether allowed    |
| Inventory cannot go negative (default)     | System rule in rules engine                        |
| Expired products cannot be sold (default)  | System rule in rules engine                        |
| All price overrides are logged             | AuditLog.PRICE_OVERRIDE on every override          |
| Manager approval is logged with both users | AuditLog captures `approverId` + `requesterId`     |

---

## Appendix B — Currency & Decimal Handling

All monetary values use `Decimal.js` library to avoid IEEE 754 floating-point issues.

```typescript
// All money calculations:
import Decimal from "decimal.js";
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// DB storage: Decimal(12, 4) for prices, Decimal(14, 4) for totals
// Display: toFixed(2) for most, toFixed(4) for avgCost
// Never use JavaScript's native + - * / for money
```

---

## Appendix C — Invoice Numbering

```typescript
// Format: {PREFIX}-{YEAR}-{SEQUENCE}
// Example: INV-2026-000001
// Sequence is per-year, reset to 000001 each fiscal year
// Generated with DB advisory lock to prevent duplicates
// Offline: uses local sequence, sync resolves on reconnect (Phase 2)
```

---

_PharmaPOS System Plan v1.0_  
_Generated: March 2026_  
_Estimated Phase 1 Duration: 14 Sprints (~14 Weeks)_  
_Estimated LOC: ~35,000 (frontend) + ~18,000 (backend)_
