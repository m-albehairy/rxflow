# CLAUDE.md — PharmaPOS Desktop System

> Read this file completely before writing a single line of code. No exceptions.

---

## Tech Stack (LOCKED)

```
Desktop:          Electron 30+
Frontend:         React 18 + Vite 5
UI:               Ant Design v5 (Design Tokens)
State:            Zustand 4 + Immer
Backend:          NestJS 10 + TypeScript 5 strict
ORM:              TypeORM 0.3 + @nestjs/typeorm
Database:         PostgreSQL 16 (local)
i18n:             react-i18next 14
Money Math:       Decimal.js — NEVER native JS floats
Validation:       Zod (frontend) · class-validator + class-transformer (backend)
HTTP:             Axios + interceptors
Printing:         escpos + escpos-usb + iconv-lite
Packaging:        Electron Builder (NSIS / DMG / AppImage)
Monorepo:         pnpm workspaces + Turborepo
Package Manager:  pnpm — NEVER npm or yarn
Testing:          Vitest (renderer) · Jest + Supertest (api)
Path Aliases:     @/ -> src/ (renderer)   @api/ -> src/ (api)
```

---

## Monorepo Folder Structure

```
pharmapos/
├── apps/
│   ├── desktop/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── preload.ts
│   │   │   └── hardware/
│   │   │       ├── printer.ipc.ts
│   │   │       ├── drawer.ipc.ts
│   │   │       └── scanner.ipc.ts
│   │   └── package.json
│   │
│   ├── renderer/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── i18n/
│   │   │   ├── theme/
│   │   │   ├── store/
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   └── vite.config.ts
│   │
│   └── api/
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── config/
│       │   │   ├── database.config.ts
│       │   │   ├── jwt.config.ts
│       │   │   └── index.ts
│       │   ├── database/
│       │   │   ├── data-source.ts
│       │   │   ├── naming.strategy.ts
│       │   │   ├── base.entity.ts
│       │   │   ├── base.repository.ts
│       │   │   ├── database.module.ts
│       │   │   ├── entities/
│       │   │   ├── repositories/
│       │   │   ├── migrations/
│       │   │   └── seeds/
│       │   ├── common/
│       │   │   ├── constants/
│       │   │   ├── decorators/
│       │   │   ├── dto/
│       │   │   ├── enums/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── i18n/
│       │   │   ├── interceptors/
│       │   │   ├── interfaces/
│       │   │   ├── pipes/
│       │   │   └── utils/
│       │   ├── shared/
│       │   │   ├── audit/
│       │   │   ├── pricing/
│       │   │   ├── rules/
│       │   │   ├── wac/
│       │   │   ├── sequence/
│       │   │   ├── print/
│       │   │   ├── settings/
│       │   │   ├── permissions/
│       │   │   ├── shift/
│       │   │   └── shared.module.ts
│       │   └── modules/
│       │       ├── auth/
│       │       ├── setup/
│       │       ├── settings/
│       │       ├── products/
│       │       ├── categories/
│       │       ├── inventory/
│       │       ├── suppliers/
│       │       ├── purchases/
│       │       ├── sales/
│       │       ├── customers/
│       │       ├── credit/
│       │       ├── reports/
│       │       ├── users/
│       │       ├── roles/
│       │       ├── rules/
│       │       ├── audit/
│       │       └── shifts/
│       └── package.json
│
├── packages/
│   ├── shared/               # Types, DTOs, enums, constants
│   ├── rules-engine/         # Portable rules evaluator (renderer + api)
│   ├── printer/              # ESC/POS builder + Arabic encoding
│   └── decimal-utils/        # Decimal.js helpers
│
├── scripts/
│   ├── setup.ts
│   ├── seed.ts
│   └── build.ts
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Backend — Module Structure

```
api/src/modules/<module>/
├── controllers/
│   └── <module>.controller.ts      # Route handlers only — zero business logic
├── services/
│   └── <module>.service.ts         # All business logic — owns transactions
├── repositories/
│   └── <module>.repository.ts      # Data access only — zero business logic
├── entities/
│   └── <entity>.entity.ts
├── dto/
│   ├── create-<entity>.dto.ts
│   ├── update-<entity>.dto.ts      # Must include version: number
│   ├── filter-<entity>.dto.ts
│   └── response-<entity>.dto.ts
├── interfaces/
│   └── <module>.interfaces.ts
└── <module>.module.ts
```

---

## Frontend — Renderer Structure

```
renderer/src/
├── i18n/
│   ├── index.ts
│   └── locales/
│       ├── en/
│       │   ├── common.json
│       │   ├── pos.json
│       │   ├── products.json
│       │   ├── inventory.json
│       │   ├── purchases.json
│       │   ├── customers.json
│       │   ├── reports.json
│       │   ├── settings.json
│       │   ├── wizard.json
│       │   ├── rules.json
│       │   └── errors.json
│       └── ar/                     # Same file names as en/
│
├── theme/
│   ├── tokens.ts
│   ├── themes.ts
│   └── ThemeProvider.tsx
│
├── store/
│   ├── auth.store.ts
│   ├── cart.store.ts
│   ├── settings.store.ts
│   ├── ui.store.ts
│   └── shift.store.ts
│
├── api/
│   ├── client.ts
│   ├── auth.api.ts
│   ├── products.api.ts
│   ├── inventory.api.ts
│   ├── purchases.api.ts
│   ├── sales.api.ts
│   ├── customers.api.ts
│   ├── credit.api.ts
│   ├── reports.api.ts
│   ├── settings.api.ts
│   └── users.api.ts
│
├── hooks/
│   ├── useBarcode.ts
│   ├── usePrinter.ts
│   ├── usePermissions.ts
│   ├── useSettings.ts
│   ├── useRules.ts
│   └── useShift.ts
│
├── pages/
│   ├── Setup/
│   │   ├── SetupWizard.tsx
│   │   └── steps/
│   ├── Dashboard/
│   ├── POS/
│   │   ├── POSPage.tsx
│   │   └── components/
│   │       ├── ProductGrid.tsx
│   │       ├── CartPanel.tsx
│   │       ├── CartItem.tsx
│   │       ├── PaymentModal.tsx
│   │       ├── HoldOrderModal.tsx
│   │       ├── CustomerModal.tsx
│   │       ├── ShiftModal.tsx
│   │       └── ReceiptPreview.tsx
│   ├── Products/
│   ├── Inventory/
│   ├── Purchases/
│   ├── Customers/
│   │   ├── CustomerList.tsx
│   │   ├── CustomerProfile.tsx
│   │   └── CreditLedger.tsx
│   ├── Reports/
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
    │   ├── ApprovalModal.tsx
    │   ├── MoneyInput.tsx
    │   └── ConfirmModal.tsx
    └── printing/
        ├── InvoiceTemplate.tsx
        └── receiptBuilder.ts
