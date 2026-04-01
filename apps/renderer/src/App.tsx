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
import { AuditLogPage } from '@/pages/Reports/AuditLogPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { ProfilePage } from '@/pages/Profile/ProfilePage';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { UserManagementPage } from '@/pages/Users/UserManagementPage';
import { ExpensesPage } from '@/pages/Expenses/ExpensesPage';
import { SuppliersPage } from '@/pages/Suppliers/SuppliersPage';
import { PnLReportPage } from '@/pages/Reports/PnLReportPage';
import { CashFlowReportPage } from '@/pages/Reports/CashFlowReportPage';
import { APReportPage } from '@/pages/Reports/APReportPage';
import { BranchesPage } from '@/pages/Branches/BranchesPage';
import { StockTransfersPage } from '@/pages/Branches/StockTransfersPage';
import { DemandForecastPage } from '@/pages/Reports/DemandForecastPage';
import { DeadStockPage } from '@/pages/Reports/DeadStockPage';
import { CustomerAnalyticsPage } from '@/pages/Reports/CustomerAnalyticsPage';
import { ComparativeReportPage } from '@/pages/Reports/ComparativeReportPage';

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
              <Route path="reports/audit" element={<AuditLogPage />} />
              <Route path="reports/pnl" element={<PnLReportPage />} />
              <Route path="reports/cashflow" element={<CashFlowReportPage />} />
              <Route path="reports/ap" element={<APReportPage />} />
              <Route path="reports/demand-forecast" element={<DemandForecastPage />} />
              <Route path="reports/dead-stock" element={<DeadStockPage />} />
              <Route path="reports/customer-analytics" element={<CustomerAnalyticsPage />} />
              <Route path="reports/comparative" element={<ComparativeReportPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="branches" element={<BranchesPage />} />
              <Route path="stock-transfers" element={<StockTransfersPage />} />
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
