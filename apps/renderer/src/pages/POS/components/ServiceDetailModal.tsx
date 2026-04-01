import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Select, InputNumber, Button, Space, Typography, Divider } from 'antd';
import { MedicineBoxOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cart.store';
import { useUIStore } from '@/store/ui.store';
import { usersApi } from '@/api/users.api';

const { Text, Title } = Typography;

interface ServiceData {
  id: string;
  nameEn: string;
  nameAr: string;
  defaultPrice: string;
  minPrice: string | null;
  maxPrice: string | null;
  pricingMode: string;
  durationMinutes: number | null;
  requiresPatientInfo: boolean;
  requiresNotes: boolean;
  serviceType: string;
  taxable: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  service: ServiceData | null;
}

export function ServiceDetailModal({ open, onClose, service }: Props) {
  const { t } = useTranslation('pos');
  const language = useUIStore((s) => s.language);
  const addItem = useCartStore((s) => s.addItem);

  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedPerformerId, setSelectedPerformerId] = useState<string | null>(null);
  const [selectedPerformerName, setSelectedPerformerName] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [performers, setPerformers] = useState<Array<{ id: string; fullName?: string; fullNameAr?: string; username: string }>>([]);
  const [performersLoading, setPerformersLoading] = useState(false);

  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && service) {
      setPrice(parseFloat(service.defaultPrice) || 0);
      setQuantity(1);
      setPatientName('');
      setPatientPhone('');
      setSelectedPerformerId(null);
      setSelectedPerformerName(null);
      setNotes('');
      loadPerformers();
    }
  }, [open, service]);

  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 100);
    }
  }, [open]);

  const loadPerformers = async () => {
    setPerformersLoading(true);
    try {
      const res = await usersApi.list({ active: true, limit: 100 }) as { data?: Array<{ id: string; fullName?: string; fullNameAr?: string; username: string }> };
      setPerformers(res?.data || []);
    } catch {
      setPerformers([]);
    } finally {
      setPerformersLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!service) return;

    addItem({
      itemType: 'service' as const,
      productId: `svc-${service.id}`,
      serviceId: service.id,
      barcode: null,
      nameEn: service.nameEn,
      nameAr: service.nameAr,
      quantity: String(quantity),
      cost: '0',
      suggestedPrice: service.defaultPrice,
      sellingPrice: String(price),
      discountPct: '0',
      lineTotal: String(price * quantity),
      profit: String(price * quantity),
      isBelowCost: false,
      isOverride: price !== parseFloat(service.defaultPrice),
      batchId: null,
      stockAvailable: '-1',
      performerId: selectedPerformerId || null,
      performerName: selectedPerformerName || null,
      patientName: patientName || null,
      patientPhone: patientPhone || null,
      serviceNotes: notes || null,
      serviceDuration: service.durationMinutes,
      isPriceEditable: service.pricingMode === 'EDITABLE',
    });

    onClose();
  };

  if (!service) return null;

  const isEditable = service.pricingMode === 'EDITABLE';
  const serviceName = language === 'ar' ? service.nameAr : service.nameEn;

  return (
    <Modal
      open={open}
      title={
        <Space>
          <MedicineBoxOutlined style={{ color: '#13c2c2' }} />
          <span>{serviceName}</span>
        </Space>
      }
      onCancel={onClose}
      footer={null}
      width={460}
      destroyOnHidden
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0, color: '#13c2c2' }}>
          SAR {parseFloat(service.defaultPrice).toFixed(2)}
        </Title>
        {service.durationMinutes && (
          <Text type="secondary">{service.durationMinutes} min</Text>
        )}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* Price */}
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          {language === 'ar' ? 'السعر' : 'Price'}
        </Text>
        <InputNumber
          value={price}
          onChange={(val) => setPrice(val || 0)}
          min={service.minPrice ? parseFloat(service.minPrice) : 0}
          max={service.maxPrice ? parseFloat(service.maxPrice) : undefined}
          precision={2}
          disabled={!isEditable}
          style={{ width: '100%' }}
          size="large"
        />
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          {language === 'ar' ? 'الكمية' : 'Quantity'}
        </Text>
        <InputNumber
          value={quantity}
          onChange={(val) => setQuantity(val || 1)}
          min={1}
          style={{ width: '100%' }}
        />
      </div>

      {/* Patient Name */}
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          {language === 'ar' ? 'اسم المريض' : 'Patient Name'}
          {service.requiresPatientInfo && <Text type="danger"> *</Text>}
        </Text>
        <Input
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          prefix={<UserOutlined />}
          placeholder={language === 'ar' ? 'أدخل اسم المريض' : 'Enter patient name'}
        />
      </div>

      {/* Patient Phone */}
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          {language === 'ar' ? 'هاتف المريض' : 'Patient Phone'}
        </Text>
        <Input
          value={patientPhone}
          onChange={(e) => setPatientPhone(e.target.value)}
          placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
        />
      </div>

      {/* Performer */}
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          {language === 'ar' ? 'مقدم الخدمة' : 'Performer'}
        </Text>
        <Select
          value={selectedPerformerId}
          onChange={(val, option: any) => {
            setSelectedPerformerId(val);
            setSelectedPerformerName(option?.label || null);
          }}
          loading={performersLoading}
          allowClear
          placeholder={language === 'ar' ? 'اختر مقدم الخدمة' : 'Select performer'}
          style={{ width: '100%' }}
          options={performers.map((u) => ({
            value: u.id,
            label: language === 'ar' ? (u.fullNameAr || u.fullName || u.username) : (u.fullName || u.username),
          }))}
        />
      </div>

      {/* Service Notes */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          {language === 'ar' ? 'ملاحظات' : 'Service Notes'}
          {service.requiresNotes && <Text type="danger"> *</Text>}
        </Text>
        <Input.TextArea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder={language === 'ar' ? 'أدخل ملاحظات الخدمة' : 'Enter service notes'}
        />
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {language === 'ar' ? 'الإجمالي' : 'Total'}
        </Title>
        <Title level={4} style={{ margin: 0, color: '#13c2c2' }}>
          SAR {(price * quantity).toFixed(2)}
        </Title>
      </div>

      <Button
        ref={confirmRef}
        type="primary"
        size="large"
        block
        onClick={handleConfirm}
        disabled={
          (service.requiresPatientInfo && !patientName.trim()) ||
          (service.requiresNotes && !notes.trim())
        }
        style={{ background: '#13c2c2', borderColor: '#13c2c2' }}
      >
        {language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'} - SAR {(price * quantity).toFixed(2)}
      </Button>
    </Modal>
  );
}