```

---

## Shared Packages Structure

```
packages/shared/src/
├── enums/
│   ├── pos.enums.ts          # InvoiceStatus · PaymentMethod · HoldStatus
│   ├── inventory.enums.ts    # ProductUnit · BatchStatus · AdjustmentReason
│   ├── purchase.enums.ts     # PurchaseStatus
│   ├── sales.enums.ts        # DiscountType · RefundReason
│   ├── credit.enums.ts       # CreditStatus · CreditPaymentMethod
│   ├── rules.enums.ts        # RuleType · RuleActionType
│   ├── audit.enums.ts        # AuditAction
│   ├── user.enums.ts         # UserStatus
│   └── system.enums.ts       # PricingMode · CostingMethod · Language · Theme
│
└── constants/
    ├── business.constants.ts    # VAT_SA · VAT_EG · MAX_CASHIER_DISC · WAC_DECIMAL_PLACES
    ├── pagination.constants.ts  # DEFAULT_PAGE · DEFAULT_LIMIT · MAX_LIMIT
    ├── invoice.constants.ts     # INVOICE_SEQ_PAD · INVOICE_PREFIX_DEFAULT
    ├── hardware.constants.ts    # BARCODE_TIMEOUT_MS · BARCODE_MIN_LENGTH · PAPER widths
    ├── stock.constants.ts       # LOW_STOCK_DEFAULT · EXPIRY_ALERT_DAYS · MAX_HELD_ORDERS
    └── cache.constants.ts       # TTL_SETTINGS · TTL_PRODUCTS · TTL_RULES · TTL_PERMISSIONS
```

---

## Database Conventions

| Rule                    | Value                                                      |
| ----------------------- | ---------------------------------------------------------- |
| Table names             | `snake_case` plural — auto via NamingStrategy              |
| Column names            | `camelCase` — auto via NamingStrategy                      |
| PK business entities    | `UUID v4` — `uuid_generate_v4()`                           |
| PK lookup/system tables | `SERIAL INTEGER`                                           |
| Money columns           | `NUMERIC(12,4)` prices · `NUMERIC(14,4)` totals            |
| Percentage columns      | `NUMERIC(5,2)`                                             |
| `synchronize`           | Always `false` — migrations only, no exceptions            |
| Soft delete             | `@DeleteDateColumn()` on every entity                      |
| Optimistic lock         | `@VersionColumn()` on every entity                         |
| Bilingual fields        | `nameEn` + `nameAr` — never JSONB                          |
| Enum columns            | `type: 'enum'` with TypeScript enum — never bare `varchar` |
| Migrations naming       | `YYYYMMDDHHMMSS-Description.ts`                            |
| Migration `down()`      | Always required — every migration must be reversible       |

### BaseEntity Fields (every entity extends this)

```
id          UUID v4
createdAt   timestamptz
updatedAt   timestamptz
deletedAt   timestamptz nullable
version     integer default 0
createdBy   UUID nullable
updatedBy   UUID nullable
```

---

## API Conventions

```
Base URL:       http://localhost:3001/api/v1
Resources:      plural kebab-case  (/products · /invoice-items · /credit-accounts)
Guards:         JwtAuthGuard -> PermissionsGuard
Permissions:    'module:action'  (pos:sell · inventory:adjust · reports:view · invoices:void)
```

### Controller Route Order (NestJS matches top-down — order matters)

```
GET    /summary       Aggregate stats — always first to avoid /:id conflict
GET    /dropdown      Lightweight list for selects
GET    /              Paginated list
GET    /:id           Single record
POST   /              Create
PUT    /:id           Full update — version check required
PATCH  /:id           Partial update — version check required
DELETE /:id           Soft delete
POST   /:id/void      State transitions
POST   /:id/refund
POST   /:id/print
```

### Response Envelope (auto-wrapped by ResponseInterceptor — never construct manually)

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 },
  "timestamp": "2026-03-30T10:30:00Z",
  "lang": "ar"
}
```

