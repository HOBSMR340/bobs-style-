import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Truck,
  Plus,
  ArrowRight,
  Boxes,
  Users,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const {
    formatPrice,
    orders,
    products,
    customers,
    updateOrderStatus,
  } = useStore();

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const totalStockUnits = products.reduce(
    (sum, p) => sum + p.variants.reduce((vSum, v) => vSum + v.stock, 0),
    0
  );

  const lowStockProducts = products.filter((p) => {
    const total = p.variants.reduce((sum, v) => sum + v.stock, 0);
    return total <= (p.minStockThreshold || 6);
  });

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950 tracking-tight">
            Tableau de Bord & Vue d'Ensemble
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Suivi en temps réel des ventes, commandes, réapprovisionnements et performances de la boutique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('products')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-black transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un produit</span>
          </button>
          <button
            onClick={() => onNavigateTab('stock')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-800 text-xs font-bold hover:bg-neutral-50 transition-colors"
          >
            <Boxes className="w-4 h-4" />
            <span>Gérer le stock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Chiffre d'Affaires
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-neutral-950">
              {formatPrice(totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% ce mois</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Commandes Reçues
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-neutral-950">
              {orders.length}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              <strong className="text-amber-600">{pendingOrders.length}</strong> à valider immédiatement
            </div>
          </div>
        </div>

        {/* Total Stock */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Articles en Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-neutral-950">
              {totalStockUnits} pièces
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Réparties sur {products.length} références actives
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Alertes Stock Faible
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-amber-600">
              {lowStockProducts.length} références
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Seuil critique atteint (&le; 6 unités)
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-neutral-950">
                Commandes Récentes
              </h2>
              <p className="text-xs text-neutral-500">
                Dernières transactions enregistrées sur la plateforme
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">N° Commande</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Wilaya</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3 text-right">Action rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-neutral-900">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 font-medium text-neutral-800">
                      {order.customerName}
                    </td>
                    <td className="py-3 text-neutral-500">
                      {order.shippingAddress.wilaya}
                    </td>
                    <td className="py-3 font-bold text-neutral-950">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {order.status === 'pending' ? (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="px-2.5 py-1 rounded bg-neutral-900 text-white font-bold text-[10px] hover:bg-black"
                        >
                          Confirmer
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigateTab('orders')}
                          className="text-neutral-500 hover:text-neutral-900 text-[11px] underline font-medium"
                        >
                          Détails
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Urgent Low Stock Restock Panel */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-neutral-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Priorité Réassort</span>
            </h2>
            <button
              onClick={() => onNavigateTab('stock')}
              className="text-xs font-bold text-neutral-900 hover:underline"
            >
              Gérer
            </button>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                Aucune alerte de stock. Tout est approvisionné.
              </div>
            ) : (
              lowStockProducts.slice(0, 4).map((product) => {
                const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                return (
                  <div
                    key={product.id}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name.fr}
                        className="w-10 h-10 object-contain rounded bg-white p-0.5 border"
                      />
                      <div>
                        <div className="text-xs font-bold text-neutral-900 line-clamp-1">
                          {product.name.fr}
                        </div>
                        <div className="text-[11px] text-amber-700 font-semibold">
                          Il ne reste que {totalStock} unité{totalStock > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('stock')}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold shrink-0"
                    >
                      Réapprovisionner
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick stats snapshot */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2 mt-4">
            <div className="flex justify-between text-neutral-600">
              <span>Clients enregistrés</span>
              <strong className="text-neutral-950">{customers.length}</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Wilayas livrées</span>
              <strong className="text-neutral-950">58 / 58</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Paiement à la livraison</span>
              <strong className="text-emerald-700 font-bold">Actif</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
