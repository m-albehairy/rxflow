import React, { useRef, useState } from 'react';
import { Card, Row, Col, Form, Input, InputNumber, Select, Switch, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';
import { RECEIPT_PAPER_SIZES } from '@pharmapos/shared';
import { InvoiceReceipt } from '@/pages/POS/components/InvoiceReceipt';
import { FieldLabel } from './SettingsPage';
import '@/pages/POS/components/receipt-print-styles.css';

const SAMPLE_INVOICE = {
  invoiceNumber: 'INV000042',
  createdAt: new Date().toISOString(),
  subtotal: '285.00',
  discountAmount: '14.25',
  discountPct: '5',
  taxAmount: '40.61',
  total: '311.36',
  items: [
    { product: { nameEn: 'Paracetamol 500mg', nameAr: 'باراسيتامول 500مج' }, quantity: '2', sellingPrice: '15.00', discountPct: '0', total: '30.00' },
    { product: { nameEn: 'Amoxicillin 250mg', nameAr: 'أموكسيسيلين 250مج' }, quantity: '1', sellingPrice: '45.00', discountPct: '10', total: '40.50' },
    { product: { nameEn: 'Vitamin C 1000mg', nameAr: 'فيتامين سي 1000مج' }, quantity: '3', sellingPrice: '25.00', discountPct: '0', total: '75.00' },
    { product: { nameEn: 'Omeprazole 20mg', nameAr: 'أوميبرازول 20مج' }, quantity: '1', sellingPrice: '55.00', discountPct: '0', total: '55.00' },
    { product: { nameEn: 'Blood Glucose Strips', nameAr: 'شرائط قياس السكر' }, quantity: '1', sellingPrice: '85.00', discountPct: '5', total: '80.75' },
  ],
  payments: [{ method: 'CASH', amount: '350.00' }],
  cashier: { fullName: 'Ahmed Mohamed' },
  customer: { fullName: 'Mahmoud Ali', phone: '01012345678' },
};

export function PrintSettings({ cardStyle }: { cardStyle: React.CSSProperties }) {
  const { t } = useTranslation('settings');
  const { getSetting } = useSettings();
  const printRef = useRef<HTMLDivElement>(null);
  const [testPaperSize, setTestPaperSize] = useState<string>(getSetting<string>('RECEIPT_PAPER_SIZE') || '80mm');

  const handleTestPrint = () => {
    if (!printRef.current) return;
    printRef.current.classList.add('receipt-print-overlay');
    printRef.current.style.display = 'block';
    window.print();
    setTimeout(() => {
      if (printRef.current) {
        printRef.current.classList.remove('receipt-print-overlay');
        printRef.current.style.display = 'none';
      }
    }, 500);
  };

  const paperSizeOptions = RECEIPT_PAPER_SIZES.map((s) => ({
    label: t(`paper${s.replace('mm', 'mm')}`, s),
    value: s,
  }));

  return (
    <>
      <Card style={cardStyle}>
        {/* General receipt info */}
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<FieldLabel label={t('pharmacyPhone')} description={t('pharmacyPhoneDesc')} />}
              name="PHARMACY_PHONE"
              style={{ marginBottom: 28 }}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<FieldLabel label={t('receiptPaperSize')} description={t('receiptPaperSizeDesc')} />}
              name="RECEIPT_PAPER_SIZE"
              style={{ marginBottom: 28 }}
            >
              <Select options={paperSizeOptions} onChange={(v) => setTestPaperSize(v)} />
            </Form.Item>
          </Col>
        </Row>

        {/* Header text */}
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<FieldLabel label={t('receiptHeader')} description={t('receiptHeaderDesc')} />}
              name="RECEIPT_HEADER"
              style={{ marginBottom: 28 }}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<FieldLabel label={t('receiptHeaderAr')} />}
              name="RECEIPT_HEADER_AR"
              style={{ marginBottom: 28 }}
            >
              <Input.TextArea rows={2} dir="rtl" />
            </Form.Item>
          </Col>
        </Row>

        {/* Footer text */}
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<FieldLabel label={t('receiptFooter')} description={t('receiptFooterDesc')} />}
              name="RECEIPT_FOOTER"
              style={{ marginBottom: 28 }}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<FieldLabel label={t('receiptFooterAr')} />}
              name="RECEIPT_FOOTER_AR"
              style={{ marginBottom: 28 }}
            >
              <Input.TextArea rows={2} dir="rtl" />
            </Form.Item>
          </Col>
        </Row>

        {/* Toggles & copies */}
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              label={<FieldLabel label={t('receiptAutoPrint')} description={t('receiptAutoPrintDesc')} />}
              name="RECEIPT_AUTO_PRINT"
              valuePropName="checked"
              style={{ marginBottom: 28 }}
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<FieldLabel label={t('receiptPrintCopies')} description={t('receiptPrintCopiesDesc')} />}
              name="RECEIPT_PRINT_COPIES"
              style={{ marginBottom: 28 }}
            >
              <InputNumber min={1} max={5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<FieldLabel label={t('receiptShowLogo')} description={t('receiptShowLogoDesc')} />}
              name="RECEIPT_SHOW_LOGO"
              valuePropName="checked"
              style={{ marginBottom: 28 }}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        {/* Test print button */}
        <Button icon={<PrinterOutlined />} onClick={handleTestPrint}>
          {t('testPrint')}
        </Button>
      </Card>

      {/* Hidden print container for test print */}
      <div
        ref={printRef}
        style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 99999 }}
      >
        <InvoiceReceipt
          invoice={SAMPLE_INVOICE}
          pharmacyName={getSetting<string>('PHARMACY_NAME') || 'Pharmacy'}
          pharmacyNameAr={getSetting<string>('PHARMACY_NAME_AR')}
          pharmacyAddress={getSetting<string>('PHARMACY_ADDRESS')}
          pharmacyPhone={getSetting<string>('PHARMACY_PHONE')}
          currency={getSetting<string>('CURRENCY') || 'EGP'}
          headerText={getSetting<string>('RECEIPT_HEADER')}
          headerTextAr={getSetting<string>('RECEIPT_HEADER_AR')}
          footerText={getSetting<string>('RECEIPT_FOOTER')}
          footerTextAr={getSetting<string>('RECEIPT_FOOTER_AR')}
          paperSize={testPaperSize as any}
        />
      </div>
    </>
  );
}
