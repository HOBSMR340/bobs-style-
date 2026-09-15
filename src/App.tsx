/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { NotificationToast } from './components/common/NotificationToast';
import { HomeView } from './components/shop/HomeView';
import { ProductCatalogView } from './components/shop/ProductCatalogView';
import { ProductDetailModal } from './components/shop/ProductDetailModal';
import { CartDrawer } from './components/shop/CartDrawer';
import { CheckoutModal } from './components/shop/CheckoutModal';
import { ClientAccountModal } from './components/shop/ClientAccountModal';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminStock } from './components/admin/AdminStock';
import { AdminPrices } from './components/admin/AdminPrices';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminCustomers } from './components/admin/AdminCustomers';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminUsers } from './components/admin/AdminUsers';

const MainContent: React.FC = () => {
  const { currentView, shopCategory, searchQuery } = useStore();
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  if (currentView === 'admin') {
    return (
      <AdminLayout activeTab={adminTab} setActiveTab={setAdminTab}>
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={setAdminTab} />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'stock' && <AdminStock />}
        {adminTab === 'prices' && <AdminPrices />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'customers' && <AdminCustomers />}
        {adminTab === 'reports' && <AdminReports />}
        {adminTab === 'settings' && <AdminSettings />}
        {adminTab === 'users' && <AdminUsers />}
      </AdminLayout>
    );
  }

  // Shop View: If browsing a category or has an active search, display Catalog. Otherwise display HomeView.
  const isBrowsingCatalog = Boolean(shopCategory || searchQuery.trim());

  return (
    <div id="shop-root" className="min-h-screen flex flex-col bg-white text-neutral-900">
      <Header />
      <main className="flex-1">
        {isBrowsingCatalog ? <ProductCatalogView /> : <HomeView />}
      </main>
      <Footer />

      {/* Global Interactive Overlays & Modals */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <ClientAccountModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
      <NotificationToast />
    </StoreProvider>
  );
}
