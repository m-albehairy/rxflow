import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUIStore } from '@/store/ui.store';

const { Content } = Layout;

export function AppLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--app-color-bg-container)' }}>
      <Sidebar />
      <Layout style={{ background: 'var(--app-color-bg-layout)' }}>
        <Topbar />
        <Content
          style={{
            margin: 16,
            padding: 24,
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
            background: 'var(--app-color-bg-container)',
            borderRadius: 8,
            boxShadow: 'var(--app-shadow)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