### Pagination

```
Default page: 1    Default limit: 20    Hard max: 100
Every list endpoint must be paginated — never return unbounded arrays
```

---

## Shared Services (SharedModule — @Global)

| Service              | Responsibility                                         |
| -------------------- | ------------------------------------------------------ |
| `AuditService`       | Log every financial action within the same transaction |
| `PricingService`     | Suggested price per mode (FIXED / COST_PLUS / HYBRID)  |
| `RulesEngine`        | Evaluate rule conditions against any context           |
| `WACService`         | Weighted average cost — Decimal.js + QueryRunner       |
| `SequenceService`    | Gap-free document numbers with PG advisory lock        |
| `PrintService`       | ESC/POS buffer + Arabic iconv-lite encoding            |
| `SettingsService`    | Cached type-safe settings access                       |
| `PermissionsService` | Programmatic permission checks                         |
| `ShiftService`       | Shift open / close / validation                        |

---

## Key Rules Summary

| Topic           | Rule                                                                          |
| --------------- | ----------------------------------------------------------------------------- |
| Layering        | Controller → Service → Repository — never skip                                |
| Transactions    | Services own `QueryRunner` — never start in repository or controller          |
| Money           | Always `Decimal.js` — TypeORM returns `NUMERIC` as `string`, wrap before math |
| WAC             | Locked after setup — `avgCost` never modified by sales, only purchases        |
| Enums           | All in `packages/shared/src/enums/` — never hardcode strings                  |
| Validation      | `@IsEnum()` always — never `@IsIn([...])`                                     |
| Soft delete     | Always — never hard delete, always filter `deletedAt: IsNull()`               |
| Optimistic lock | `version: number` in every update DTO — check before every save               |
| Bilingual       | `nameEn` + `nameAr` always — search covers both columns                       |
| Errors          | `msg(ErrorMessages.KEY)` — never throw bare English strings                   |
| Language        | From request context — never pass `lang` as parameter                         |
| Permissions     | Server is authoritative — frontend guards are UX only                         |
| Audit logs      | Immutable — never UPDATE or DELETE                                            |
| Inventory       | FEFO deduction — first expiry first out                                       |
| Hardware IPC    | Never call hardware libs from renderer — Electron IPC only                    |
| JWT             | Electron `safeStorage` — never `localStorage`                                 |
| Eager loading   | Never `eager: true` — always load relations explicitly                        |

---

## IPC Channel Names

```
printer:print-invoice
printer:open-drawer
printer:test
scanner:set-mode
hardware:get-status
```

---

## Commands

```bash
# Development
pnpm install
pnpm dev
pnpm dev:renderer
pnpm dev:api
pnpm dev:electron

# Database (TypeORM CLI)
pnpm typeorm migration:generate src/database/migrations/MigrationName
pnpm typeorm migration:run
pnpm typeorm migration:revert
pnpm typeorm migration:show
pnpm seed

# Quality — run before every push
pnpm format
pnpm lint
pnpm type-check

# Testing
pnpm test
pnpm test:api
pnpm test:renderer
pnpm test:e2e

# Build
pnpm build
pnpm build:win
pnpm build:mac
pnpm build:linux
```

---

## Environment Variables

```bash
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmapos_dev
DB_USER=pharmapos
DB_PASS=secret

JWT_ACCESS_SECRET=min-32-chars
JWT_REFRESH_SECRET=min-32-chars
JWT_ACCESS_EXPIRY=8h
JWT_REFRESH_EXPIRY=30d

ELECTRON_IS_DEV=true
RENDERER_PORT=5173

PRINTER_TYPE=USB          # USB | SERIAL | NETWORK | NONE
PRINTER_PORT=USB001
PAPER_WIDTH=80            # 80 | 58

BACKUP_PATH=./backups
BACKUP_KEEP_LAST=30
```

---

## Git & Code Style

```
Formatter:   Prettier — singleQuote, trailingComma: all, printWidth: 100, tabWidth: 2, semi: true
Linter:      ESLint + @typescript-eslint/recommended + eslint-config-prettier
Pre-commit:  Husky — pnpm format + pnpm lint (blocks on failure)
Commits:     feat: / fix: / chore: / refactor: / docs: / test: / perf:
Branches:    feature/<module>/<description>   fix/<description>
```

---