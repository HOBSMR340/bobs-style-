import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PieChart,
  MapPin,
  Package,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { orders, products, formatPrice, notify } = useStore();
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  // Revenue calculation
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const averageBasket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Best selling products calculation
  const productSalesMap: Record<string, { name: string; units: number; revenue: number }> = {};

  orders.forEach((ord) => {
    if (ord.status === 'cancelled') return;
    ord.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          units: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.productId].units += item.quantity;
      productSalesMap[item.productId].revenue += item.totalPrice;
    });
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  // Sales by Wilaya
  const wilayaMap: Record<string, { count: number; total: number }> = {};
  orders.forEach((ord) => {
    const w = ord.shippingAddress.wilaya || 'Autres';
    if (!wilayaMap[w]) wilayaMap[w] = { count: 0, total: 0 };
    wilayaMap[w].count += 1;
    wilayaMap[w].total += ord.totalAmount;
  });

  const topWilayas = Object.entries(wilayaMap)
    .map(([wilaya, data]) => ({ wilaya, ...data }))
    .sort((a, b) => b.total - a.total);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'Numero_Commande,Date,Client,Telephone,Wilaya,Articles_Qte,Total_DZD,Statut,Paiement\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.orderNumber}","${new Date(o.createdAt).toLocaleDateString()}","${o.customerName}","${o.customerPhone}","${o.shippingAddress.wilaya}","${o.items.reduce((s, i) => s + i.quantity, 0)}","${o.totalAmount}","${o.status}","${o.paymentMethod}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hobs_rapport_ventes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('success', 'Rapport exporté au format CSV (Excel) avec succès !');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950">
            Statistiques & Rapports Financiers
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Indicateurs de performance commerciale, top des ventes et distribution géographique.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-black transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exporter en CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Revenu Global Encaissé
          </span>
          <div className="text-2xl font-black text-neutral-950 font-mono mt-2">
            {formatPrice(totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Basé sur {orders.length} commandes validées
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Panier Moyen Client
          </span>
          <div className="text-2xl font-black text-neutral-950 font-mono mt-2">
            {formatPrice(averageBasket)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Moyenne des paniers hors frais de port
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Taux de Conversion Wilayas
          </span>
          <div className="text-2xl font-black text-neutral-950 mt-2">
            58 Wilayas
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            100% de couverture nationale active
          </div>
        </div>
      </div>

      {/* Grid: Top products & Top Wilayas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best sellers */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-sm font-extrabold text-neutral-950 flex items-center gap-2">
              <Package className="w-4 h-4 text-neutral-600" />
              <span>Articles les Plus Vendus (Top 5)</span>
            </h2>
            <span className="text-xs text-neutral-400">Volume</span>
          </div>

          <div className="space-y-3">
            {topSellingProducts.map((prod, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-neutral-900 line-clamp-1">
                      {prod.name}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-medium">
                      {prod.units} unités écoulées
                    </div>
                  </div>
                </div>

                <div className="font-bold font-mono text-neutral-950">
                  {formatPrice(prod.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wilaya Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-sm font-extrabold text-neutral-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neutral-600" />
              <span>Répartition des Ventes par Wilaya</span>
            </h2>
            <span className="text-xs text-neutral-400">Destination</span>
          </div>

          <div className="space-y-3">
            {topWilayas.map((item, idx) => (
              <div
                key={item.wilaya}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-neutral-900">
                    {item.wilaya}
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    ({item.count} commande{item.count > 1 ? 's' : ''})
                  </span>
                </div>

                <div className="font-bold font-mono text-neutral-950">
                  {formatPrice(item.total)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
