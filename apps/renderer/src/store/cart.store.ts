import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import Decimal from 'decimal.js';

export interface CartItem {
  productId: string;
  barcode: string | null;
  nameEn: string;
  nameAr: string;
  quantity: string;
  cost: string;
  suggestedPrice: string;
  sellingPrice: string;
  discountPct: string;
  lineTotal: string;
  profit: string;
  isBelowCost: boolean;
  isOverride: boolean;
  batchId: string | null;
  stockAvailable: string;
  itemType: 'product' | 'service';
  serviceId: string | null;
  performerId: string | null;
  performerName: string | null;
  patientName: string | null;
  patientPhone: string | null;
  serviceNotes: string | null;
  serviceDuration: number | null;
  isPriceEditable: boolean;
}

export interface OrderTab {
  id: string;
  label: string;
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  discountPct: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  notes: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  tableNumber: string | null;
  deliveryAddress: string | null;
  amountGiven: string;
  paymentMethod: string;
  createdAt: string;
}

interface HeldOrder {
  id: string;
  label: string;
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  discountPct: string;
  notes: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  tableNumber: string | null;
  createdAt: string;
}

function createTab(number: number): OrderTab {
  return {
    id: `tab-${Date.now()}-${number}`,
    label: `Order #${number}`,
    items: [],
    customerId: null,
    customerName: null,
    discountPct: '0',
    discountType: 'PERCENTAGE',
    notes: '',
    orderType: 'DINE_IN',
    tableNumber: null,
    deliveryAddress: null,
    amountGiven: '0',
    paymentMethod: 'CASH',
    createdAt: new Date().toISOString(),
  };
}

interface CartState {
  tabs: OrderTab[];
  activeTabId: string;
  nextTabNumber: number;
  heldOrders: HeldOrder[];

  // Tab management
  addTab: () => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  getActiveTab: () => OrderTab;

  // Item operations (on active tab)
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, updates: Partial<CartItem>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: string) => void;

  // Order metadata (on active tab)
  setCustomer: (id: string | null, name: string | null) => void;
  setDiscountPct: (pct: string) => void;
  setDiscountType: (type: 'PERCENTAGE' | 'FIXED') => void;
  setNotes: (notes: string) => void;
  setOrderType: (type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY') => void;
  setTableNumber: (table: string | null) => void;
  setDeliveryAddress: (address: string | null) => void;
  setAmountGiven: (amount: string) => void;
  setPaymentMethod: (method: string) => void;
  clearCart: () => void;

  // Hold / Resume
  holdOrder: (label: string) => void;
  resumeOrder: (id: string) => void;
  removeHeldOrder: (id: string) => void;

  // Merge orders
  mergeTabs: (tabIds: string[]) => void;

  // Calculations (on active tab)
  getSubtotal: () => string;
  getTaxAmount: (taxPercent: number) => string;
  getTotal: (taxPercent: number) => string;
  getTabTotal: (tabId: string, taxPercent: number) => string;
}

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

const initialTab = createTab(1);

