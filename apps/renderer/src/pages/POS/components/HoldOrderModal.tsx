import React, { useState } from 'react';
import { Modal, Input, List, Button, Typography, Empty, Space, Tag } from 'antd';
import { PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cart.store';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HoldOrderModal({ open, onClose }: Props) {
  const { t } = useTranslation('pos');
  const [label, setLabel] = useState('');
  const heldOrders = useCartStore((s) => s.heldOrders);
  const holdOrder = useCartStore((s) => s.holdOrder);
  const resumeOrder = useCartStore((s) => s.resumeOrder);
  const removeHeldOrder = useCartStore((s) => s.removeHeldOrder);
  const activeTab = useCartStore((s) => s.getActiveTab());

  const handleHold = () => {
    holdOrder(label || `Order ${new Date().toLocaleTimeString()}`);
    setLabel('');
  };

  return (
    <Modal open={open} title={t('holdOrder')} onCancel={onClose} footer={null} width={500}>
      {activeTab.items.length > 0 && (
        <Space style={{ width: '100%', marginBottom: 16 }}>
          <Input
            placeholder="Order label..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onPressEnter={handleHold}
            style={{ flex: 1 }}
          />
          <Button type="primary" onClick={handleHold}>
            {t('holdOrder')}
          </Button>
        </Space>
      )}

      {heldOrders.length === 0 ? (
        <Empty description="No held orders" />
      ) : (
        <List
          dataSource={heldOrders}
          renderItem={(order) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => { resumeOrder(order.id); onClose(); }}
                >
                  {t('resumeOrder')}
                </Button>,
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeHeldOrder(order.id)}
                />,
              ]}
            >
              <List.Item.Meta
                title={order.label}
                description={
                  <Space>
                    <Tag>{order.items.length} items</Tag>
                    <Text type="secondary">{new Date(order.createdAt).toLocaleTimeString()}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}
