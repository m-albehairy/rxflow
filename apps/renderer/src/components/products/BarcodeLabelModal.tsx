import React, { useMemo, useRef, useState } from 'react';
import {
  Modal, InputNumber, Radio, Button, Space, Typography, Divider, Empty,
} from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { BarcodeLabelPrint } from './BarcodeLabelPrint';
import './barcode-print-styles.css';

const { Text } = Typography;

interface Product {
  id: string;
  barcode?: string;
  nameEn: string;
  nameAr: string;
  defaultSellingPrice: string | number;
  trackExpiry?: boolean;
}

interface BarcodeLabelModalProps {
  open: boolean;
  onClose: () => void;
  selectedProducts: Product[];
}

export function BarcodeLabelModal({ open, onClose, selectedProducts }: BarcodeLabelModalProps) {
  const { t } = useTranslation('products');
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [labelSize, setLabelSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [barcodeFormat, setBarcodeFormat] = useState<'CODE128' | 'EAN13'>('CODE128');
  const printRef = useRef<HTMLDivElement>(null);

  const getQuantity = (id: string) => quantities[id] || 1;

  const setQuantity = (id: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [id]: value }));
  };

  const totalLabels = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + getQuantity(p.id), 0),
    [selectedProducts, quantities],
  );

  const previewProducts = selectedProducts.slice(0, 4);
  const previewQuantities: Record<string, number> = {};
  previewProducts.forEach((p) => {
    previewQuantities[p.id] = 1;
  });

  const handlePrint = () => {
    if (!printRef.current) return;
    // Add the overlay class to the print container
    printRef.current.classList.add('barcode-print-overlay');
    printRef.current.style.display = 'block';
    window.print();
    // Cleanup after print
    setTimeout(() => {
      if (printRef.current) {
        printRef.current.classList.remove('barcode-print-overlay');
        printRef.current.style.display = 'none';
      }
    }, 500);
  };

  return (
    <>
      <Modal
        title={t('printLabels', 'Print Labels')}
        open={open}
        onCancel={onClose}
        width={720}
        destroyOnHidden
        footer={
          <Space>
            <Button onClick={onClose}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              disabled={selectedProducts.length === 0}
            >
              {t('printLabels', 'Print Labels')} ({totalLabels})
            </Button>
          </Space>
        }
      >
        {/* Selected products with quantity inputs */}
        <div style={{ marginBottom: 16 }}>
          <Text strong>{t('selectedProducts', 'Selected Products')} ({selectedProducts.length})</Text>
          <div
            style={{
              maxHeight: 200,
              overflowY: 'auto',
              marginTop: 8,
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              padding: 8,
            }}
          >
            {selectedProducts.length === 0 ? (
              <Empty description={t('selectedProducts', 'No products selected')} />
            ) : (
              selectedProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 8px',
                    borderBottom: '1px solid #fafafa',
                  }}
                >
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Text ellipsis style={{ display: 'block', fontSize: 13 }}>
                      {isAr ? product.nameAr : product.nameEn}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {product.barcode || t('noBarcode', 'No barcode')}
                    </Text>
                  </div>
                  <Space size="small" align="center">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t('labelQuantity', 'Qty')}:
                    </Text>
                    <InputNumber
                      min={1}
                      max={200}
                      value={getQuantity(product.id)}
                      onChange={(v) => setQuantity(product.id, v || 1)}
                      size="small"
                      style={{ width: 70 }}
                    />
                  </Space>
                </div>
              ))
            )}
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Configuration options */}
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              {t('labelSize', 'Label Size')}
            </Text>
            <Radio.Group
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="small">{t('labelSmall', 'Small (30x20mm)')}</Radio.Button>
              <Radio.Button value="medium">{t('labelMedium', 'Medium (50x30mm)')}</Radio.Button>
              <Radio.Button value="large">{t('labelLarge', 'Large (70x40mm)')}</Radio.Button>
            </Radio.Group>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              {t('barcodeFormat', 'Barcode Format')}
            </Text>
            <Radio.Group
              value={barcodeFormat}
              onChange={(e) => setBarcodeFormat(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="CODE128">Code 128</Radio.Button>
              <Radio.Button value="EAN13">EAN-13</Radio.Button>
            </Radio.Group>
          </div>

          <div>
            <Text strong>{t('totalLabels', 'Total Labels')}: {totalLabels}</Text>
          </div>
        </Space>

        <Divider style={{ margin: '12px 0' }} />

        {/* Preview area */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            {t('printPreview', 'Print Preview')}
          </Text>
          <div
            style={{
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              padding: 12,
              background: '#fafafa',
              minHeight: 100,
              overflowX: 'auto',
            }}
          >
            {previewProducts.length > 0 ? (
              <BarcodeLabelPrint
                products={previewProducts}
                quantities={previewQuantities}
                labelSize={labelSize}
                barcodeFormat={barcodeFormat}
              />
            ) : (
              <Empty description={t('selectedProducts', 'No products selected')} />
            )}
          </div>
        </div>
      </Modal>

      {/* Hidden full print container */}
      <div
        ref={printRef}
        style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 99999 }}
      >
        <BarcodeLabelPrint
          products={selectedProducts}
          quantities={quantities}
          labelSize={labelSize}
          barcodeFormat={barcodeFormat}
        />
      </div>
    </>
  );
}