export const useCartStore = create<CartState>()(
  immer((set, get) => ({
    tabs: [initialTab],
    activeTabId: initialTab.id,
    nextTabNumber: 2,
    heldOrders: [],

    // -- Tab Management --

    addTab: () =>
      set((state) => {
        const tab = createTab(state.nextTabNumber);
        state.tabs.push(tab);
        state.activeTabId = tab.id;
        state.nextTabNumber += 1;
      }),

    removeTab: (tabId) =>
      set((state) => {
        if (state.tabs.length <= 1) return;
        const idx = state.tabs.findIndex((t) => t.id === tabId);
        if (idx === -1) return;
        state.tabs.splice(idx, 1);
        if (state.activeTabId === tabId) {
          state.activeTabId = state.tabs[Math.min(idx, state.tabs.length - 1)].id;
        }
      }),

    setActiveTab: (tabId) =>
      set((state) => {
        if (state.tabs.some((t) => t.id === tabId)) {
          state.activeTabId = tabId;
        }
      }),

    getActiveTab: () => {
      const { tabs, activeTabId } = get();
      return tabs.find((t) => t.id === activeTabId) || tabs[0];
    },

    // -- Item Operations --

    addItem: (item) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        const existing = tab.items.find((i) => i.productId === item.productId && i.itemType === item.itemType);
        if (existing) {
          const newQty = new Decimal(existing.quantity).plus(new Decimal(item.quantity));
          existing.quantity = newQty.toFixed(4);
          const lineTotal = new Decimal(existing.sellingPrice).times(newQty);
          existing.lineTotal = lineTotal.toFixed(4);
        } else {
          tab.items.push(item);
        }
      }),

    updateItem: (productId, updates) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        const item = tab.items.find((i) => i.productId === productId);
        if (item) Object.assign(item, updates);
      }),

    removeItem: (productId) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.items = tab.items.filter((i) => i.productId !== productId);
      }),

    updateQuantity: (productId, quantity) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        const item = tab.items.find((i) => i.productId === productId);
        if (item) {
          item.quantity = quantity;
          const qty = new Decimal(quantity);
          const price = new Decimal(item.sellingPrice);
          const discountPct = new Decimal(item.discountPct || '0');
          const lineSubtotal = price.times(qty);
          const lineDiscount = lineSubtotal.times(discountPct).dividedBy(100);
          item.lineTotal = lineSubtotal.minus(lineDiscount).toFixed(4);
          item.profit = new Decimal(item.lineTotal).minus(new Decimal(item.cost).times(qty)).toFixed(4);
          item.isBelowCost = price.lessThan(new Decimal(item.cost));
        }
      }),

    // -- Order Metadata --

    setCustomer: (id, name) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.customerId = id;
        tab.customerName = name;
      }),

    setDiscountPct: (pct) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.discountPct = pct;
      }),

    setDiscountType: (type) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.discountType = type;
      }),

    setNotes: (notes) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.notes = notes;
      }),

    setOrderType: (type) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.orderType = type;
        if (type !== 'DINE_IN') tab.tableNumber = null;
        if (type !== 'DELIVERY') tab.deliveryAddress = null;
      }),

    setTableNumber: (table) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.tableNumber = table;
      }),

    setDeliveryAddress: (address) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.deliveryAddress = address;
      }),

    setAmountGiven: (amount) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.amountGiven = amount;
      }),

    setPaymentMethod: (method) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.paymentMethod = method;
      }),

    clearCart: () =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.items = [];
        tab.customerId = null;
        tab.customerName = null;
        tab.discountPct = '0';
        tab.notes = '';
        tab.amountGiven = '0';
        tab.paymentMethod = 'CASH';
        tab.tableNumber = null;
        tab.deliveryAddress = null;
      }),

    // -- Hold / Resume --

    holdOrder: (label) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab || tab.items.length === 0) return;
        state.heldOrders.push({
          id: Date.now().toString(),
          label,
          items: [...tab.items],
          customerId: tab.customerId,
          customerName: tab.customerName,
          discountPct: tab.discountPct,
          notes: tab.notes,
          orderType: tab.orderType,
          tableNumber: tab.tableNumber,
          createdAt: new Date().toISOString(),
        });
        tab.items = [];
        tab.customerId = null;
        tab.customerName = null;
        tab.discountPct = '0';
        tab.notes = '';
        tab.amountGiven = '0';
        tab.paymentMethod = 'CASH';
      }),

    resumeOrder: (id) =>
      set((state) => {
        const order = state.heldOrders.find((o) => o.id === id);
        if (!order) return;
        const tab = state.tabs.find((t) => t.id === state.activeTabId);
        if (!tab) return;
        tab.items = order.items;
        tab.customerId = order.customerId;
        tab.customerName = order.customerName;
        tab.discountPct = order.discountPct;
        tab.notes = order.notes;
        tab.orderType = order.orderType;
        tab.tableNumber = order.tableNumber;
        state.heldOrders = state.heldOrders.filter((o) => o.id !== id);
      }),

    removeHeldOrder: (id) =>
      set((state) => {
        state.heldOrders = state.heldOrders.filter((o) => o.id !== id);
      }),

    // -- Merge Orders --

    mergeTabs: (tabIds) =>
      set((state) => {
        const tabsToMerge = state.tabs.filter((t) => tabIds.includes(t.id));
        if (tabsToMerge.length < 2) return;

        const mergedItems: CartItem[] = [];
        for (const tab of tabsToMerge) {
          for (const item of tab.items) {
            const existing = mergedItems.find((i) => i.productId === item.productId && i.itemType === item.itemType);
            if (existing) {
              const newQty = new Decimal(existing.quantity).plus(new Decimal(item.quantity));
              existing.quantity = newQty.toFixed(4);
              const lineTotal = new Decimal(existing.sellingPrice).times(newQty);
              existing.lineTotal = lineTotal.toFixed(4);
              existing.profit = new Decimal(existing.lineTotal)
                .minus(new Decimal(existing.cost).times(newQty))
                .toFixed(4);
            } else {
              mergedItems.push({ ...item });
            }
          }
        }

        const primary = tabsToMerge[0];
        const newTab = createTab(state.nextTabNumber);
        newTab.items = mergedItems;
        newTab.customerId = primary.customerId;
        newTab.customerName = primary.customerName;
        newTab.notes = tabsToMerge.map((t) => t.notes).filter(Boolean).join('; ');
        newTab.orderType = primary.orderType;
        newTab.tableNumber = primary.tableNumber;

        state.tabs = state.tabs.filter((t) => !tabIds.includes(t.id));
        state.tabs.push(newTab);
        state.activeTabId = newTab.id;
        state.nextTabNumber += 1;
      }),

    // -- Calculations --

    getSubtotal: () => {
      const tab = get().getActiveTab();
      return tab.items.reduce(
        (sum, item) => new Decimal(sum).plus(new Decimal(item.lineTotal)).toFixed(4),
        '0',
      );
    },

    getTaxAmount: (taxPercent: number) => {
      const tab = get().getActiveTab();
      const subtotal = new Decimal(get().getSubtotal());
      const discountVal = new Decimal(tab.discountPct || '0');
      const discountAmount = tab.discountType === 'FIXED'
        ? Decimal.min(discountVal, subtotal)
        : subtotal.times(discountVal).dividedBy(100);
      const afterDiscount = subtotal.minus(discountAmount);
      return afterDiscount.times(new Decimal(taxPercent)).dividedBy(100).toFixed(4);
    },

    getTotal: (taxPercent: number) => {
      const tab = get().getActiveTab();
      const subtotal = new Decimal(get().getSubtotal());
      const discountVal = new Decimal(tab.discountPct || '0');
      const discountAmount = tab.discountType === 'FIXED'
        ? Decimal.min(discountVal, subtotal)
        : subtotal.times(discountVal).dividedBy(100);
      const afterDiscount = subtotal.minus(discountAmount);
      const tax = afterDiscount.times(new Decimal(taxPercent)).dividedBy(100);
      return afterDiscount.plus(tax).toFixed(4);
    },

    getTabTotal: (tabId: string, taxPercent: number) => {
      const tab = get().tabs.find((t) => t.id === tabId);
      if (!tab) return '0';
      const subtotal = tab.items.reduce(
        (sum, item) => new Decimal(sum).plus(new Decimal(item.lineTotal)).toFixed(4),
        '0',
      );
      const discountVal = new Decimal(tab.discountPct || '0');
      const discountAmount = tab.discountType === 'FIXED'
        ? Decimal.min(discountVal, new Decimal(subtotal))
        : new Decimal(subtotal).times(discountVal).dividedBy(100);
      const afterDiscount = new Decimal(subtotal).minus(discountAmount);
      const tax = afterDiscount.times(new Decimal(taxPercent)).dividedBy(100);
      return afterDiscount.plus(tax).toFixed(4);
    },
  })),
);
