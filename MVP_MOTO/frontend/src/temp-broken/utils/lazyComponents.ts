// Lazy Loading de Componentes
// Sistema de Gestão de Oficina Mecânica de Motos

import { lazy } from 'react';

// Lazy loading das páginas principais
export const LazyDashboardPage = lazy(() => import('@/pages/DashboardPage'));
export const LazyInventoryPage = lazy(() => import('@/pages/Inventory'));
export const LazyFinancialPage = lazy(() => import('@/pages/Financial'));
export const LazyReportsPage = lazy(() => import('@/pages/Reports'));
export const LazySettingsPage = lazy(() => import('@/pages/Settings'));
export const LazyNotificationsPage = lazy(() => import('@/pages/NotificationsPage'));

// Lazy loading de componentes pesados
export const LazyNotificationCenter = lazy(() => 
  import('@/components/Notifications/NotificationCenter').then(module => ({
    default: module.NotificationCenter
  }))
);

export const LazyDataTable = lazy(() => 
  import('@/components/ui/DataTable').then(module => ({
    default: module.DataTable
  }))
);

export const LazyChartComponents = {
  LineChart: lazy(() => import('recharts').then(module => ({ default: module.LineChart }))),
  BarChart: lazy(() => import('recharts').then(module => ({ default: module.BarChart }))),
  PieChart: lazy(() => import('recharts').then(module => ({ default: module.PieChart }))),
  AreaChart: lazy(() => import('recharts').then(module => ({ default: module.AreaChart }))),
};

// Lazy loading de modais pesados
export const LazyModals = {
  ClientModal: lazy(() => 
    import('@/components/Clients/ClientModal').then(module => ({
      default: module.ClientModal
    }))
  ),
  ServiceOrderModal: lazy(() => 
    import('@/components/ServiceOrders/ServiceOrderModal').then(module => ({
      default: module.ServiceOrderModal
    }))
  ),
  SaleModal: lazy(() => 
    import('@/components/Sales/SaleModal').then(module => ({
      default: module.SaleModal
    }))
  ),
  ProductModal: lazy(() => 
    import('@/components/Products/ProductModal').then(module => ({
      default: module.ProductModal
    }))
  ),
};

// Lazy loading de formulários complexos
export const LazyForms = {
  ClientForm: lazy(() => 
    import('@/components/Clients/ClientForm').then(module => ({
      default: module.ClientForm
    }))
  ),
  ServiceOrderForm: lazy(() => 
    import('@/components/ServiceOrders/ServiceOrderForm').then(module => ({
      default: module.ServiceOrderForm
    }))
  ),
  SaleForm: lazy(() => 
    import('@/components/Sales/SaleForm').then(module => ({
      default: module.SaleForm
    }))
  ),
  ProductForm: lazy(() => 
    import('@/components/Products/ProductForm').then(module => ({
      default: module.ProductForm
    }))
  ),
};

// Lazy loading de relatórios
export const LazyReports = {
  SalesReport: lazy(() => 
    import('@/components/Reports/SalesReport').then(module => ({
      default: module.SalesReport
    }))
  ),
  InventoryReport: lazy(() => 
    import('@/components/Reports/InventoryReport').then(module => ({
      default: module.InventoryReport
    }))
  ),
  FinancialReport: lazy(() => 
    import('@/components/Reports/FinancialReport').then(module => ({
      default: module.FinancialReport
    }))
  ),
  ServiceOrderReport: lazy(() => 
    import('@/components/Reports/ServiceOrderReport').then(module => ({
      default: module.ServiceOrderReport
    }))
  ),
};

// Lazy loading de componentes de impressão
export const LazyPrintComponents = {
  ServiceOrderPrint: lazy(() => 
    import('@/components/Print/ServiceOrderPrint').then(module => ({
      default: module.ServiceOrderPrint
    }))
  ),
  SalePrint: lazy(() => 
    import('@/components/Print/SalePrint').then(module => ({
      default: module.SalePrint
    }))
  ),
  ReceiptPrint: lazy(() => 
    import('@/components/Print/ReceiptPrint').then(module => ({
      default: module.ReceiptPrint
    }))
  ),
};

// HOC para adicionar loading fallback
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <React.Suspense fallback={fallback || <div>Carregando...</div>}>
      <Component {...props} />
    </React.Suspense>
  );
};

// Hook para preload de componentes
export const usePreloadComponent = () => {
  const preloadComponent = (componentImport: () => Promise<any>) => {
    // Preload apenas se não estiver em desenvolvimento
    if (process.env.NODE_ENV === 'production') {
      componentImport();
    }
  };

  return { preloadComponent };
};