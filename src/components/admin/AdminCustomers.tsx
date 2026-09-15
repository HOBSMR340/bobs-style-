import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Customer } from '../../types';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ShoppingBag,
  Award,
  Crown,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { customers, orders, formatPrice } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.wilaya.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platine':
        return { label: 'Platine VIP', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'or':
        return { label: 'Client Or', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'argent':
        return { label: 'Client Argent', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
      default:
        return { label: 'Standard', bg: 'bg-neutral-100 text-neutral-800 border-neutral-200' };
    }
  };

  // Find customer orders
  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) =>
          o.customerPhone === selectedCustomer.phone ||
          o.customerName.toLowerCase() === selectedCustomer.fullName.toLowerCase()
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950">
            Fichier Clients & Fidélité (CRM)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Historique d'achat par client, segmentation et coordonnées de livraison.
          </p>
        </div>

        <div className="text-xs font-semibold text-neutral-500">
          Base : <strong>{customers.length} clients</strong> enregistrés
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, wilaya..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-neutral-950"
          />
        </div>
      </div>

      {/* Customer table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Wilaya</th>
                <th className="py-3 px-4">Total Commandes</th>
                <th className="py-3 px-4">Chiffre d'Affaires</th>
                <th className="py-3 px-4">Niveau Fidélité</th>
                <th className="py-3 px-4 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.map((c) => {
                const tier = getTierBadge(c.tier);
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      {c.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      {c.phone}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {c.wilaya}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      {c.orderCount} commande{c.orderCount > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-neutral-950">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tier.bg}`}>
                        {tier.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        className="text-neutral-900 font-bold hover:underline"
                      >
                        Consulter
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-base">
                  {selectedCustomer.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-950">
                    {selectedCustomer.fullName}
                  </h2>
                  <div className="text-xs text-neutral-500 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedCustomer.phone}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedCustomer.wilaya}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Total Dépensé</div>
                <div className="text-base font-black text-neutral-950 font-mono mt-0.5">
                  {formatPrice(selectedCustomer.totalSpent)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Commandes</div>
                <div className="text-base font-black text-neutral-950 mt-0.5">
                  {selectedCustomer.orderCount}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Statut Client</div>
                <div className="text-xs font-black text-emerald-700 mt-1 uppercase">
                  {selectedCustomer.tier}
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="space-y-3">
              <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                Historique des commandes de ce client
              </h3>

              {customerOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400 border rounded-xl">
                  Aucune commande récente liée à ce numéro.
                </div>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl border border-neutral-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-neutral-900">
                          #{ord.orderNumber}
                        </div>
                        <div className="text-neutral-500 text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.status}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-neutral-950">
                          {formatPrice(ord.totalAmount)}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {ord.items.length} article(s)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
