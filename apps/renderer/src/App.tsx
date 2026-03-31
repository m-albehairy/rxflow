import { ConfigProvider, App as AntApp, theme } from 'antd';
import { Routes, Route, Navigate } from 'react-router-dom';
import enUS from 'antd/locale/en_US';
import arEG from 'antd/locale/ar_EG';
import { useUIStore } from '@/store/ui.store';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

// Pages
import { SetupWizard } from '@/pages/Setup/SetupWizard';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { POSPage } from '@/pages/POS/POSPage';
import { ProductsPage } from '@/pages/Products/ProductsPage';
import { InventoryPage } from '@/pages/Inventory/InventoryPage';
import { PurchasesPage } from '@/pages/Purchases/PurchasesPage';
import { CustomersPage } from '@/pages/Customers/CustomerList';
import { SalesReportPage } from '@/pages/Reports/SalesReportPage';
import { ProfitReportPage } from '@/pages/Reports/ProfitReportPage';
import { InventoryReportPage } from '@/pages/Reports/InventoryReportPage';
import { ARReportPage } from '@/pages/Reports/ARReportPage';
import { ShiftReportPage } from '@/pages/Reports/ShiftReportPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { ProfilePage } from '@/pages/Profile/ProfilePage';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { UserManagementPage } from '@/pages/Users/UserManagementPage';

function App() {
  const language = useUIStore((s) => s.language);
  const isAr = language === 'ar';

  return (
    <ThemeProvider>
      <ConfigProvider
        locale={isAr ? arEG : enUS}
        direction={isAr ? 'rtl' : 'ltr'}
      >
        <AntApp>
          <Routes>
            <Route path="/setup" element={<SetupWizard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="pos" element={<POSPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="purchases" element={<PurchasesPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="reports" element={<Navigate to="/reports/sales" replace />} />
              <Route path="reports/sales" element={<SalesReportPage />} />
              <Route path="reports/profit" element={<ProfitReportPage />} />
              <Route path="reports/inventory" element={<InventoryReportPage />} />
              <Route path="reports/ar" element={<ARReportPage />} />
              <Route path="reports/shifts" element={<ShiftReportPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </AntApp>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;
