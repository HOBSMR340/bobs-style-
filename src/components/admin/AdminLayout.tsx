import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Tag,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  ShieldAlert,
  Store,
  Menu,
  X,
  UserCheck,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const {
    t,
    currentUser,
    setCurrentUser,
    setCurrentView,
    orders,
    products,
    settings,
  } = useStore();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Counts for badge alerts
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => {
    const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
    return totalStock <= (p.minStockThreshold || 6);
  }).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products',
      label: 'Produits & Catalogue',
      icon: Package,
      badge: null,
    },
    {
      id: 'stock',
      label: 'Stock & Mouvements',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} alerte${lowStockCount > 1 ? 's' : ''}` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'prices',
      label: 'Tarifs & Promotions',
      icon: Tag,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Commandes',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} nouv.` : null,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'customers',
      label: 'Clients & CRM',
      icon: Users,
      badge: null,
    },
    {
      id: 'reports',
      label: 'Rapports & Ventes',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'users',
      label: 'Équipe & Rôles',
      icon: ShieldAlert,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Configuration Magasin',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div id="admin-root-layout" className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="bg-neutral-900 text-white sticky top-0 z-30 border-b border-neutral-800">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Admin Brand */}
            <div className="flex items-center gap-3">
              <div className="bg-amber-400 text-neutral-950 font-black text-xs px-2 py-1 rounded">
                BACK-OFFICE
              </div>
              <div className="hidden sm:block text-sm font-bold tracking-wider">
                {settings.storeName}
              </div>
            </div>
          </div>

          {/* Right Admin Controls */}
          <div className="flex items-center gap-4">
            {/* Quick Role Switcher for instant simulation of Super Admin vs Stock Manager vs Sales Rep */}
            <div className="hidden md:flex items-center gap-2 bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-400">Rôle :</span>
              <select
                value={currentUser.role}
                onChange={(e) => {
                  const role = e.target.value as any;
                  const roleNames = {
                    super_admin: 'Administrateur Principal',
                    stock_manager: 'Responsable Stock',
                    sales_rep: 'Agent des Ventes',
                    viewer: 'Auditeur Consultation',
                  };
                  setCurrentUser({
                    ...currentUser,
                    role,
                    name: roleNames[role],
                  });
                }}
                className="bg-transparent border-none text-white text-xs font-semibold focus:outline-none cursor-pointer pr-2"
              >
                <option value="super_admin" className="bg-neutral-900">
                  Super Admin (Tous droits)
                </option>
                <option value="stock_manager" className="bg-neutral-900">
                  Gestionnaire Stock (Stock & Produits)
                </option>
                <option value="sales_rep" className="bg-neutral-900">
                  Vendeur (Commandes & Clients)
                </option>
              </select>
            </div>

            {/* Back to Client Store Button */}
            <button
              onClick={() => setCurrentView('shop')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-bold transition-all shadow-sm"
            >
              <Store className="w-4 h-4" />
              <span>Voir la boutique</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200 shrink-0">
          {/* User profile card */}
          <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-900 text-amber-400 flex items-center justify-center font-bold text-sm">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-neutral-900 truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold uppercase">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-neutral-950 text-white shadow-md'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.badgeColor || 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer note */}
          <div className="p-4 border-t border-neutral-100 text-[11px] text-neutral-400">
            <div>HOBS Admin v2.4.0</div>
            <div>Sync: Données locales en direct</div>
          </div>
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div
              className="w-64 max-w-full bg-white h-full shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <div className="font-bold text-sm text-neutral-900">Menu Administration</div>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-neutral-950 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Admin Content View Area */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
