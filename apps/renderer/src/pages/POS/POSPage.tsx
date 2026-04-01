import React, { useState, useCallback, useEffect } from 'react';
import { Row, Col, App, Button, Space, Tag, Tooltip } from 'antd';
import {
  DollarOutlined,
  RollbackOutlined,
  SwapOutlined,
  MergeCellsOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ProductGrid } from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { PaymentModal } from './components/PaymentModal';
import { HoldOrderModal } from './components/HoldOrderModal';
import { ShiftModal } from './components/ShiftModal';
import { OrderTabs } from './components/OrderTabs';
import { HardwareStatusBar } from './components/HardwareStatusBar';
import { StatusBadge } from './components/StatusBadge';
import { ExchangeModal } from './components/ExchangeModal';
import { MergeOrdersModal } from './components/MergeOrdersModal';
import { CloseSessionModal } from './components/CloseSessionModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { QuickKeys } from './components/QuickKeys';
import { useCartStore } from '@/store/cart.store';
import { useBarcode } from '@/hooks/useBarcode';
import { useShift } from '@/hooks/useShift';
import { useSettings } from '@/hooks/useSettings';
import { productsApi } from '@/api/products.api';

export function POSPage() {
  const { t } = useTranslation('pos');
  const { message } = App.useApp();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [holdOpen, setHoldOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [closeSessionOpen, setCloseSessionOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [pendingService, setPendingService] = useState<any>(null);

  const addItem = useCartStore((s) => s.addItem);
  const tabs = useCartStore((s) => s.tabs);
  const { currentShift, isShiftOpen, loadCurrent } = useShift();
  const { getSetting } = useSettings();

  useEffect(() => {
    loadCurrent();
  }, [loadCurrent]);

  const handleBarcodeScan = useCallback(
    async (barcode: string) => {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(barcode);
        const res: any = isUUID
          ? await productsApi.getById(barcode)
          : await productsApi.getByBarcode(barcode);
        const product = res.data || res;
        addItem({
          itemType: 'product',
          productId: product.id,
          barcode: product.barcode,
          nameEn: product.nameEn,
          nameAr: product.nameAr,
          quantity: '1',
          cost: product.inventory?.avgCost || '0',
          suggestedPrice: product.defaultSellingPrice,
          sellingPrice: product.defaultSellingPrice,
          discountPct: '0',
          lineTotal: product.defaultSellingPrice,
          profit: '0',
          isBelowCost: false,
          isOverride: false,
          batchId: null,
          stockAvailable: product.inventory?.quantity || '0',
          serviceId: null,
          performerId: null,
          performerName: null,
          patientName: null,
          patientPhone: null,
          serviceNotes: null,
          serviceDuration: null,
          isPriceEditable: false,
        });
      } catch {
        message.error('Product not found');
      }
    },
    [addItem, message],
  );

  useBarcode({ onScan: handleBarcodeScan, enabled: true });

  const handleAddService = useCallback((service: any) => {
    setPendingService(service);
    setServiceModalOpen(true);
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 0',
        marginBottom: 4,
      }}>
        <Space size="small">
          <Button type="primary" style={{ boxShadow: 'none' }} icon={<DollarOutlined />}>
            {t('cashIn')}
          </Button>
          <Button type="primary" danger style={{ boxShadow: 'none' }} icon={<DollarOutlined />}>
            {t('cashOut')}
          </Button>
          <Button icon={<RollbackOutlined />}>{t('refund')}</Button>
          <Button icon={<SwapOutlined />} onClick={() => setExchangeOpen(true)}>
            {t('exchange')}
          </Button>
        </Space>

        <Space size="small">
          <StatusBadge />
          {isShiftOpen && (
            <Button
              icon={<PoweroffOutlined />}
              onClick={() => setCloseSessionOpen(true)}
            >
              {t('closeSession')}
            </Button>
          )}
          <Button
            type="primary"
            style={{ boxShadow: 'none' }}
            icon={<MergeCellsOutlined />}
            disabled={tabs.length < 2}
            onClick={() => setMergeOpen(true)}
          >
            {t('mergeOrders')}
          </Button>
        </Space>
      </div>

      {/* Order Tabs */}
      <OrderTabs />

      {/* Main Content */}
      <Row gutter={16} style={{ flex: 1, overflow: 'hidden' }}>
        <Col span={15} style={{ height: '100%', overflow: 'auto' }}>
          <QuickKeys onAddProduct={handleBarcodeScan} />
          <ProductGrid
            searchText={searchText}
            onSearchChange={setSearchText}
            onAddProduct={handleBarcodeScan}
            onAddService={handleAddService}
          />
        </Col>
        <Col span={9} style={{ height: '100%' }}>
          <CartPanel
            onCheckout={() => {
              if (!isShiftOpen) {
                setShiftOpen(true);
                return;
              }
              setPaymentOpen(true);
            }}
            onHold={() => setHoldOpen(true)}
            onOpenShift={() => setShiftOpen(true)}
            isShiftOpen={isShiftOpen}
          />
        </Col>
      </Row>

      {/* Hardware Status Bar */}
      <HardwareStatusBar />

      {/* Modals */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        shiftId={currentShift?.id}
      />
      <HoldOrderModal open={holdOpen} onClose={() => setHoldOpen(false)} />
      <ShiftModal open={shiftOpen} onClose={() => setShiftOpen(false)} />
      <ExchangeModal open={exchangeOpen} onClose={() => setExchangeOpen(false)} />
      <MergeOrdersModal open={mergeOpen} onClose={() => setMergeOpen(false)} />
      <CloseSessionModal
        open={closeSessionOpen}
        onClose={() => setCloseSessionOpen(false)}
      />
      <ServiceDetailModal
        open={serviceModalOpen}
        onClose={() => { setServiceModalOpen(false); setPendingService(null); }}
        service={pendingService}
      />
    </div>
  );
}
